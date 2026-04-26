import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const mockContactsApi = vi.hoisted(() => ({
  listCustomers: vi.fn(),
  createCustomer: vi.fn(),
  listSuppliers: vi.fn(),
  createSupplier: vi.fn(),
}))

vi.mock('@/lib/api/contacts', () => ({ contactsApi: mockContactsApi }))

import { getCustomers, saveCustomer } from '@/lib/actions/customers.actions'

describe('Contacts Logic & Backend Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches customers from backend', async () => {
    mockContactsApi.listCustomers.mockResolvedValue({ items: [{ id: 'c1', name: 'Customer One' }] })

    const customers = await getCustomers()

    expect(customers).toHaveLength(1)
    expect(customers[0]?.name).toBe('Customer One')
    expect(mockContactsApi.listCustomers).toHaveBeenCalledOnce()
  })

  it('creates customer via backend', async () => {
    mockContactsApi.createCustomer.mockResolvedValue({ success: true, data: { id: 'c2' } })

    const result = await saveCustomer({ name: 'New Customer' })

    expect(result.success).toBe(true)
    expect(mockContactsApi.createCustomer).toHaveBeenCalledWith({ name: 'New Customer' })
  })
})

