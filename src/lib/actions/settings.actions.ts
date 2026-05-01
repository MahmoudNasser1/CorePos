"use server"

import { backendFetch } from "@/lib/api/backend-client"
import { adminApi } from "@/lib/api/admin"
import { revalidatePath } from "next/cache"

export async function getCompanyProfile() {
  return backendFetch('/admin/company')
}

export const getCompanySettings = getCompanyProfile

function mapCompanyProfileToApiBody(formData: Record<string, unknown>): Record<string, unknown> {
  const g = (...keys: string[]) => {
    for (const k of keys) {
      const v = formData[k]
      if (v === undefined || v === null) continue
      if (typeof v === "string" && v.trim() === "") continue
      return v
    }
    return undefined
  }
  const out: Record<string, unknown> = {}
  const put = (apiKey: string, v: unknown) => {
    if (v === undefined || v === null) return
    if (typeof v === "string" && v.trim() === "") return
    out[apiKey] = typeof v === "string" ? v.trim() : v
  }
  put("name", g("name"))
  put("phone", g("phone"))
  put("address", g("address"))
  put("email", g("email"))
  put("nameEn", g("nameEn", "name_en"))
  put("logoUrl", g("logoUrl", "logo_url"))
  put("taxNumber", g("taxNumber", "tax_number"))
  const vr = g("vatRate", "vat_rate")
  if (vr !== undefined && vr !== null && String(vr).trim() !== "") {
    const n = Number(vr)
    if (!Number.isNaN(n)) put("vatRate", n)
  }
  put("currency", g("currency"))
  const cc = g("countryCode", "country_code")
  if (cc !== undefined) put("countryCode", String(cc).toUpperCase().slice(0, 2))
  put("timezone", g("timezone"))
  put("defaultBranchId", g("defaultBranchId", "default_branch_id"))
  return out
}

export async function updateCompanyProfile(formData: Record<string, unknown>) {
  const body = mapCompanyProfileToApiBody(formData)
  await backendFetch("/admin/company", { method: "POST", body })
  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard/settings/company")
  revalidatePath("/dashboard/settings/invoice")
  return { success: true }
}

export async function getAuditLogs(filters?: {
  userId?: string
  entity?: string
  action?: string
  limit?: number
  fromDate?: string
  toDate?: string
}) {
  const params = new URLSearchParams()
  if (filters?.userId) params.set("userId", filters.userId)
  if (filters?.entity) params.set("entity", filters.entity)
  if (filters?.action) params.set("action", filters.action)
  if (filters?.limit != null) params.set("limit", String(filters.limit))
  if (filters?.fromDate) params.set("fromDate", filters.fromDate)
  if (filters?.toDate) params.set("toDate", filters.toDate)

  const qs = params.toString()
  const res = await backendFetch(`/admin/audit-logs${qs ? `?${qs}` : ""}`)
  return (res as any) ?? []
}

export async function createTreasury(values: Record<string, unknown>) {
  const body = {
    name: String(values.name ?? '').trim(),
    type: (values.type as string) || 'cash',
    branchId: (values.branchId as string) || (values.branch_id as string) || undefined,
    isDefault: Boolean(values.isDefault ?? values.is_default),
    isActive: values.isActive !== false && values.is_active !== false,
  }
  const res = await backendFetch<unknown>('/finance/treasury', { method: 'POST', body })
  revalidatePath('/dashboard/finance/treasuries')
  return { success: true, data: res }
}

export async function updateTreasury(id: string, values: Record<string, unknown>) {
  const body: Record<string, unknown> = {}
  if (values.name !== undefined) body.name = String(values.name ?? '').trim()
  if (values.type !== undefined) body.type = String(values.type ?? 'cash')
  if (values.isDefault !== undefined || values.is_default !== undefined) {
    body.isDefault = Boolean(values.isDefault ?? values.is_default)
  }
  if (values.isActive !== undefined || values.is_active !== undefined) {
    body.isActive = Boolean(values.isActive ?? values.is_active)
  }
  const res = await backendFetch<unknown>(`/finance/treasury/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
  })
  revalidatePath('/dashboard/finance/treasuries')
  return { success: true, data: res }
}

export async function getWarehouses() {
  return backendFetch('/admin/warehouses')
}

export async function getUsers() {
  return adminApi.listUsers()
}

export async function createCompanyUser(data: any) {
  const res = await adminApi.createUser(data)
  revalidatePath('/dashboard/settings/users')
  return { success: true, data: res }
}

export async function updateCompanyUser(id: string, data: any) {
  const res = await adminApi.updateUser(id, data)
  revalidatePath('/dashboard/settings/users')
  return { success: true, data: res }
}

export async function toggleCompanyUserActive(id: string, reason: string) {
  const res = await adminApi.toggleUserActive(id, reason)
  revalidatePath('/dashboard/settings/users')
  return { success: true, data: res }
}

export async function resetCompanyUserPassword(id: string, reason: string) {
  const res = await adminApi.resetUserPassword(id, reason)
  // No revalidate needed for password reset, but returns tempPassword
  return { success: true, data: res }
}

export async function getMyProfile() {
  const res = await adminApi.getProfile()
  return res as any
}

export async function updateMyProfile(data: { fullName?: string; phone?: string; avatarUrl?: string }) {
  const res = await adminApi.updateMyProfile(data)
  revalidatePath('/dashboard/profile')
  revalidatePath('/super-admin/profile')
  return { success: true, data: res }
}


// --- Print Settings & Templates ---

export async function getPrintTemplates() {
  return backendFetch('/admin/print-templates')
}

export async function createPrintTemplate(body: any) {
  const res = await backendFetch('/admin/print-templates', { method: 'POST', body })
  revalidatePath('/dashboard/settings/printing')
  return { success: true, data: res }
}

export async function updatePrintTemplate(id: string, body: any) {
  const res = await backendFetch(`/admin/print-templates/${encodeURIComponent(id)}`, { method: 'PATCH', body })
  revalidatePath('/dashboard/settings/printing')
  return { success: true, data: res }
}

export async function getPrintSettings() {
  return backendFetch('/admin/print-settings')
}

export async function upsertPrintSettings(body: any) {
  // Ensure marginConfig is passed through
  const payload = {
    ...body,
    marginConfig: body.marginConfig || null,
  }
  const res = await backendFetch('/admin/print-settings', { method: 'POST', body: payload })
  revalidatePath('/dashboard/settings/printing')
  return { success: true, data: res }
}

export async function deletePrintTemplate(id: string) {
  await backendFetch(`/admin/print-templates/${encodeURIComponent(id)}`, { method: 'DELETE' })
  revalidatePath('/dashboard/settings/printing')
  return { success: true }
}
