import { backendFetch } from './backend-client'

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
    console.error('Failed to fetch backend session:', error)
    return null
  }
}
