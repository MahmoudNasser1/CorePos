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

export const platformAdminApi = {
  getOverview: () => backendFetch<PlatformAdminOverview>("/platform-admin/overview"),
}

