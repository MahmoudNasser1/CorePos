import { backendFetch, BackendApiError } from './backend-client'

export type BackendSession = {
  user: {
    id: string
    email: string
    companyId?: string
    role?: string
  }
  profile: {
    company_id?: string
    branch_id?: string
    role: string
  }
}

export async function getBackendSession() {
  try {
    return await backendFetch<BackendSession>('/auth/session')
  } catch (error) {
    // An expired/missing token is a normal state during SSR; don't spam logs.
    if (
      error instanceof BackendApiError &&
      (error.status === 401 || error.code === 'AUTH_UNAUTHORIZED')
    ) {
      return null
    }

    console.error('Failed to fetch backend session:', error)
    return null
  }
}
