import { backendFetch } from './backend-client'

export type AdminBranch = {
  id: string
  companyId: string
  name: string
  address?: string | null
  phone?: string | null
  isActive?: boolean | null
  createdAt?: string | null
}

export type AdminWarehouse = {
  id: string
  name: string
  branchId: string
  isDefault: boolean
  isActive: boolean
  createdAt: string
  branchName: string
}

export const adminApi = {
  listBranches: () => backendFetch<AdminBranch[]>('/admin/branches'),
  createBranch: (payload: { name: string; address?: string; phone?: string }) =>
    backendFetch<AdminBranch | null>('/admin/branches', { method: 'POST', body: payload }),
  updateBranch: (id: string, payload: { name?: string; address?: string; phone?: string; isActive?: boolean }) =>
    backendFetch<AdminBranch | null>(`/admin/branches/${id}`, { method: 'PATCH', body: payload }),
  listWarehouses: () => backendFetch<AdminWarehouse[]>('/admin/warehouses'),
  createWarehouse: (payload: { name: string; branchId: string; isDefault?: boolean; isActive?: boolean }) =>
    backendFetch<AdminWarehouse | null>('/admin/warehouses', { method: 'POST', body: payload }),
  updateWarehouse: (id: string, payload: { name?: string; isDefault?: boolean; isActive?: boolean }) =>
    backendFetch<AdminWarehouse | null>(`/admin/warehouses/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload }),
  getCompany: () => backendFetch<any>('/admin/company'),
  updateCompany: (payload: {
    name?: string
    phone?: string
    address?: string
    email?: string
    nameEn?: string
    logoUrl?: string
    taxNumber?: string
    vatRate?: number
    currency?: string
    countryCode?: string
    timezone?: string
    defaultBranchId?: string | null
  }) => backendFetch<any>('/admin/company', { method: 'POST', body: payload }),
  listUsers: () => backendFetch<any[]>('/admin/users'),
}

