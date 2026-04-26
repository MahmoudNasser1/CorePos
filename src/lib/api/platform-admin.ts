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
}

