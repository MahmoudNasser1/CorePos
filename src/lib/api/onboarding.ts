import { backendFetch } from './backend-client'

type CreateInitialCompanyInput = {
  name: string
  phone: string
  address?: string
  currency: string
  vatRate: number
  countryCode?: string
  timezone?: string
  defaultBranchName?: string
  defaultWarehouseName?: string
}

export type BackendCompany = {
  id: string
  name: string
  phone: string
  address?: string
  currency: string
  vatRate: number
  slug: string
  is_active?: boolean
}

export type BackendSampleDataSummary = {
  categories: number
  products: number
  customers: number
  suppliers: number
}

export async function createInitialCompanyViaBackend(input: CreateInitialCompanyInput) {
  // backendFetch unwraps ApiOk<T> and returns T directly
  return backendFetch<BackendCompany>('/onboarding/company', {
    method: 'POST',
    body: input,
  })
}

export async function setupSampleDataViaBackend() {
  return backendFetch<BackendSampleDataSummary>('/onboarding/sample-data', {
    method: 'POST',
  })
}
