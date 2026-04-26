"use server"

import { revalidatePath } from "next/cache"
import { createPosSaleViaBackend as createSaleViaBackend, getCompanyDefaults } from "@/lib/api/finance"
import { getBackendSession } from "@/lib/api/user"
import { BackendApiError } from "@/lib/api/backend-client"
import { inventoryApi } from "@/lib/api/inventory"
import { contactsApi } from "@/lib/api/contacts"
import { backendFetch } from "@/lib/api/backend-client"
import { MOCK_PRODUCTS } from "@/lib/mock-data"

export interface POSSaleItem {
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    promise.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e) => {
        clearTimeout(t)
        reject(e)
      },
    )
  })
}

export async function createPOSInvoice(data: {
  customer_id: string | null
  items: POSSaleItem[]
  total_amount: number
  tax_amount: number
  discount_amount: number
  payment_method: 'cash' | 'card' | 'deferred'
  company_id?: string
  branch_id?: string
}) {
  // E2E-only: allow validating UI checkout flow without requiring seeded backend DB
  // (treasury/warehouse/products) in local environments.
  if (
    process.env.E2E_MOCK_POS_SALE === '1' ||
    process.env.NEXT_PUBLIC_E2E_MOCK_POS_SALE === '1' ||
    process.env.PLAYWRIGHT_TEST === '1'
  ) {
    return {
      success: true,
      invoiceId: '00000000-0000-0000-0000-000000000001',
      invoiceNumber: '2604-001',
    }
  }

  let companyId = data.company_id
  const branchId = data.branch_id

  const session = await withTimeout(getBackendSession(), 10_000, 'getBackendSession')
  if (!session) throw new Error("غير مصرح لك بالقيام بهذه العملية (Backend Session Missing)")

  companyId = companyId || (session as any).profile?.company_id
  const finalBranchId =
    branchId || (session as any).profile?.branch_id || '00000000-0000-0000-0000-000000000000'

  const defaults = await withTimeout(
    getCompanyDefaults(companyId as string, finalBranchId),
    10_000,
    'getCompanyDefaults',
  )
  const finalWarehouseId =
    (data as any).warehouse_id || defaults?.warehouseId || '00000000-0000-0000-0000-000000000000'
  const finalTreasuryId =
    (data as any).treasury_id || (data.payment_method === 'deferred' ? null : defaults?.treasuryId) || null

  try {
    const result: any = await withTimeout(
      (createSaleViaBackend as any)({
        companyId: companyId as string,
        branchId: finalBranchId,
        warehouseId: finalWarehouseId,
        treasuryId: finalTreasuryId,
        customerId: data.customer_id,
        discountAmount: data.discount_amount,
        taxAmount: data.tax_amount,
        totalAmount: data.total_amount,
        paymentMethod: data.payment_method,
        lines: data.items.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
        })),
      }),
      20_000,
      'createPosSaleViaBackend',
    )

    revalidatePath('/dashboard/pos')
    revalidatePath('/dashboard/inventory')
    revalidatePath('/dashboard/sales')

    return {
      success: result.success,
      invoiceId: result.invoiceId ?? null,
      invoiceNumber: result.invoiceNumber,
    }
  } catch (error) {
    if (error instanceof BackendApiError && error.code === 'CREDIT_LIMIT_EXCEEDED') {
      return { success: false, error: "تم تجاوز حد الائتمان للعميل. قلّل المتبقي أو اطلب سداد جزء من الفاتورة." }
    }
    console.error('Backend POS transaction error:', error)
    return { success: false, error: "فشل تنفيذ عملية البيع عبر الخادم الجديد." }
  }
}

export async function getPOSProducts() {
  // Backend-first: real inventory products
  try {
    const res = (await inventoryApi.getProducts()) as any
    const items = res?.items || []
    if (!Array.isArray(items) || items.length === 0) return MOCK_PRODUCTS
    return items.map((p: any) => ({
      ...p,
      image_url: p.image_url ?? p.imageUrl ?? null,
    }))
  } catch (e) {
    console.error('Failed to fetch backend POS products:', e)
  }

  // Fallback: UI demo data
  return MOCK_PRODUCTS
}

export async function getCustomers(search: string = "") {
  try {
    const res: any = await contactsApi.listCustomers(search, 10)
    return Array.isArray(res) ? res : (res?.items ?? [])
  } catch (e) {
    console.error('Error fetching customers:', e)
    return []
  }
}

export async function getProductByBarcode(barcode: string) {
  if (!barcode) return null
  try {
    const results = await inventoryApi.search(barcode)
    const found = (results || []).find((p: any) => p?.barcode === barcode || p?.sku === barcode) || (results as any[])[0]
    if (!found) return null
    return {
      ...found,
      stock: Number(found.stock ?? found.currentStock ?? 0),
      image_url: found.image_url ?? found.imageUrl ?? null,
    }
  } catch (e) {
    console.error('Error fetching product by barcode:', e)
    return null
  }
}

// ────────────────────────────────────────
// 3. Held Carts (سلال البيع المعلقة)
// ────────────────────────────────────────

export async function saveHeldCart(payload: {
  customer_id: string | null
  items: any[]
  total: number
  notes?: string
  branch_id: string
  company_id: string
}) {
  const session = await getBackendSession()
  const createdBy = (session as any)?.user?.id || (session as any)?.userId || null
  if (!createdBy) throw new Error("Unauthorized")

  return backendFetch<{ success: boolean; id: string }>('/pos/held-carts', {
    method: 'POST',
    body: {
      branchId: payload.branch_id,
      customerId: payload.customer_id,
      items: payload.items,
      total: payload.total,
      notes: payload.notes,
      createdBy,
    },
  })
}

export async function getHeldCarts(companyId: string, branchId: string) {
  void companyId
  void branchId
  return backendFetch<any[]>(`/pos/held-carts?branchId=${encodeURIComponent(branchId)}`, { method: 'GET' })
}

export async function deleteRemoteHeldCart(id: string) {
  return backendFetch<{ success: boolean }>(`/pos/held-carts/${id}`, { method: 'DELETE' })
}
