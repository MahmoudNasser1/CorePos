import { backendFetch } from './backend-client'
import { randomUUID } from 'node:crypto'

type PosSaleLine = {
  productId: string
  quantity: number
  unitPrice: number
}

type CreatePosSalePayload = {
  companyId: string
  warehouseId: string
  treasuryId?: string | null
  customerId?: string | null
  discountAmount: number
  taxAmount: number
  totalAmount: number
  paymentMethod: 'cash' | 'card' | 'deferred'
  lines: PosSaleLine[]
}

type CreatePosSaleResponse = {
  success: boolean
  mode: string
  invoiceId?: string
  invoiceNumber: string
}

export async function createPosSaleViaBackend(payload: CreatePosSalePayload) {
  return backendFetch<CreatePosSaleResponse>('/finance/pos-sale', {
    method: 'POST',
    body: payload,
    companyId: payload.companyId,
    idempotencyKey: randomUUID(),
  })
}

export async function getCompanyDefaults(companyId: string, branchId?: string) {
  const query = branchId ? `?branchId=${branchId}` : ''
  return backendFetch<{ warehouseId: string | null; treasuryId: string | null }>(`/finance/defaults/${companyId}${query}`, {
    method: 'GET',
    companyId,
  })
}

