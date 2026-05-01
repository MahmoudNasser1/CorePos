import { PlanLimitsInfo } from '@/types/auth.types'
import { backendFetch } from './api/backend-client'

export async function getLimitsInfo(companyId: string): Promise<PlanLimitsInfo | null> {
  if (!companyId) return null
  try {
    const data = await backendFetch<{
      usage: any
      limits: any
      plan: string
    }>('/billing/usage', { companyId })

    return {
      max_users: data.limits.maxUsers,
      max_branches: data.limits.maxBranches,
      max_warehouses: data.limits.maxWarehouses,
      max_products: data.limits.maxProducts,
      max_invoices_per_month: data.limits.maxInvoicesPerMonth,
      storage_limit_mb: null,
      features: {
        reports_advanced: data.plan !== 'free',
        export_excel: true,
        custom_invoices: true,
        api_access: data.plan === 'pro' || data.plan === 'enterprise',
        zatca_invoice: true,
      },
    }
  } catch (e) {
    console.error('Failed to fetch limits:', e)
    return null
  }
}

export async function canAddUser(companyId: string): Promise<boolean> {
  if (!companyId) return true
  try {
    const data = await backendFetch<{ usage: any; limits: any }>('/billing/usage', { companyId })
    return data.usage.users < data.limits.maxUsers
  } catch {
    return true
  }
}

export async function canAddBranch(companyId: string): Promise<boolean> {
  if (!companyId) return true
  try {
    const data = await backendFetch<{ usage: any; limits: any }>('/billing/usage', { companyId })
    return data.usage.branches < data.limits.maxBranches
  } catch {
    return true
  }
}

export async function canAddProduct(companyId: string): Promise<boolean> {
  if (!companyId) return true
  try {
    const data = await backendFetch<{ usage: any; limits: any }>('/billing/usage', { companyId })
    return data.usage.products < data.limits.maxProducts
  } catch {
    return true
  }
}

export async function canCreateInvoice(companyId: string): Promise<boolean> {
  if (!companyId) return true
  try {
    const data = await backendFetch<{ usage: any; limits: any }>('/billing/usage', { companyId })
    return data.usage.monthlyInvoices < data.limits.maxInvoicesPerMonth
  } catch {
    return true
  }
}

export async function hasFeature(companyId: string, featureName: keyof PlanLimitsInfo['features']): Promise<boolean> {
  const info = await getLimitsInfo(companyId)
  return info?.features[featureName] ?? false
}
