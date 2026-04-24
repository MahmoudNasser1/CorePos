import { backendFetch } from './backend-client'
import { randomUUID } from 'node:crypto'

type PaymentPayload = {
  companyId: string
  treasuryId: string
  amount: number
  method: 'cash' | 'card' | 'bank'
  notes?: string
  invoiceId?: string
  customerId?: string
  createdBy: string
}

type PaymentResponse = {
  success: boolean
  id: string
}

export async function createPaymentViaBackend(payload: PaymentPayload) {
  return backendFetch<PaymentResponse>('/finance/payment-receipt', {
    method: 'POST',
    body: payload,
    companyId: payload.companyId,
    userId: payload.createdBy,
    idempotencyKey: randomUUID(),
  })
}
