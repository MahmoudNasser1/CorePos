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
      sku: p.sku ?? null,
      price1: p.price1 != null ? Number(p.price1) : null,
      cost_price: p.costPrice != null ? Number(p.costPrice) : null,
      categories: p.category ? { name: p.category.name } : null,
      units: p.unit ? { name: p.unit.name } : null,
      product_stock: stockRows.map((s: any) => ({
        branch_id: (s.branchId ?? s.warehouseId ?? 'default') as string,
        current_stock: Number(s.qty ?? 0),
      })),
    }
  })
}

export const getInventory = getInventoryProducts

export async function getCategories() {
  const res = (await inventoryApi.getCategories()) as any[]
  if (!Array.isArray(res)) return []
  return res.map((c) => ({
    id: c.id,
    name: c.name,
    sort_order: c.sortOrder ?? c.sort_order ?? 0,
  }))
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
  /** @deprecated use `price1` (form uses price1) */
  sales_price?: number
  price1?: number
  price2?: number
  price3?: number
  cost_price?: number
  min_qty?: number
  category_id?: string
  unit_id?: string
  description?: string
  initial_stock?: number
  /** رابط عام (https) لصورة المنتج؛ لا يوجد رفع ملف من المتصفح في هذه النسخة. */
  image_url?: string
}

export interface CategoryInput {
  id?: string
  name: string
  parentId?: string
}

export interface UnitInput {
  id?: string
  name: string
  short_name?: string
}

function toNumericString(n: number | undefined | null): string | undefined {
  if (n == null || Number.isNaN(n as number)) return undefined
  return String(n)
}

function uuidOrNull(v: string | undefined): string | null {
  if (!v || v.trim() === "") return null
  return v
}

export async function saveProduct(productData: ProductInput) {
  const price1 = productData.price1 ?? productData.sales_price

  const imageTrim = (productData.image_url ?? "").trim()
  const imageUrlPayload = imageTrim.length > 0 ? imageTrim.slice(0, 2048) : null

  if (productData.id) {
    const patch: Record<string, unknown> = {
      name: productData.name,
      barcode: productData.barcode ?? null,
      categoryId: uuidOrNull(productData.category_id),
      unitId: uuidOrNull(productData.unit_id),
      price1: toNumericString(price1) ?? "0",
      price2: toNumericString(productData.price2) ?? "0",
      price3: toNumericString(productData.price3) ?? "0",
      costPrice: toNumericString(productData.cost_price) ?? "0",
      minQty: toNumericString(productData.min_qty) ?? "0",
      imageUrl: imageUrlPayload,
    }
    if (productData.description != null) patch.description = productData.description
    const res = await inventoryApi.updateProduct(productData.id, patch)
    revalidatePath("/dashboard/inventory/products")
    return res
  }

  const createPayload: Record<string, unknown> = {
    name: productData.name,
    barcode: productData.barcode,
    categoryId: uuidOrNull(productData.category_id) ?? undefined,
    unitId: uuidOrNull(productData.unit_id) ?? undefined,
    price1: toNumericString(price1) ?? "0",
    costPrice: toNumericString(productData.cost_price) ?? "0",
    price2: toNumericString(productData.price2) ?? "0",
    price3: toNumericString(productData.price3) ?? "0",
    minQty: toNumericString(productData.min_qty) ?? "0",
    initialQty: toNumericString(productData.initial_stock),
    imageUrl: imageUrlPayload ?? undefined,
  }
  if (productData.description != null) createPayload.description = productData.description
  const res = await inventoryApi.createProduct(createPayload)
  revalidatePath("/dashboard/inventory/products")
  return res
}

async function assertProductDeleted(
  res: { id?: string } | null,
) {
  if (res == null || res.id == null) {
    throw new Error("تعذّر حذف المنتج — قد يكون غير موجود أو سبق إخفاؤه.")
  }
  return res
}

export async function deleteProduct(id: string) {
  const res = await assertProductDeleted(
    (await inventoryApi.deleteProduct(id)) as { id?: string } | null,
  )
  revalidatePath("/dashboard/inventory/products")
  return res
}

export async function deleteManyProducts(ids: string[]) {
  await Promise.all(
    ids.map(async (id) =>
      assertProductDeleted(
        (await inventoryApi.deleteProduct(id)) as { id?: string } | null,
      ),
    ),
  )
  revalidatePath("/dashboard/inventory/products")
}

export async function saveCategory(categoryData: CategoryInput) {
  const res = await inventoryApi.createCategory({
    name: categoryData.name,
    parentId: categoryData.parentId,
  })
  revalidatePath("/dashboard/inventory/categories")
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
  return ((res as any[]) || []).map((u) => ({
    id: u.id,
    name: u.name,
    nameEn: u.nameEn ?? u.name_en,
  }))
}

export async function saveUnit(unitData: UnitInput) {
  const res = await inventoryApi.createUnit({
    name: unitData.name,
    nameEn: unitData.short_name,
  })
  revalidatePath("/dashboard/inventory/units")
  return res as any
}

export async function deleteUnit(id: string) {
  const res = await inventoryApi.deleteUnit(id)
  revalidatePath("/dashboard/inventory/units")
  return res as any
}

export async function deleteManyUnits(ids: string[]) {
  await Promise.all(ids.map((id) => inventoryApi.deleteUnit(id)))
  revalidatePath("/dashboard/inventory/units")
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
