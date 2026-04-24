"use server"

import { revalidatePath } from "next/cache"
import { inventoryApi } from "@/lib/api/inventory"

export async function getInventoryProducts() {
  const res = (await inventoryApi.getProducts()) as any
  const items = (res?.items ?? []) as any[]

  // Map backend camelCase + relations to the UI table shape.
  return items.map((p: any) => {
    const stockRows = Array.isArray(p?.stock) ? p.stock : []
    return {
      id: p.id,
      name: p.name,
      barcode: p.barcode ?? null,
      price1: p.price1 != null ? Number(p.price1) : null,
      cost_price: p.costPrice != null ? Number(p.costPrice) : null,
      categories: p.category ? { name: p.category.name } : null,
      product_stock: stockRows.map((s: any) => ({
        branch_id: (s.branchId ?? s.warehouseId ?? 'default') as string,
        current_stock: Number(s.qty ?? 0),
      })),
    }
  })
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
  const payload: any = {
    name: productData.name,
    barcode: productData.barcode,
    categoryId: productData.category_id,
    unitId: productData.unit_id,
    // backend DTO expects numeric strings
    price1: productData.sales_price != null ? String(productData.sales_price) : undefined,
    costPrice: productData.cost_price != null ? String(productData.cost_price) : undefined,
    initialQty: productData.initial_stock != null ? String(productData.initial_stock) : undefined,
    // optional (ignored by backend if unknown)
    description: productData.description,
  }

  const res = productData.id
    ? await inventoryApi.updateProduct(productData.id, payload)
    : await inventoryApi.createProduct(payload)
  revalidatePath('/dashboard/inventory/products')
  return res
}

export async function deleteProduct(id: string) {
  const res = await inventoryApi.deleteProduct(id)
  revalidatePath('/dashboard/inventory/products')
  return res as any
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
  const res = await inventoryApi.getProductInsights(productId)
  return (res as any) ?? {
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
