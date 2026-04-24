"use server"

import { inventoryApi } from "@/lib/api/inventory"
import { contactsApi } from "@/lib/api/contacts"

export interface SearchResult {
  id: string
  title: string
  subtitle?: string
  type: "product" | "customer" | "page"
  href: string
  price?: number
}

export async function getGlobalSearchResults(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  const results: SearchResult[] = []

  // 1. Search Products
  try {
    const productsRes: any = await inventoryApi.search(query)
    ;(productsRes || []).slice(0, 5).forEach((p: any) => {
      results.push({
        id: p.id,
        title: p.name,
        subtitle: p.barcode || p.sku || "بدون باركود",
        type: "product",
        href: `/dashboard/inventory/products`,
        price: p.price1 ?? p.price ?? undefined,
      })
    })
  } catch {}

  // 2. Search Customers
  try {
    const customers = await contactsApi.listCustomers(query, 5)
    ;(customers || []).slice(0, 5).forEach((c: any) => {
      results.push({
        id: c.id,
        title: c.name,
        subtitle: c.phone || "بدون هاتف",
        type: "customer",
        href: `/dashboard/customers`,
      })
    })
  } catch {}

  return results
}
