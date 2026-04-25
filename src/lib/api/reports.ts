import { backendFetch } from './backend-client'

export const reportsApi = {
  getDaily: () => backendFetch('/reports/daily'),
  getSales: () => backendFetch('/reports/sales'),
  getProfits: () => backendFetch('/reports/profits'),
  getTrend: () => backendFetch('/reports/trend'),
  getTopProducts: () => backendFetch('/reports/top-products'),
  getSalesByCategory: (params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams()
    if (params?.from) qs.set("from", params.from)
    if (params?.to) qs.set("to", params.to)
    const s = qs.toString()
    return backendFetch(`/reports/sales-by-category${s ? `?${s}` : ""}`)
  },
  getStock: () => backendFetch('/reports/stock'),
  getTreasury: () => backendFetch('/reports/treasury'),
}

