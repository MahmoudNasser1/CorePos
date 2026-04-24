import { createClient } from './supabase/server'
import { PlanLimitsInfo } from '@/types/auth.types'
import { Database } from '@/types/database.types'

export async function getLimitsInfo(companyId: string): Promise<PlanLimitsInfo | null> {
  const supabase = await createClient()

  // Fetch company's active subscription and its plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(`
      plan_id,
      plans (
        max_users,
        max_branches,
        max_warehouses,
        max_products,
        max_invoices_month,
        storage_mb,
        features
      )
    `)
    .eq('company_id', companyId)
    .in('status', ['active', 'trialing'])
    .single()

  if (!subscription || !(subscription as any).plans) return null

  const plan = (subscription as any).plans as unknown as Database['public']['Tables']['plans']['Row']
  const features = (plan.features || {}) as Record<string, unknown>

  return {
    max_users: plan.max_users,
    max_branches: plan.max_branches,
    max_warehouses: plan.max_warehouses,
    max_products: plan.max_products,
    max_invoices_per_month: plan.max_invoices_month,
    storage_limit_mb: plan.storage_mb,
    features: {
      reports_advanced: !!features.reports_advanced,
      export_excel: !!features.export_excel,
      custom_invoices: !!features.custom_invoices,
      api_access: !!features.api_access,
      zatca_invoice: !!features.zatca_invoice,
    }
  }
}

export async function canAddUser(companyId: string): Promise<boolean> {
  const limits = await getLimitsInfo(companyId)
  if (!limits || limits.max_users === null) return true // null means unlimited

  const supabase = await createClient()
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  return (count || 0) < limits.max_users
}

export async function canAddBranch(companyId: string): Promise<boolean> {
  const limits = await getLimitsInfo(companyId)
  if (!limits || limits.max_branches === null) return true

  const supabase = await createClient()
  const { count } = await supabase
    .from('branches')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  return (count || 0) < limits.max_branches
}

export async function canAddProduct(companyId: string): Promise<boolean> {
  const limits = await getLimitsInfo(companyId)
  if (!limits || limits.max_products === null) return true

  const supabase = await createClient()
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  return (count || 0) < limits.max_products
}

export async function canCreateInvoice(companyId: string): Promise<boolean> {
  const limits = await getLimitsInfo(companyId)
  if (!limits || limits.max_invoices_per_month === null) return true

  const supabase = await createClient()
  
  // Start of current month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .gte('created_at', startOfMonth.toISOString())

  return (count || 0) < limits.max_invoices_per_month
}

export async function hasFeature(companyId: string, featureName: keyof PlanLimitsInfo['features']): Promise<boolean> {
  const limits = await getLimitsInfo(companyId)
  if (!limits) return false
  return limits.features[featureName] || false
}
