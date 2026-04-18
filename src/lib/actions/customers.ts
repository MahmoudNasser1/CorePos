"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCustomers() {
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
    .from('customers')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('name')

  if (error) {
    console.error('Error fetching customers:', error)
    return []
  }

  return data
}

export async function getSuppliers() {
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
    .from('suppliers')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('name')

  if (error) {
    console.error('Error fetching suppliers:', error)
    return []
  }

  return data
}

export async function getCustomerById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getSupplierById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getCustomerStatement(customerId: string) {
  const supabase = await createClient()
  
  // Get invoices and payments for balance tracing
  const { data: invoices, error: invError } = await supabase
    .from('invoices')
    .select('id, invoice_number, date, total, type, notes')
    .eq('customer_id', customerId)
    .order('date', { ascending: true })

  const { data: payments, error: payError } = await supabase
    .from('payments')
    .select('id, amount, method, date, notes, type')
    .eq('customer_id', customerId)
    .order('date', { ascending: true })

  if (invError || payError) throw new Error("Error fetching statement")

  // Combine and sort by date
  const statement = [
    ...invoices.map(i => ({ 
      id: i.id, date: i.date, details: `فاتورة ${i.type === 'sale_return' ? 'مرتجع' : ''} #${i.invoice_number || 'مسودة'}`, 
      debit: i.type === 'sale' ? i.total : 0, 
      credit: i.type === 'sale_return' ? i.total : 0,
      ref_id: i.id, ref_type: 'invoice'
    })),
    ...payments.map(p => ({ 
      id: p.id, date: p.date, details: `سند ${p.type === 'receipt' ? 'قبض' : 'صرف'} (${p.method})`, 
      debit: p.type === 'payment' ? p.amount : 0, 
      credit: p.type === 'receipt' ? p.amount : 0,
      ref_id: p.id, ref_type: 'payment'
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate Running Balance
  let runningBalance = 0
  const statementWithBalance = statement.map(line => {
    runningBalance += (line.debit - line.credit)
    return { ...line, balance: runningBalance }
  })

  return statementWithBalance
}

export async function saveCustomer(customerData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (customerData.id) {
    const { error } = await supabase.from('customers').update(customerData).eq('id', customerData.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('customers').insert({ ...customerData, company_id: profile?.company_id })
    if (error) throw error
  }

  revalidatePath('/dashboard/customers')
  return { success: true }
}

export async function saveSupplier(supplierData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (supplierData.id) {
    const { error } = await supabase.from('suppliers').update(supplierData).eq('id', supplierData.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('suppliers').insert({ ...supplierData, company_id: profile?.company_id })
    if (error) throw error
  }

  revalidatePath('/dashboard/suppliers')
  return { success: true }
}
