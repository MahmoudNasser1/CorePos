import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/api/feature-flags', () => ({
  isBackendEnabled: (flag: string) => flag === 'inventory',
}))

const mockInventoryApi = vi.hoisted(() => ({
  getProducts: vi.fn(),
  createProduct: vi.fn(),
}))

vi.mock('@/lib/api/inventory', () => ({ inventoryApi: mockInventoryApi }))

import { getInventoryProducts, saveProduct } from '@/lib/actions/inventory.actions'

describe('Inventory Logic & Backend Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches products from backend when enabled', async () => {
    mockInventoryApi.getProducts.mockResolvedValue({
      items: [{ id: 'p1', name: 'Product 1', sku: 'S1' }],
    })

    const products = await getInventoryProducts()

    expect(products).toHaveLength(1)
    expect(products[0]?.name).toBe('Product 1')
    expect(mockInventoryApi.getProducts).toHaveBeenCalledOnce()
  })

  it('creates product via backend', async () => {
    mockInventoryApi.createProduct.mockResolvedValue({ success: true })

    const result = await saveProduct({
      name: 'New Item',
      sales_price: 50,
      cost_price: 30,
    })

    expect(result.success).toBe(true)
    expect(mockInventoryApi.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Item' }),
    )
  })
})

