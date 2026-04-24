"use server"

import { revalidatePath } from "next/cache"
import { inventoryApi } from "@/lib/api/inventory"

export async function getInventoryProducts() {
  const res = (await inventoryApi.getProducts()) as any
  return res?.items || []
}

export const getInventory = getInventoryProducts

export async function getCategories() {
  const res = (await inventoryApi.getCategories()) as any
  return res || []
}

export async function isBarcodeUnique(barcode: string, productId?: string) {
  if (!barcode) return true
  void productId
  // Barcode uniqueness check endpoint not implemented yet in backend.
  // Return true to avoid blocking the flow.
  return true
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
  const res = await inventoryApi.createProduct(productData)
  revalidatePath('/dashboard/inventory/products')
  return res
}

export async function saveCategory(categoryData: CategoryInput) {
  const res = await inventoryApi.createCategory(categoryData)
  revalidatePath('/dashboard/inventory/categories')
  return res
}

export async function deleteCategory(id: string) {
  void id
  // TODO: implement delete category in backend inventory API.
  revalidatePath('/dashboard/inventory/categories')
  return { success: true }
}

export async function getUnits() {
  const res = await inventoryApi.getUnits()
  return (res as any[]) || []
}

export async function saveUnit(unitData: UnitInput) {
  const res = await inventoryApi.createUnit(unitData)
  revalidatePath('/dashboard/inventory/units')
  return res as any
}

export async function deleteUnit(id: string) {
  const res = await inventoryApi.deleteUnit(id)
  revalidatePath('/dashboard/inventory/units')
  return res as any
}

export async function getProductInsights(productId: string) {
  void productId
  return {
    product: null,
    stockDistribution: [],
    recentSales: [],
    stats: { totalSold: 0, totalRevenue: 0, totalProfit: 0 },
    dailyData: [],
  }
}

export async function getLowStockAlerts(companyId: string) {
  void companyId
  const res = await inventoryApi.getLowStock()
  if (!Array.isArray(res)) return []
  return res.map((item: any) => ({
    current_stock: item.currentStock,
    branch_id: null,
    products: {
      id: item.productId,
      name: item.name,
      min_qty: item.minQty,
      sku: item.sku,
    },
    branches: {
      name: 'Default',
    },
  }))
}
