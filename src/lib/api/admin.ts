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

export type AdminUser = {
  id: string
  fullName: string
  email: string
  role: string
  branchId?: string | null
  branchName?: string | null
  isActive: boolean
  createdAt: string
}

export type AdminAuditLog = {
  id: string
  action: string
  targetType: string
  targetId?: string | null
  reason?: string | null
  metaJson?: string | null
  ip?: string | null
  createdAt: string
  actorName: string
  actorEmail: string
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
  listUsers: () => backendFetch<AdminUser[]>('/admin/users'),
  createUser: (payload: { email: string; fullName: string; role: string; password?: string; branchId?: string }) =>
    backendFetch<AdminUser>('/admin/users', { method: 'POST', body: payload }),
  updateUser: (id: string, payload: { fullName?: string; role?: string; branchId?: string | null; reason: string }) =>
    backendFetch<AdminUser>(`/admin/users/${id}`, { method: 'PATCH', body: payload }),
  toggleUserActive: (id: string, reason: string) =>
    backendFetch<AdminUser>(`/admin/users/${id}/toggle-active`, { method: 'POST', body: { reason } }),
  resetUserPassword: (id: string, reason: string) =>
    backendFetch<{ success: true; tempPassword: string }>(`/admin/users/${id}/reset-password`, { method: 'POST', body: { reason } }),
  listAuditLogs: () => backendFetch<AdminAuditLog[]>('/admin/audit-logs'),
  getProfile: () => backendFetch<any>('/admin/profile'),
  updateMyProfile: (payload: { fullName?: string; phone?: string; avatarUrl?: string; quickStartDismissed?: boolean }) =>
    backendFetch<any>('/admin/profile', { method: 'PATCH', body: payload }),
}


