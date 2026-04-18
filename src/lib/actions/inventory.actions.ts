"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getInventoryProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  // Join product with its stock and category
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(name),
      product_stock(branch_id, current_stock)
    `)
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching inventory products:', error)
    return []
  }

  return data
}

export async function getCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('name')

  if (error) return []
  return data
}

export async function isBarcodeUnique(barcode: string, productId?: string) {
  if (!barcode) return true
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return true

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return true

  let query = supabase
    .from('products')
    .select('id')
    .eq('company_id', profile.company_id)
    .eq('barcode', barcode)
  
  if (productId) {
    query = query.neq('id', productId)
  }

  const { data, error } = await query.maybeSingle()
  
  if (error) {
    console.error('Error checking barcode:', error)
    return true // Assume unique on error to not block user, but log it
  }

  return !data
}

export interface ProductInput {
  id?: string
  name: string
  barcode?: string
  sales_price?: number
  cost_price?: number
  category_id?: string
  unit_id?: string
  description?: string
  initial_stock?: number
}

export interface CategoryInput {
  id?: string
  name: string
}

export interface UnitInput {
  id?: string
  name: string
  short_name?: string
}

export async function saveProduct(productData: ProductInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, branch_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error("No company found")

  const isNew = !productData.id
  
    // Extract initial_stock as it's not a column in the products table
    const { initial_stock, ...rest } = productData

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        ...rest,
        company_id: profile.company_id
      })
      .select()
      .single()

    if (error) throw error

    // 2. Initialize stock for the current branch if initial_stock provided
    if (productData.initial_stock) {
      await supabase.from('product_stock').insert({
        product_id: newProduct.id,
        branch_id: profile.branch_id,
        current_stock: productData.initial_stock,
        company_id: profile.company_id
      })
    }
  } else {
    // Update existing
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productData.id)

    if (error) throw error
  }

  revalidatePath('/dashboard/inventory/products')
  return { success: true }
}

export async function saveCategory(categoryData: CategoryInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error("No company found")

  if (categoryData.id) {
    const { error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', categoryData.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('categories')
      .insert({
        ...categoryData,
        company_id: profile.company_id
      })
    if (error) throw error
  }

  revalidatePath('/dashboard/inventory/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/inventory/categories')
  return { success: true }
}

export async function getUnits() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return []

  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('name')

  if (error) return []
  return data
}

export async function saveUnit(unitData: UnitInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error("No company found")

  if (unitData.id) {
    const { error } = await supabase
      .from('units')
      .update(unitData)
      .eq('id', unitData.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('units')
      .insert({
        ...unitData,
        company_id: profile.company_id
      })
    if (error) throw error
  }

  revalidatePath('/dashboard/inventory/units')
  return { success: true }
}

export async function deleteUnit(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('units').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/dashboard/inventory/units')
  return { success: true }
}

export async function getProductInsights(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. Get Product Basic Info
  const { data: product, error: productError } = await supabase
    .from('products')
    .select(`
      *,
      categories(name),
      units(name)
    `)
    .eq('id', productId)
    .single()

  if (productError) throw productError

  // 2. Get Stock Distribution across warehouses/branches
  const { data: stock, error: stockError } = await supabase
    .from('product_stock')
    .select(`
      qty,
      warehouse_id,
      warehouses(name)
    `)
    .eq('product_id', productId)

  if (stockError) console.error('Stock error:', stockError)

  // 3. Get Sales History and stats
  const { data: sales, error: salesError } = await supabase
    .from('invoice_items')
    .select(`
      qty,
      unit_price,
      cost_price,
      profit,
      invoices(
        id,
        invoice_number,
        created_at,
        customer_name,
        type
      )
    `)
    .eq('product_id', productId)
    .order('created_at', { foreignTable: 'invoices', ascending: false })
    .limit(20)

  if (salesError) console.error('Sales error:', salesError)

  // 4. Calculate Stats from sales data
  const stats = sales?.reduce((acc: any, item: any) => {
    const qty = Number(item.qty || 0)
    const revenue = Number(item.unit_price || 0) * qty
    const profit = Number(item.profit || 0)
    
    return {
      totalSold: acc.totalSold + qty,
      totalRevenue: acc.totalRevenue + revenue,
      totalProfit: acc.totalProfit + profit
    }
  }, { totalSold: 0, totalRevenue: 0, totalProfit: 0 }) || { totalSold: 0, totalRevenue: 0, totalProfit: 0 }

  // 5. Get Daily Sales Chart Data (Last 30 Days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: dailySales, error: dailyError } = await supabase
    .from('invoice_items')
    .select(`
      qty,
      unit_price,
      invoices(created_at)
    `)
    .eq('product_id', productId)
    .gte('created_at', thirtyDaysAgo.toISOString())
  
  if (dailyError) console.error('Daily sales error:', dailyError)

  // Aggregate daily sales
  const salesMap = new Map<string, number>()
  dailySales?.forEach(item => {
    if (!item.invoices?.created_at) return
    const date = new Date(item.invoices.created_at).toLocaleDateString('en-CA') // YYYY-MM-DD
    const amount = (item.unit_price || 0) * (item.qty || 0)
    salesMap.set(date, (salesMap.get(date) || 0) + amount)
  })

  const dailyData = Array.from({ length: 31 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (30 - i))
    const dateStr = d.toLocaleDateString('en-CA')
    return {
      date: dateStr,
      revenue: salesMap.get(dateStr) || 0
    }
  })

  return {
    product,
    stockDistribution: stock || [],
    recentSales: sales || [],
    stats,
    dailyData
  }
}

export async function getLowStockAlerts(companyId: string) {
  const supabase = await createClient()
  
  // Custom query to join product_stock with products and filter by min_qty
  const { data, error } = await supabase
    .from('product_stock')
    .select(`
      current_stock,
      branch_id,
      products (
        id,
        name,
        min_qty,
        sku
      ),
      branches (
        name
      )
    `)
    .eq('company_id', companyId)
    .lt('current_stock', 'products.min_qty' as any) // We might need a filter logic here because Supabase JS client doesn't support col-to-col comparison directly easily
  
  // Fallback: Using RPC or just post-filtering if the above doesn't work well
  // Let's use a safer approach since JS client lt() expects a value
  const { data: rawData, error: rawError } = await supabase
    .from('product_stock')
    .select(`
      current_stock,
      branch_id,
      products!inner (
        id,
        name,
        min_qty,
        sku
      ),
      branches (
        name
      )
    `)
    .eq('company_id', companyId)

  if (rawError) throw rawError

  const alerts = rawData.filter(item => 
    item.current_stock <= (item.products as any).min_qty
  )

  return alerts
}
