"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getTreasuryTransactions(filters?: {
  treasury_id?: string
  from?: string
  to?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get queries across all treasuries of the company
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  let query = supabase
    .from('treasury_transactions')
    .select(`
      *,
      treasuries!inner(name, company_id)
    `)
    .eq('treasuries.company_id', profile.company_id)
    .order('created_at', { ascending: false })

  if (filters?.treasury_id) query = query.eq('treasury_id', filters.treasury_id)
  if (filters?.from) query = query.gte('date', filters.from)
  if (filters?.to) query = query.lte('date', filters.to)

  const { data, error } = await query
  if (error) {
    console.error('Error fetching treasury transactions:', error)
    return []
  }

  return data
}

export async function getTreasuries() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  const { data, error } = await supabase
    .from('treasuries')
    .select('*')
    .eq('company_id', profile.company_id)
    .eq('is_active', true)

  if (error) return []
  return data
}

export async function createPayment(paymentData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error("No company found")

  const { data, error } = await supabase.rpc('add_payment_receipt', {
    p_payment: {
      ...paymentData,
      company_id: profile.company_id,
      created_by: user.id
    }
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
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('company_id', profile?.company_id)

  if (error) return []
  return data
}

export async function createExpense(expenseData: any) {
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) throw new Error("Unauthorized")

   const { data: profile } = await supabase
     .from('profiles')
     .select('company_id, branch_id')
     .eq('id', user.id)
     .single()

   const { data, error } = await supabase.from('expenses').insert({
     ...expenseData,
     company_id: profile?.company_id,
     branch_id: profile?.branch_id,
     created_by: user.id
   }).select().single()

   if (error) throw error

   // Create transaction in treasury
   await supabase.from('treasury_transactions').insert({
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
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      expense_categories(name),
      treasuries(name)
    `)
    .eq('company_id', profile?.company_id)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
  return data
}
