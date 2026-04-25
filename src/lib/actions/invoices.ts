"use server"

import { revalidatePath } from "next/cache"
import { backendFetch, BackendApiError } from "@/lib/api/backend-client"
import { createSaleInvoiceViaBackend } from "@/lib/api/invoices"

// Backend-only invoice actions.
// Backend currently supports sale invoice flows; other flows need endpoints.

export async function getInvoices(filters?: { type?: string }) {
  const t = filters?.type
  if (t === "purchase") {
    const res = await backendFetch<{ items: any[] }>("/finance/purchase-invoices", { method: "GET" })
    return res?.items || []
  }
  if (t && t !== "sale") return []
  const res = await backendFetch<{ items: any[] }>("/finance/sale-invoices", { method: "GET" })
  return res?.items || []
}

export async function getInvoiceById(id: string) {
  return backendFetch<any>(`/finance/sale-invoices/${id}`, { method: "GET" })
}

export async function getPurchaseInvoiceById(id: string) {
  return backendFetch<any>(`/finance/purchase-invoices/${id}`, { method: "GET" })
}

export async function createSaleInvoice(invoiceData: any, items: any[], payments: any[]) {
  void payments
  try {
    const result = await createSaleInvoiceViaBackend({
      companyId: invoiceData.company_id,
      warehouseId: invoiceData.warehouse_id,
      customerId: invoiceData.customer_id ?? null,
      cashierId: invoiceData.cashier_id,
      subtotal: invoiceData.subtotal,
      discountAmount: invoiceData.discount_amount ?? 0,
      taxAmount: invoiceData.tax_amount ?? 0,
      total: invoiceData.total,
      paid: invoiceData.paid ?? 0,
      remaining: invoiceData.remaining ?? invoiceData.total,
      items: items.map((item: any) => ({
        product_id: item.product_id,
        qty: item.qty,
        unit_price: item.unit_price,
        total_line: item.total_line,
      })),
    })

    revalidatePath("/dashboard/sales/invoices")
    revalidatePath("/dashboard/inventory/products")
    return { success: result.success, id: result.id, invoiceNumber: result.invoiceNumber }
  } catch (error) {
    console.error("Backend sale invoice error:", error)
    return { success: false, error: "فشل إنشاء فاتورة البيع عبر الخادم الجديد" }
  }
}

