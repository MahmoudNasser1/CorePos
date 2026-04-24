"use server"

import { createClient } from "@/lib/supabase/server"

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

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  if (error || !profile) return []

  const results: SearchResult[] = []

  // 1. Search Products
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price1, barcode")
    .eq("company_id", (profile as any).company_id)
    .ilike("name", `%${query}%`)
    .limit(5)

  if (products) {
    (products as any[]).forEach((p) => {
      results.push({
        id: p.id,
        title: p.name,
        subtitle: p.barcode || "بدون باركود",
        type: "product",
        href: `/dashboard/inventory/products`,
        price: p.price1
      })
    })
  }

  // 2. Search Customers
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone")
    .eq("company_id", (profile as any).company_id)
    .ilike("name", `%${query}%`)
    .limit(5)

  if (customers) {
    (customers as any[]).forEach((c) => {
      results.push({
        id: c.id,
        title: c.name,
        subtitle: c.phone || "بدون هاتف",
        type: "customer",
        href: `/dashboard/customers`,
      })
    })
  }

  return results
}
