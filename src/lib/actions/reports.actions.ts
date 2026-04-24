"use server"

import { reportsApi } from "@/lib/api/reports"
import { contactsApi } from "@/lib/api/contacts"

// Reports are served from backend (or stubbed).

export async function getDashboardStats() {
  try {
    const data = (await reportsApi.getDaily()) as any
    return {
      todaySales: Number(data?.sales || 0),
      salesCount: Number(data?.salesCount || 0),
      salesChange: "0.0",
      profitChange: "0.0",
      treasuryBalance: Number(data?.treasuryBalance || 0),
      lowStockCount: Number(data?.lowStockCount || 0),
      profit: Number(data?.profits || 0),
    }
  } catch {
    return null
  }
}

export async function getTopProducts() {
  try {
    return ((await reportsApi.getTopProducts()) as any) || []
  } catch {
    return []
  }
}

export async function getSalesChartData() {
  try {
    const data = (await reportsApi.getTrend()) as any[]
    return (data || []).map((item: any) => ({
      date: item.date,
      total_sales: Number(item.total_sales || item.sales || 0),
    }))
  } catch {
    return []
  }
}

export async function getRecentInvoices() {
  try {
    return ((await reportsApi.getSales()) as any) || []
  } catch {
    return []
  }
}

export async function getLowStockProducts() {
  // Prefer dedicated endpoint when available; otherwise empty.
  return []
}

export async function getDailyReport(_filters: any) {
  return { data: [], totals: { total_sales: 0, total_purchases: 0, sales_count: 0 } }
}

export async function getStockReport(_filters: any) {
  const data = await reportsApi.getStock().catch(() => null as any)
  return { data: (data as any) || [], totals: { stock_value: 0, qty: 0 } }
}

export async function getCustomerBalances() {
  const data = await contactsApi.listCustomers(undefined, 500).catch(() => [])
  const totals = (data as any[]).reduce((acc, row) => acc + Number((row as any).balance || 0), 0)
  return { data, totals: { balance: totals } }
}

export async function getSupplierBalances() {
  const data = await contactsApi.listSuppliers(undefined, 500).catch(() => [])
  const totals = (data as any[]).reduce((acc, row) => acc + Number((row as any).balance || 0), 0)
  return { data, totals: { balance: totals } }
}

export async function getTreasuryMovement(_filters: any) {
  return { data: [], totals: { amount_in: 0, amount_out: 0 } }
}

export async function getProfitReport(_filters: any) {
  return { data: [], totals: { total_sales: 0, total_cost: 0, gross_profit: 0 } }
}

export async function getExpensesReport(_params: any) {
  return []
}

export async function getProfitLossData(_companyId: string, _startDate: string, _endDate: string) {
  return {
    totalSales: 0,
    totalVAT: 0,
    totalCOGS: 0,
    totalExpenses: 0,
    grossProfit: 0,
    netProfit: 0,
  }
}

export async function getSalesReport(_params: any) {
  return ((await reportsApi.getSales().catch(() => [])) as any) || []
}

export async function getPremiumProfitLoss(_params: any) {
  return []
}

export async function getAuditLogs() {
  return []
}

export async function getTaxReport(_params: any) {
  return []
}

export async function getStockMovementReport(_params: any) {
  return []
}

