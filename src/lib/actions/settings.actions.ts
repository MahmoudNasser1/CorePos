"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCompanyProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', profile.company_id)
    .single()

  if (error) throw error
  return data
}

export async function updateCompanyProfile(formData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('companies')
    .update(formData)
    .eq('id', profile.company_id)

  if (error) throw error
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function getAuditLogs(filters?: {
  userId?: string
  entity?: string
  action?: string
  limit?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:user_id (full_name)
    `)
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false })

  if (filters?.userId) query = query.eq('user_id', filters.userId)
  if (filters?.entity) query = query.eq('entity', filters.entity)
  if (filters?.action) query = query.eq('action', filters.action)
  
  const { data, error } = await query.limit(filters?.limit || 100)
  if (error) throw error
  return data
}

export async function createTreasury(values: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, branch_id')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('treasuries')
    .insert({
      ...values,
      company_id: profile.company_id,
      branch_id: profile.branch_id || values.branch_id
    })

  if (error) throw error
  revalidatePath('/dashboard/finance/treasuries')
  return { success: true }
}

export async function updateTreasury(id: string, values: any) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('treasuries')
    .update(values)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/dashboard/finance/treasuries')
  return { success: true }
}

export async function getWarehouses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('created_at')

  if (error) throw error
  return data
}

export async function getUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  if (error) throw error
  return data
}
