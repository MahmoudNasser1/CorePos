"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getInvoices(filters?: {
  type?: string
  status?: string
  customer_id?: string
  supplier_id?: string
  from?: string
  to?: string
}) {
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
    .from('invoices')
    .select(`
      *,
      customers(name),
      suppliers(name),
      profiles!cashier_id(full_name)
    `)
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id)
  if (filters?.supplier_id) query = query.eq('supplier_id', filters.supplier_id)
  if (filters?.from) query = query.gte('date', filters.from)
  if (filters?.to) query = query.lte('date', filters.to)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  return data
}

export async function getInvoiceById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customers(*),
      suppliers(*),
      invoice_items(*, products(*)),
      profiles!cashier_id(full_name),
      payments(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createSaleInvoice(invoiceData: any, items: any[], payments: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, branch_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error("No company found")

  const { data, error } = await supabase.rpc('create_sale_invoice', {
    p_invoice: {
      ...invoiceData,
      company_id: profile.company_id,
      branch_id: profile.branch_id,
      cashier_id: user.id
    },
    p_items: items,
    p_payments: payments
  })

  if (error) throw error
  
  revalidatePath('/dashboard/sales/invoices')
  revalidatePath('/dashboard/inventory/products')
  return { success: true, id: data }
}

export async function createPurchaseInvoice(invoiceData: any, items: any[], payments: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, branch_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error("No company found")

  const { data, error } = await supabase.rpc('create_purchase_invoice', {
    p_invoice: {
      ...invoiceData,
      company_id: profile.company_id,
      branch_id: profile.branch_id
    },
    p_items: items,
    p_payments: payments
  })

  if (error) throw error
  
  revalidatePath('/dashboard/purchases/invoices')
  revalidatePath('/dashboard/inventory/products')
  return { success: true, id: data }
}

export async function cancelInvoice(id: string) {
  const supabase = await createClient()
  // ⛔️ الفاتورة المؤكدة لا تُحذف — فقط "إلغاء"
  // نحتاج منطق لإرجاع القيم (مخزن / أرصدة)
  // سأقوم حالياً بتحديث الحالة فقط، مع العلم أن المرتجع هو الطريقة الأصح برمجياً
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'void' })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/sales/invoices')
  return { success: true }
}

export async function createQuotation(data: any) {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, branch_id')
      .eq('id', user.id)
      .single()

    const { data: invoiceId, error } = await supabase.rpc('create_quotation', {
      p_invoice: {
        ...data.invoice,
        company_id: profile?.company_id,
        branch_id: profile?.branch_id,
        cashier_id: user.id
      },
      p_items: data.items
    })

    if (error) throw error
    revalidatePath('/dashboard/sales/quotations')
    return { success: true, id: invoiceId }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function convertToInvoice(quotationId: string) {
  const supabase = await createClient()
  
  try {
    const { data: quotation, error: qError } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (
          product_id,
          qty,
          unit_price,
          discount_type,
          discount_value,
          discount_amount,
          total_line
        )
      `)
      .eq('id', quotationId)
      .single()

    if (qError) throw qError

    const result = await createSaleInvoice({
      invoice: {
        customer_id: quotation.customer_id,
        warehouse_id: quotation.warehouse_id,
        subtotal: quotation.subtotal,
        discount_type: quotation.discount_type,
        discount_value: quotation.discount_value,
        discount_amount: quotation.discount_amount,
        tax_rate: quotation.tax_rate,
        tax_amount: quotation.tax_amount,
        total: quotation.total,
        paid: 0,
        remaining: quotation.total,
        parent_id: quotation.id,
        notes: `محولة من عرض سعر رقم ${quotation.invoice_number}`
      },
      items: quotation.invoice_items,
      payments: []
    })

    if (result.success) {
      await supabase
        .from('invoices')
        .update({ status: 'converted' })
        .eq('id', quotationId)
      
      revalidatePath('/dashboard/sales/invoices')
      revalidatePath('/dashboard/sales/quotations')
    }

    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createSaleReturn(data: any) {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, branch_id')
      .eq('id', user.id)
      .single()

    const { data: invoiceId, error } = await supabase.rpc('create_sale_return', {
      p_invoice: {
        ...data.invoice,
        company_id: profile?.company_id,
        branch_id: profile?.branch_id,
        cashier_id: user.id,
        type: 'sale_return',
        status: 'paid'
      },
      p_items: data.items,
      p_treasury_id: data.treasury_id
    })

    if (error) throw error
    revalidatePath('/dashboard/sales/invoices')
    return { success: true, id: invoiceId }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createPurchaseOrder(data: any) {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, branch_id')
      .eq('id', user.id)
      .single()

    const { data: invoiceId, error } = await supabase.rpc('create_purchase_order', {
      p_invoice: {
        ...data.invoice,
        company_id: profile?.company_id,
        branch_id: profile?.branch_id,
        cashier_id: user.id
      },
      p_items: data.items
    })

    if (error) throw error
    revalidatePath('/dashboard/purchases/orders')
    return { success: true, id: invoiceId }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function convertPOToInvoice(poId: string) {
  const supabase = await createClient()
  
  try {
    const { data: po, error: poError } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', poId)
      .single()

    if (poError) throw poError

    const result = await createPurchaseInvoice({
      ...po,
      reference_id: po.id,
      notes: `محولة من أمر شراء رقم ${po.invoice_number}`
    }, po.invoice_items, [])

    if (result.success) {
      await supabase
        .from('invoices')
        .update({ status: 'converted' })
        .eq('id', poId)
      
      revalidatePath('/dashboard/purchases/invoices')
      revalidatePath('/dashboard/purchases/orders')
    }

    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createPurchaseReturn(data: any) {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, branch_id')
      .eq('id', user.id)
      .single()

    const { data: invoiceId, error } = await supabase.rpc('create_purchase_return', {
      p_invoice: {
        ...data.invoice,
        company_id: profile?.company_id,
        branch_id: profile?.branch_id,
        cashier_id: user.id
      },
      p_items: data.items,
      p_treasury_id: data.treasury_id
    })

    if (error) throw error
    revalidatePath('/dashboard/purchases/invoices')
    return { success: true, id: invoiceId }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
