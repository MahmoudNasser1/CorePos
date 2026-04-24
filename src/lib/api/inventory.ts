import { backendFetch } from './backend-client'

export const inventoryApi = {
  getProducts: () => backendFetch('/inventory/products'),
  createProduct: (data: any) => backendFetch('/inventory/products', {
    method: 'POST',
    body: data
  }),
  getProduct: (id: string) => backendFetch(`/inventory/products/${id}`),
  getCategories: () => backendFetch('/inventory/categories'),
  createCategory: (data: any) => backendFetch('/inventory/categories', {
    method: 'POST',
    body: data
  }),
  updateCategory: (id: string, data: any) => backendFetch(`/inventory/categories/${id}`, { method: 'PATCH', body: data }),
  getLowStock: () => backendFetch<any[]>('/inventory/low-stock'),
  search: (q: string) => backendFetch<any[]>(`/inventory/search?q=${encodeURIComponent(q)}`),
}
