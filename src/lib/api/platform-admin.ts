import { backendFetch } from "./backend-client"

export type PlatformAdminOverview = {
  companies: { total: number }
  users: { total: number; active: number; disabled: number }
  subscriptions: {
    total: number
    active: number
    trialing: number
    expired: number
    cancelled: number
    pastDue: number
  }
  revenue?: {
    mrr: number
    arr: number
    thisMonthRevenue: number
  }
  expiringTrials?: Array<{
    id: string
    name: string
    currentPeriodEnd: string
  }>
}

export type PlatformAdminCompanyRow = {
  id: string
  name: string
  phone: string | null
  email: string | null
  countryCode: string | null
  timezone: string | null
  createdAt: string | null
  subscription: { planId: string | null; status: string | null; currentPeriodEnd: string | null } | null
}

export type PlatformAdminCompanyDetails = {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  taxNumber: string | null
  currency: string | null
  timezone: string | null
  countryCode: string | null
  createdAt: string | null
  subscription: { id: string; status: string; planId: string; currentPeriodEnd: string | null } | null
  users: { total: number; active: number; disabled: number }
}

export type PlatformAdminUserRow = {
  id: string
  fullName: string
  email: string
  role: string
  isActive: boolean
  companyId: string | null
  companyName: string | null
  orgUnitId?: string | null
  orgUnitName?: string | null
  createdAt: string | null
}

export type PlatformAdminOrgUnitRow = {
  id: string
  companyId: string
  name: string
  parentId: string | null
  createdAt: string | null
}

export type PlatformAdminSubscriptionRow = {
  id: string
  companyId: string
  companyName: string | null
  status: string
  planId: string
  currentPeriodEnd: string | null
}

export const platformAdminApi = {
  getOverview: () => backendFetch<PlatformAdminOverview>("/platform-admin/overview"),
  listCompanies: (params?: { search?: string; status?: string; plan?: string }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set("search", params.search)
    if (params?.status) qs.set("status", params.status)
    if (params?.plan) qs.set("plan", params.plan)
    const s = qs.toString()
    return backendFetch<PlatformAdminCompanyRow[]>(`/platform-admin/companies${s ? `?${s}` : ""}`)
  },
  getCompany: (id: string) => backendFetch<PlatformAdminCompanyDetails>(`/platform-admin/companies/${id}`),
  updateCompanySubscription: (
    id: string,
    body: { reason: string; status?: string; planId?: string; extendDays?: number },
  ) => backendFetch(`/platform-admin/companies/${id}/subscription`, { method: "PATCH", body }),
  listSubscriptions: (params?: { status?: string; planId?: string; companyId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set("status", params.status)
    if (params?.planId) qs.set("planId", params.planId)
    if (params?.companyId) qs.set("companyId", params.companyId)
    const s = qs.toString()
    return backendFetch<PlatformAdminSubscriptionRow[]>(`/platform-admin/subscriptions${s ? `?${s}` : ""}`)
  },
  listAuditLogs: (params?: { action?: string; companyId?: string; from?: string; to?: string }) => {
    const qs = new URLSearchParams()
    if (params?.action) qs.set("action", params.action)
    if (params?.companyId) qs.set("companyId", params.companyId)
    if (params?.from) qs.set("from", params.from)
    if (params?.to) qs.set("to", params.to)
    const s = qs.toString()
    return backendFetch<any[]>(`/platform-admin/audit-logs${s ? `?${s}` : ""}`)
  },
  listUsers: (params?: { search?: string; companyId?: string; role?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.search) qs.set("search", params.search)
    if (params?.companyId) qs.set("companyId", params.companyId)
    if (params?.role) qs.set("role", params.role)
    if (params?.status) qs.set("status", params.status)
    const s = qs.toString()
    return backendFetch<PlatformAdminUserRow[]>(`/platform-admin/users${s ? `?${s}` : ""}`)
  },
  updateUser: (id: string, body: { reason: string; isActive?: boolean; role?: string; orgUnitId?: string | null }) =>
    backendFetch(`/platform-admin/users/${id}`, { method: "PATCH", body }),
  resetUserPassword: (id: string, body: { reason: string }) =>
    backendFetch<{ tempPassword: string }>(`/platform-admin/users/${id}/reset-password`, { method: "POST", body }),
  listOrgUnits: (params: { companyId: string }) =>
    backendFetch<PlatformAdminOrgUnitRow[]>(`/platform-admin/org-units?companyId=${encodeURIComponent(params.companyId)}`),
  createOrgUnit: (body: { companyId: string; name: string; parentId?: string; reason: string }) =>
    backendFetch<PlatformAdminOrgUnitRow>(`/platform-admin/org-units`, { method: "POST", body }),
  updateOrgUnit: (id: string, body: { companyId: string; name: string; parentId?: string; reason: string }) =>
    backendFetch<PlatformAdminOrgUnitRow>(`/platform-admin/org-units/${id}`, { method: "PATCH", body }),
  deleteOrgUnit: (id: string, body: { reason: string }) =>
    backendFetch(`/platform-admin/org-units/${id}/delete`, { method: "POST", body }),
}

