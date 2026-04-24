import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCreatePosSaleViaBackend = vi.hoisted(() => vi.fn())
const mockGetCompanyDefaults = vi.hoisted(() => vi.fn())

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/api/feature-flags', () => ({
  isBackendEnabled: (flag: string) => flag === 'finance',
}))

vi.mock('@/lib/api/user', () => ({
  getBackendSession: vi.fn(async () => ({
    profile: { company_id: 'comp_1', branch_id: 'branch_1' },
  })),
}))

vi.mock('@/lib/api/finance', () => ({
  createPosSaleViaBackend: (...args: unknown[]) => mockCreatePosSaleViaBackend(...args),
  getCompanyDefaults: (...args: unknown[]) => mockGetCompanyDefaults(...args),
}))

import { createPOSInvoice } from '@/lib/actions/pos.actions'

describe('POS Logic & Backend Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully creates an invoice via backend when enabled', async () => {
    mockGetCompanyDefaults.mockResolvedValue({ warehouseId: 'wh_1', treasuryId: 'tr_1' })
    mockCreatePosSaleViaBackend.mockResolvedValue({ success: true, invoiceId: 'inv_123', invoiceNumber: '2604-001' })

    const result = await createPOSInvoice({
      customer_id: 'cust_1',
      items: [{ product_id: 'prod_1', quantity: 2, unit_price: 100, subtotal: 200 }],
      total_amount: 200,
      tax_amount: 0,
      discount_amount: 0,
      payment_method: 'cash',
    })

    expect(result.success).toBe(true)
    expect(result.invoiceId).toBe('inv_123')
    expect(mockCreatePosSaleViaBackend).toHaveBeenCalledOnce()
  })

  it('handles backend failures gracefully', async () => {
    mockGetCompanyDefaults.mockResolvedValue({ warehouseId: 'wh_1', treasuryId: 'tr_1' })
    mockCreatePosSaleViaBackend.mockRejectedValue(new Error('Backend Timeout'))

    const result = await createPOSInvoice({
      customer_id: 'cust_1',
      items: [],
      total_amount: 0,
      tax_amount: 0,
      discount_amount: 0,
      payment_method: 'cash',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('فشل تنفيذ عملية البيع')
  })
})