export async function createPurchaseInvoice(..._args: any[]) {
  const [invoiceData, items] = _args as any[]
  const body = {
    branchId: invoiceData.branch_id ?? invoiceData.branchId,
    warehouseId: invoiceData.warehouse_id ?? invoiceData.warehouseId,
    supplierId: invoiceData.supplier_id ?? invoiceData.supplierId ?? null,
    cashierId: invoiceData.cashier_id ?? invoiceData.cashierId,
    subtotal: Number(invoiceData.subtotal || 0),
    discountAmount: Number(invoiceData.discount_amount || 0),
    taxAmount: Number(invoiceData.tax_amount || 0),
    total: Number(invoiceData.total || 0),
    paid: Number(invoiceData.paid || 0),
    remaining: Number(invoiceData.remaining || 0),
    treasuryId: invoiceData.treasury_id ?? invoiceData.treasuryId ?? null,
    items: (items || []).map((it: any) => ({
      productId: it.product_id ?? it.productId,
      qty: Number(it.qty || 0),
      unitPrice: Number(it.unit_price || it.unitPrice || 0),
      totalLine: Number(it.total_line || it.totalLine || 0),
    })),
  }
  try {
    const res = (await backendFetch<Record<string, unknown>>("/finance/purchase-invoice", {
      method: "POST",
      body,
    })) as { success?: boolean; id?: string; invoiceNumber?: string }
    revalidatePath("/dashboard/purchases/invoices")
    if (typeof res?.id === "string") {
      revalidatePath(`/dashboard/purchases/invoices/${res.id}`)
    }
    revalidatePath("/dashboard/inventory/products")
    return { success: true, ...res }
  } catch (e) {
    if (e instanceof BackendApiError) {
      return { success: false, error: e.message, code: e.code }
    }
    return { success: false, error: e instanceof Error ? e.message : "فشل إنشاء فاتورة المشتريات" }
  }
}
export async function cancelInvoice(..._args: any[]) {
  const [invoiceId] = _args as any[]
  const res = await backendFetch<any>("/finance/cancel-invoice", {
    method: "POST",
    body: { invoiceId },
  })
  revalidatePath("/dashboard/sales/invoices")
  revalidatePath("/dashboard/purchases/invoices")
  return res
}
export async function createQuotation(..._args: any[]) {
  const [payload] = _args as any[]
  const invoiceData = payload?.invoice ?? payload
  const items = payload?.items ?? invoiceData?.items ?? []
  const res = await backendFetch<any>("/finance/quotation", {
    method: "POST",
    body: {
      branchId: invoiceData.branch_id ?? invoiceData.branchId,
      warehouseId: invoiceData.warehouse_id ?? invoiceData.warehouseId,
      customerId: invoiceData.customer_id ?? invoiceData.customerId ?? null,
      cashierId: invoiceData.cashier_id ?? invoiceData.cashierId,
      subtotal: Number(invoiceData.subtotal || 0),
      discountAmount: Number(invoiceData.discount_amount || 0),
      taxAmount: Number(invoiceData.tax_amount || 0),
      total: Number(invoiceData.total || 0),
      items: (items || []).map((it: any) => ({
        productId: it.product_id ?? it.productId,
        qty: Number(it.qty || 0),
        unitPrice: Number(it.unit_price || it.unitPrice || 0),
        totalLine: Number(it.total_line || it.totalLine || 0),
      })),
    },
  })
  revalidatePath("/dashboard/sales/quotations")
  return res
}
export async function convertToInvoice(..._args: any[]) {
  const [quotationId] = _args as any[]
  const res = await backendFetch<any>("/finance/convert-quotation", {
    method: "POST",
    body: { quotationId },
  })
  revalidatePath("/dashboard/sales/invoices")
  revalidatePath("/dashboard/sales/quotations")
  return res
}
export async function createSaleReturn(..._args: any[]) {
  const [payload] = _args as any[]
  const invoiceData = payload?.invoice ?? payload
  const items = payload?.items ?? invoiceData?.items ?? []
  const res = await backendFetch<any>("/finance/sale-returns", {
    method: "POST",
    body: {
      branchId: invoiceData.branch_id ?? invoiceData.branchId,
      warehouseId: invoiceData.warehouse_id ?? invoiceData.warehouseId,
      customerId: invoiceData.customer_id ?? invoiceData.customerId ?? null,
      cashierId: invoiceData.cashier_id ?? invoiceData.cashierId,
      treasuryId: payload?.treasury_id ?? invoiceData.treasury_id ?? null,
      total: Number(invoiceData.total || 0),
      items: (items || []).map((it: any) => ({
        productId: it.product_id ?? it.productId,
        qty: Number(it.qty || 0),
        unitPrice: Number(it.unit_price || it.unitPrice || 0),
        totalLine: Number(it.total_line || it.totalLine || 0),
      })),
    },
  })
  revalidatePath("/dashboard/sales/invoices")
  revalidatePath("/dashboard/inventory/products")
  return res
}
export async function createPurchaseOrder(..._args: any[]) {
  const [payload] = _args as any[]
  const invoiceData = payload?.invoice ?? payload
  const items = payload?.items ?? invoiceData?.items ?? []
  const res = await backendFetch<any>("/finance/purchase-order", {
    method: "POST",
    body: {
      branchId: invoiceData.branch_id ?? invoiceData.branchId,
      warehouseId: invoiceData.warehouse_id ?? invoiceData.warehouseId,
      supplierId: invoiceData.supplier_id ?? invoiceData.supplierId ?? null,
      cashierId: invoiceData.cashier_id ?? invoiceData.cashierId,
      total: Number(invoiceData.total || 0),
      items: (items || []).map((it: any) => ({
        productId: it.product_id ?? it.productId,
        qty: Number(it.qty || 0),
        unitPrice: Number(it.unit_price || it.unitPrice || 0),
        totalLine: Number(it.total_line || it.totalLine || 0),
      })),
    },
  })
  revalidatePath("/dashboard/purchases/orders")
  return res
}
export async function convertPOToInvoice(..._args: any[]) {
  const [poId] = _args as any[]
  const res = await backendFetch<any>("/finance/convert-po", {
    method: "POST",
    body: { poId },
  })
  revalidatePath("/dashboard/purchases/invoices")
  revalidatePath("/dashboard/purchases/orders")
  revalidatePath("/dashboard/inventory/products")
  return res
}
export async function createPurchaseReturn(..._args: any[]) {
  const [payload] = _args as any[]
  const invoiceData = payload?.invoice ?? payload
  const items = payload?.items ?? invoiceData?.items ?? []
  const res = await backendFetch<any>("/finance/purchase-returns", {
    method: "POST",
    body: {
      branchId: invoiceData.branch_id ?? invoiceData.branchId,
      warehouseId: invoiceData.warehouse_id ?? invoiceData.warehouseId,
      supplierId: invoiceData.supplier_id ?? invoiceData.supplierId ?? null,
      cashierId: invoiceData.cashier_id ?? invoiceData.cashierId,
      treasuryId: payload?.treasury_id ?? invoiceData.treasury_id ?? null,
      total: Number(invoiceData.total || 0),
      items: (items || []).map((it: any) => ({
        productId: it.product_id ?? it.productId,
        qty: Number(it.qty || 0),
        unitPrice: Number(it.unit_price || it.unitPrice || 0),
        totalLine: Number(it.total_line || it.totalLine || 0),
      })),
    },
  })
  revalidatePath("/dashboard/purchases/returns")
  revalidatePath("/dashboard/inventory/products")
  return res
}
