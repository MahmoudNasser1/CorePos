"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { isBackendEnabled } from "@/lib/api/feature-flags"
import { createPaymentViaBackend } from "@/lib/api/payments"
import { BackendApiError } from "@/lib/api/backend-client"

export async function getTreasuryTransactions(filters?: {
  treasury_id?: string
  from?: string
  to?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles' as any)
    .select('company_id')
    .eq('id', user.id)
    .single() as any

  if (!profile) return []

  let query = supabase
    .from('treasury_transactions' as any)
    .select(`
      *,
      treasuries!inner(name, company_id)
    `)
    .eq('treasuries.company_id', (profile as any).company_id)
    .order('created_at', { ascending: false })

  if (filters?.treasury_id) query = query.eq('treasury_id', filters.treasury_id)
  if (filters?.from) query = query.gte('date', filters.from)
  if (filters?.to) query = query.lte('date', filters.to)

  const { data, error } = await query
  if (error) {
    console.error('Error fetching treasury transactions:', error)
    return []
  }

  return (data || []) as any[]
}

export async function getTreasuries() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles' as any)
    .select('company_id')
    .eq('id', user.id)
    .single() as any

  if (!profile) return []

  const { data, error } = await supabase
    .from('treasuries' as any)
    .select('*')
    .eq('company_id', (profile as any).company_id)
    .eq('is_active', true)

  if (error) return []
  return (data || []) as any[]
}

export async function createPayment(paymentData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles' as any)
    .select('company_id')
    .eq('id', user.id)
    .single() as any

  if (!profile) throw new Error("No company found")

  if (isBackendEnabled('finance')) {
    try {
      const normalizedMethod =
        (paymentData.method as string | undefined) ??
        (paymentData.payment_method === 'bank_transfer' ? 'bank' : paymentData.payment_method)

      const result = await createPaymentViaBackend({
        companyId: (profile as any).company_id,
        treasuryId: paymentData.treasury_id,
        amount: paymentData.amount,
        method: (normalizedMethod ?? 'cash') as 'cash' | 'card' | 'bank',
        notes: paymentData.notes,
        invoiceId: paymentData.invoice_id ?? paymentData.invoiceId,
        customerId: paymentData.customer_id ?? paymentData.customerId,
        createdBy: user.id,
      })

      revalidatePath('/dashboard/finance/treasury')
      revalidatePath('/dashboard/customers')
      revalidatePath('/dashboard/suppliers')
      return { success: result.success, id: result.id }
    } catch (error) {
      // Let the UI handle known backend error codes
      if (error instanceof BackendApiError) throw error
      console.error('Backend payment receipt error:', error)
      return { success: false, error: 'فشل تسجيل سند القبض عبر الخادم الجديد' }
    }
  }

  const { data, error } = await (supabase.rpc as any)('add_payment_receipt', {
    p_payment: {
      ...paymentData,
      company_id: (profile as any).company_id,
      created_by: user.id
    } as any
  })

  if (error) throw error
  
  revalidatePath('/dashboard/finance/treasury')
  revalidatePath('/dashboard/customers')
  revalidatePath('/dashboard/suppliers')
  return { success: true, id: data }
}

export async function getExpenseCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles' as any)
    .select('company_id')
    .eq('id', user.id)
    .single() as any

  const { data, error } = await supabase
    .from('expense_categories' as any)
    .select('*')
    .eq('company_id', (profile as any)?.company_id)

  if (error) return []
  return (data || []) as any[]
}

export async function createExpense(expenseData: any) {
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) throw new Error("Unauthorized")

   const { data: profile } = await supabase
     .from('profiles' as any)
     .select('company_id, branch_id')
     .eq('id', user.id)
     .single() as { data: { company_id: string, branch_id: string } | null }

   const { data, error } = await (supabase.from('expenses') as any).insert({
     ...expenseData,
     company_id: profile?.company_id,
     branch_id: profile?.branch_id,
     created_by: user.id
   }).select().single() as { data: any, error: any }

   if (error) throw error

   await (supabase.from('treasury_transactions') as any).insert({
     treasury_id: expenseData.treasury_id,
     type: 'out',
     amount: expenseData.amount,
     reference_id: data.id,
     reference_type: 'expense',
     notes: expenseData.notes,
     created_by: user.id
   })

   revalidatePath('/dashboard/finance/expenses')
   revalidatePath('/dashboard/finance/treasury')
   return { success: true }
}

export async function getExpenses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles' as any)
    .select('company_id')
    .eq('id', user.id)
    .single() as any

  const { data, error } = await supabase
    .from('expenses' as any)
    .select(`
      *,
      expense_categories(name),
      treasuries(name)
    `)
    .eq('company_id', (profile as any)?.company_id)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
  return (data || []) as any[]
}
