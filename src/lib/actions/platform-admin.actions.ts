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

export async function listPlatformAdminSubscriptions(params?: { status?: string; planId?: string; companyId?: string }) {
  try {
    return await platformAdminApi.listSubscriptions(params)
  } catch {
    return []
  }
}

export async function updatePlatformAdminCompanySubscription(
  id: string,
  body: { reason: string; status?: string; planId?: string; extendDays?: number },
) {
  try {
    await platformAdminApi.updateCompanySubscription(id, body)
    return { ok: true as const }
  } catch {
    return { ok: false as const }
  }
}

export async function listPlatformAdminAuditLogs(params?: { action?: string; companyId?: string; from?: string; to?: string }) {
  try {
    return await platformAdminApi.listAuditLogs(params)
  } catch {
    return []
  }
}

export async function listPlatformAdminUsers(params?: { search?: string; companyId?: string; role?: string; status?: string }) {
  try {
    return await platformAdminApi.listUsers(params)
  } catch {
    return []
  }
}

export async function updatePlatformAdminUser(
  id: string,
  body: { reason: string; isActive?: boolean; role?: string; orgUnitId?: string | null },
) {
  try {
    await platformAdminApi.updateUser(id, body)
    return { ok: true as const }
  } catch {
    return { ok: false as const }
  }
}

export async function resetPlatformAdminUserPassword(id: string, body: { reason: string }) {
  try {
    return { ok: true as const, data: await platformAdminApi.resetUserPassword(id, body) }
  } catch {
    return { ok: false as const, data: null }
  }
}

export async function listPlatformAdminOrgUnits(companyId: string) {
  try {
    const id = String(companyId ?? "").trim()
    if (!id) return []
    return await platformAdminApi.listOrgUnits({ companyId: id })
  } catch {
    return []
  }
}

export async function createPlatformAdminOrgUnit(body: { companyId: string; name: string; parentId?: string; reason: string }) {
  try {
    return { ok: true as const, data: await platformAdminApi.createOrgUnit(body) }
  } catch {
    return { ok: false as const, data: null }
  }
}

export async function updatePlatformAdminOrgUnit(
  id: string,
  body: { companyId: string; name: string; parentId?: string; reason: string },
) {
  try {
    return { ok: true as const, data: await platformAdminApi.updateOrgUnit(id, body) }
  } catch {
    return { ok: false as const, data: null }
  }
}

export async function deletePlatformAdminOrgUnit(id: string, body: { reason: string }) {
  try {
    await platformAdminApi.deleteOrgUnit(id, body)
    return { ok: true as const }
  } catch {
    return { ok: false as const }
  }
}

