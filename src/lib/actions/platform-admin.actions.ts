"use server"

import { platformAdminApi } from "@/lib/api/platform-admin"

export async function getPlatformAdminOverview() {
  try {
    return await platformAdminApi.getOverview()
  } catch {
    return null
  }
}

export async function listPlatformAdminCompanies(params?: { search?: string; status?: string; plan?: string }) {
  try {
    return await platformAdminApi.listCompanies(params)
  } catch {
    return []
  }
}

export async function getPlatformAdminCompany(id: string) {
  try {
    return await platformAdminApi.getCompany(id)
  } catch {
    return null
  }
}

