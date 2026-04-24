export type AuthUser = {
  id: string
  email: string
  companyId?: string
  role?: string
}

export type Profile = {
  id: string
  company_id?: string | null
  branch_id?: string | null
  full_name?: string | null
  role?: string | null
}

export type Company = {
  id: string
  name?: string | null
  phone?: string | null
  tax_number?: string | null
  address?: string | null
  email?: string | null
  vatRate?: number | string | null
}

export type Subscription = {
  id: string
  status?: string | null
  current_period_end?: string | null
  plan_id?: string | null
}

export type Plan = {
  id: string
  name?: string | null
  max_branches?: number | null
  max_users?: number | null
  max_products?: number | null
}

export interface PlanLimitsInfo {
  max_users: number | null
  max_branches: number | null
  max_warehouses: number | null
  max_products: number | null
  max_invoices_per_month: number | null
  storage_limit_mb: number | null
  features: {
    reports_advanced: boolean
    export_excel: boolean
    custom_invoices: boolean
    api_access: boolean
    zatca_invoice: boolean // Renamed from Arabic key
  }
}

export type CompanyWithSubscription = Company & {
  subscriptions: (Subscription & {
    plans: Plan | null
  })[] | null
}

export interface AuthState {
  user: AuthUser | null
  profile: Profile | null
  company: Company | null
  subscription: Subscription | null
  plan: Plan | null
  limits: PlanLimitsInfo | null
  isLoading: boolean
}
