import { PlanLimitsInfo } from '@/types/auth.types'

export async function getLimitsInfo(companyId: string): Promise<PlanLimitsInfo | null> {
  void companyId
  // Billing endpoints not implemented yet; treat as unlimited to avoid blocking flows.
  return {
    max_users: null,
    max_branches: null,
    max_warehouses: null,
    max_products: null,
    max_invoices_per_month: null,
    storage_limit_mb: null,
    features: {
      reports_advanced: true,
      export_excel: true,
      custom_invoices: true,
      api_access: true,
      zatca_invoice: true,
    },
  }
}

export async function canAddUser(companyId: string): Promise<boolean> {
  void companyId
  return true
}

export async function canAddBranch(companyId: string): Promise<boolean> {
  void companyId
  return true
}

export async function canAddProduct(companyId: string): Promise<boolean> {
  void companyId
  return true
}

export async function canCreateInvoice(companyId: string): Promise<boolean> {
  void companyId
  return true
}

export async function hasFeature(companyId: string, featureName: keyof PlanLimitsInfo['features']): Promise<boolean> {
  void companyId
  void featureName
  return true
}
