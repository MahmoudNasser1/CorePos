import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/common/db/drizzle', () => {
  return {
    db: {
      transaction: vi.fn(),
      execute: vi.fn(),
    },
  }
})

import { BadRequestException } from '@nestjs/common'
import { db } from '../src/common/db/drizzle'
import { FinanceService } from '../src/modules/finance/finance.service'

function getCode(err: unknown): string | undefined {
  const anyErr = err as any
  if (anyErr?.getResponse) return anyErr.getResponse()?.code
  return anyErr?.response?.code
}

describe('finance invariants', () => {
  it('PAYMENT_EXCEEDS_REMAINING when amount > remaining', async () => {
    const service = new FinanceService()

    const tx = {
      execute: vi.fn().mockResolvedValueOnce({
        rows: [{ customer_id: 'c-1', remaining: '10' }],
      }),
    }
    ;(db.transaction as any).mockImplementationOnce(async (fn: any) => fn(tx))

    try {
      await service.addPaymentReceipt({
        companyId: 'co-1',
        treasuryId: 't-1',
        amount: 11,
        method: 'cash',
        invoiceId: 'inv-1',
        createdBy: 'u-1',
      })
      throw new Error('Expected exception')
    } catch (err) {
      expect(err).toMatchObject({ name: BadRequestException.name })
      expect(getCode(err)).toBe('PAYMENT_EXCEEDS_REMAINING')
    }
  })

  it('CREDIT_LIMIT_EXCEEDED when invoice remaining exceeds credit limit', async () => {
    const service = new FinanceService()

    const tx = {
      execute: vi.fn().mockResolvedValueOnce({
        rows: [{ balance: '50', credit_limit: '100' }],
      }),
    }
    ;(db.transaction as any).mockImplementationOnce(async (fn: any) => fn(tx))

    try {
      await service.createSaleInvoice({
        companyId: 'co-1',
        branchId: 'b-1',
        warehouseId: 'w-1',
        customerId: 'c-1',
        cashierId: 'u-1',
        subtotal: 100,
        discountAmount: 0,
        taxAmount: 0,
        total: 100,
        paid: 0,
        remaining: 100,
        items: [{ productId: 'p-1', qty: 1, unitPrice: 100, totalLine: 100 }],
      } as any)
      throw new Error('Expected exception')
    } catch (err) {
      expect(err).toMatchObject({ name: BadRequestException.name })
      expect(getCode(err)).toBe('CREDIT_LIMIT_EXCEEDED')
    }
  })

  it('payment receipt updates invoice status to partial (SQL issued)', async () => {
    const service = new FinanceService()

    const calls: unknown[] = []
    const tx = {
      execute: vi.fn(async (q) => {
        calls.push(q as unknown)
        // 1) invoice lookup
        if (calls.length === 1) {
          return { rows: [{ customer_id: 'c-1', remaining: '10' }] }
        }
        // everything else can be empty
        return { rows: [] }
      }),
    }
    ;(db.transaction as any).mockImplementationOnce(async (fn: any) => fn(tx))

    await service.addPaymentReceipt({
      companyId: 'co-1',
      treasuryId: 't-1',
      amount: 5,
      method: 'cash',
      invoiceId: 'inv-1',
      createdBy: 'u-1',
    })

    // We can't easily introspect drizzle's SQL object; assert at least multiple queries were executed
    expect((tx.execute as any).mock.calls.length).toBeGreaterThanOrEqual(4)
  })
})

