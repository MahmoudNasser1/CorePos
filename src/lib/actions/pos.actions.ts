"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { canCreateInvoice } from "@/lib/plan-limits"

export interface POSSaleItem {
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

export async function createPOSInvoice(data: {
  customer_id: string | null
  items: POSSaleItem[]
  total_amount: number
  tax_amount: number
  discount_amount: number
  payment_method: 'cash' | 'card' | 'deferred'
  company_id?: string
  branch_id?: string
}) {
  const supabase = await createClient()

  // 1. Get current user for auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("غير مصرح لك بالقيام بهذه العملية")

  let companyId = data.company_id
  let branchId = data.branch_id

  // fallback to DB if not provided (though we aim to pass it from frontend)
  if (!companyId || !branchId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, branch_id')
      .eq('id', user.id)
      .single()
    
    companyId = companyId || profile?.company_id
    branchId = branchId || profile?.branch_id
  }

  if (!companyId) throw new Error("لم يتم العثور على بيانات المنشأة")

  // Check plan limits
  const allowed = await canCreateInvoice(companyId)
  if (!allowed) {
    return { 
      success: false, 
      error: "لقد وصلت للحد الأقصى للفواتير المسموح بها في خطتك الحالية. يرجى ترقية الاشتراك." 
    }
  }

  const { data: warehouse } = await supabase
    .from('warehouses')
    .select('id')
    .eq('branch_id', branchId || '')
    .eq('is_default', true)
    .maybeSingle()

  const { data: treasury } = await supabase
    .from('treasuries')
    .select('id')
    .eq('company_id', companyId)
    .eq('is_default', true)
    .maybeSingle()

  if (!warehouse?.id) {
    return { success: false, error: "لا يوجد مخزن افتراضي مهيأ لهذا الفرع." }
  }

  if (data.payment_method !== 'deferred' && !treasury?.id) {
    return { success: false, error: "لا توجد خزينة افتراضية مهيأة لهذا الفرع." }
  }

  const warehouseId = warehouse.id
  const treasuryId = treasury?.id || null

  // 2. Call the existing Finance RPC to create a sale invoice atomically.
  const { data: invoiceId, error: rpcError } = await supabase.rpc('create_sale_invoice', {
    p_invoice: {
      company_id: companyId,
      branch_id: branchId || '00000000-0000-0000-0000-000000000000',
      warehouse_id: warehouseId,
      customer_id: data.customer_id,
      cashier_id: user.id,
      status: data.payment_method === 'deferred' ? 'partial' : 'paid',
      subtotal: data.total_amount - data.tax_amount + data.discount_amount,
      discount_type: 'amount',
      discount_value: data.discount_amount,
      discount_amount: data.discount_amount,
      tax_rate: 0,
      tax_amount: data.tax_amount,
      total: data.total_amount,
      paid: data.payment_method === 'deferred' ? 0 : data.total_amount,
      remaining: data.payment_method === 'deferred' ? data.total_amount : 0,
      notes: 'POS Sale'
    },
    p_items: data.items.map((item) => ({
      product_id: item.product_id,
      warehouse_id: warehouseId,
      qty: item.quantity,
      unit_price: item.unit_price,
      cost_price: 0,
      discount_type: 'amount',
      discount_value: 0,
      discount_amount: 0,
      total_line: item.subtotal,
      profit: 0,
      notes: null
    })),
    p_payments: data.payment_method === 'deferred'
      ? []
      : [{
          treasury_id: treasuryId,
          method: data.payment_method,
          amount: data.total_amount,
          notes: 'POS Payment'
        }]
  })

  if (rpcError) {
    console.error('POS RPC Error:', rpcError)
    return { success: false, error: rpcError.message }
  }

  // 3. Revalidate paths to update reports/stock
  revalidatePath('/dashboard/pos')
  revalidatePath('/dashboard/inventory')
  revalidatePath('/dashboard/sales')

  const { data: invoiceRow, error: invoiceFetchError } = await supabase
    .from('invoices')
    .select('id, invoice_number')
    .eq('id', invoiceId)
    .single()

  if (invoiceFetchError) {
    return { success: true, invoiceId, invoiceNumber: null }
  }

  return {
    success: true,
    invoiceId: invoiceRow.id,
    invoiceNumber: invoiceRow.invoice_number
  }
}

export async function getCustomers(search: string = "") {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  let query = supabase
    .from('customers')
    .select('id, name, phone, balance')
    .eq('company_id', profile.company_id)
    .eq('is_active', true)
    
  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, error } = await query.limit(10)
  
  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }

  return data
}

export async function getProductByBarcode(barcode: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const { data, error } = await supabase
    .from('products')
    .select('id, name, price1')
    .eq('company_id', profile.company_id)
    .eq('barcode', barcode)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  const { data: stockRows } = await supabase
    .from('product_stock')
    .select('qty')
    .eq('product_id', data.id)

  const totalStock = (stockRows || []).reduce((sum, row) => sum + Number(row.qty || 0), 0)

  return {
    id: data.id,
    name: data.name,
    unit_price: data.price1,
    stock: totalStock
  }
}

// ────────────────────────────────────────
// 3. Held Carts (سلال البيع المعلقة)
// ────────────────────────────────────────

export async function saveHeldCart(payload: {
  customer_id: string | null
  items: any[]
  total: number
  notes?: string
  branch_id: string
  company_id: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('pos_hold_carts')
    .insert({
      company_id: payload.company_id,
      branch_id: payload.branch_id,
      customer_id: payload.customer_id,
      items: payload.items,
      total: payload.total,
      notes: payload.notes,
      created_by: user.id
    })
    .select()
    .single()

  if (error) throw error
  return { success: true, cart: data }
}

export async function getHeldCarts(companyId: string, branchId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pos_hold_carts')
    .select(`
      *,
      customers(name)
    `)
    .eq('company_id', companyId)
    .eq('branch_id', branchId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function deleteRemoteHeldCart(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('pos_hold_carts')
    .delete()
    .eq('id', id)

  if (error) throw error
  return { success: true }
}
