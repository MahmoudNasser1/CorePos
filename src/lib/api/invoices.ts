import { backendFetch } from './backend-client'
import { randomUUID } from 'node:crypto'

type SaleInvoiceItem = {
  product_id: string
  qty: number
  unit_price: number
  total_line: number
}

type SaleInvoicePayload = {
  companyId: string
  warehouseId: string
  customerId?: string | null
  cashierId: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  paid: number
  remaining: number
  treasuryId?: string | null
  items: SaleInvoiceItem[]
}

type SaleInvoiceResponse = {
  success: boolean
  id: string
  invoiceNumber: string
}

export async function createSaleInvoiceViaBackend(payload: SaleInvoicePayload) {
  return backendFetch<SaleInvoiceResponse>('/finance/sale-invoice', {
    method: 'POST',
    body: {
      ...payload,
      items: payload.items.map((item) => ({
        productId: item.product_id,
        qty: item.qty,
        unitPrice: item.unit_price,
        totalLine: item.total_line,
      })),
    },
    companyId: payload.companyId,
    userId: payload.cashierId,
    idempotencyKey: randomUUID(),
  })
}
