import { backendFetch } from './backend-client'

export type ContactCustomer = {
  id: string
  name: string
  phone?: string | null
  address?: string | null
  email?: string | null
  balance?: number | string | null
}

export type ContactSupplier = {
  id: string
  name: string
  phone?: string | null
  address?: string | null
  email?: string | null
  balance?: number | string | null
}

export interface ContactInput {
  name: string
  email?: string
  phone?: string
  address?: string
  tax_number?: string
  notes?: string
}

function qs(q?: string, limit?: number) {
  const sp = new URLSearchParams()
  if (q) sp.set('q', q)
  if (limit) sp.set('limit', String(limit))
  const s = sp.toString()
  return s ? `?${s}` : ''
}

export const contactsApi = {
  listCustomers: (qStr?: string, limit?: number) =>
    backendFetch<ContactCustomer[]>(`/contacts/customers${qs(qStr, limit)}`),
  createCustomer: (data: ContactInput) =>
    backendFetch<any>('/contacts/customers', { method: 'POST', body: data }),
  getCustomer: (id: string) => backendFetch<any>(`/contacts/customers/${id}`),
  updateCustomer: (id: string, patch: any) =>
    backendFetch<any>(`/contacts/customers/${id}`, { method: 'PATCH', body: patch }),

  listSuppliers: (qStr?: string, limit?: number) =>
    backendFetch<ContactSupplier[]>(`/contacts/suppliers${qs(qStr, limit)}`),
  createSupplier: (data: ContactInput) =>
    backendFetch<any>('/contacts/suppliers', { method: 'POST', body: data }),
  getSupplier: (id: string) => backendFetch<any>(`/contacts/suppliers/${id}`),
  updateSupplier: (id: string, patch: any) =>
    backendFetch<any>(`/contacts/suppliers/${id}`, { method: 'PATCH', body: patch }),
}
