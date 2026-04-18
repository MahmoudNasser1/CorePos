import type { Database } from './database.types'
import type { User } from '@supabase/supabase-js'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Plan = Database['public']['Tables']['plans']['Row']

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
  user: User | null
  profile: Profile | null
  company: Company | null
  subscription: Subscription | null
  plan: Plan | null
  limits: PlanLimitsInfo | null
  isLoading: boolean
}
