import { backendFetch } from './backend-client'

export interface BillingUsage {
  plan: string
  status: string
  limits: {
    maxUsers: number
    maxBranches: number
    maxWarehouses: number
    maxProducts: number
    maxInvoicesPerMonth: number
  }
  usage: {
    users: number
    branches: number
    warehouses: number
    products: number
    monthlyInvoices: number
  }
}

export const billingApi = {
  getUsage: async () => {
    const data = await backendFetch<BillingUsage>('/billing/usage')
    return data
  },
  getCurrent: async () => {
    const data = await backendFetch<any>('/billing/current')
    return data
  },
  checkout: async (planId: string, billingCycle: 'monthly' | 'yearly') => {
    const data = await backendFetch<{ checkoutUrl: string }>('/billing/checkout', {
      method: 'POST',
      body: { planId, billingCycle }
    })
    return data
  },
}

