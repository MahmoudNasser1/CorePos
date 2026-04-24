import { backendFetch } from './backend-client'

export const reportsApi = {
  getDaily: () => backendFetch('/reports/daily'),
  getSales: () => backendFetch('/reports/sales'),
  getProfits: () => backendFetch('/reports/profits'),
  getTrend: () => backendFetch('/reports/trend'),
  getTopProducts: () => backendFetch('/reports/top-products'),
  getStock: () => backendFetch('/reports/stock'),
  getTreasury: () => backendFetch('/reports/treasury'),
}

