import { backendFetch } from './backend-client'

export const inventoryApi = {
  getProducts: () => backendFetch('/inventory/products'),
  createProduct: (data: any) => backendFetch('/inventory/products', {
    method: 'POST',
    body: data
  }),
  getProduct: (id: string) => backendFetch(`/inventory/products/${id}`),
  getProductInsights: (id: string) => backendFetch(`/inventory/products/${id}/insights`),
  updateProduct: (id: string, data: any) =>
    backendFetch(`/inventory/products/${id}`, { method: 'PATCH', body: data }),
  deleteProduct: (id: string) => backendFetch(`/inventory/products/${id}`, { method: 'DELETE' }),
  getCategories: () => backendFetch('/inventory/categories'),
  createCategory: (data: any) => backendFetch('/inventory/categories', {
    method: 'POST',
    body: data
  }),
  updateCategory: (id: string, data: any) => backendFetch(`/inventory/categories/${id}`, { method: 'PATCH', body: data }),
  getLowStock: () => backendFetch<any[]>('/inventory/low-stock'),
  search: (q: string) => backendFetch<any[]>(`/inventory/search?q=${encodeURIComponent(q)}`),
  getUnits: () => backendFetch<any[]>('/inventory/units'),
  createUnit: (data: any) => backendFetch('/inventory/units', { method: 'POST', body: data }),
  updateUnit: (id: string, data: any) => backendFetch(`/inventory/units/${id}`, { method: 'PATCH', body: data }),
  deleteUnit: (id: string) => backendFetch(`/inventory/units/${id}`, { method: 'DELETE' }),
}
