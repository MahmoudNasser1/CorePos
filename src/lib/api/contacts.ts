import { backendFetch } from './backend-client'

export interface ContactInput {
  name: string
  email?: string
  phone?: string
  address?: string
  tax_number?: string
  notes?: string
}

export const contactsApi = {
  getCustomers: () => backendFetch<{ items: any[]; nextCursor: string | null; total?: number }>('/contacts/customers'),
  
  createCustomer: (data: ContactInput) => 
    backendFetch<any>('/contacts/customers', {
      method: 'POST',
      body: data
    }),

  getCustomer: (id: string) => backendFetch<any>(`/contacts/customers/${id}`),
  updateCustomer: (id: string, patch: any) => backendFetch<any>(`/contacts/customers/${id}`, { method: 'PATCH', body: patch }),

  getSuppliers: () => backendFetch<{ items: any[]; nextCursor: string | null; total?: number }>('/contacts/suppliers'),

  createSupplier: (data: ContactInput) => 
    backendFetch<any>('/contacts/suppliers', {
      method: 'POST',
      body: data
    }),

  getSupplier: (id: string) => backendFetch<any>(`/contacts/suppliers/${id}`),
  updateSupplier: (id: string, patch: any) => backendFetch<any>(`/contacts/suppliers/${id}`, { method: 'PATCH', body: patch }),
  
  // Note: Backend might need specific endpoints for ById or Statements, 
  // but we'll use the list capability or filter on frontend if needed for now.
}
