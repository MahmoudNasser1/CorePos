"use server"

import { backendFetch } from "@/lib/api/backend-client"
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
