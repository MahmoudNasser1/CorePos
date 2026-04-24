"use server"

import { backendFetch } from "@/lib/api/backend-client"
import { revalidatePath } from "next/cache"

export async function getCompanyProfile() {
  return backendFetch('/admin/company')
}

export const getCompanySettings = getCompanyProfile

export async function updateCompanyProfile(formData: any) {
  await backendFetch('/admin/company', { method: 'POST', body: formData })
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function getAuditLogs(filters?: {
  userId?: string
  entity?: string
  action?: string
  limit?: number
}) {
  // TODO: audit logs are not implemented in the new backend yet.
  void filters
  return []
}

export async function createTreasury(values: any) {
  await backendFetch('/finance/treasury', { method: 'POST', body: values })
  revalidatePath('/dashboard/finance/treasuries')
  return { success: true }
}

export async function updateTreasury(id: string, values: any) {
  // TODO: add PATCH endpoint in backend if needed.
  void id
  void values
  revalidatePath('/dashboard/finance/treasuries')
  return { success: true }
}

export async function getWarehouses() {
  return backendFetch('/admin/warehouses')
}

export async function getUsers() {
  return backendFetch('/admin/users')
}
