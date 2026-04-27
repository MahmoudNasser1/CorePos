import { Client } from 'pg'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { ensureTestDatabase, getTestDatabaseUrl } from './helpers/test-db'
import { createPgClient } from './helpers/pg-client'
import { resetDb } from './helpers/reset-db'
import {
  createCompany,
  createBranch,
  createWarehouse,
} from './helpers/factories'

describe('Inventory Import & Auto-Barcode', () => {
  let client: Client
  let InventoryService: typeof import('../src/modules/inventory/inventory.service').InventoryService

  beforeAll(async () => {
    await ensureTestDatabase()
    process.env.TEST_DATABASE_URL = getTestDatabaseUrl()
    ;({ InventoryService } = await import('../src/modules/inventory/inventory.service'))
    client = await createPgClient()
  })

  afterAll(async () => {
    await client.end()
  })

  beforeEach(async () => {
    await resetDb(client)
  })

  it('bulkImportProducts generates barcodes when missing and recognizes Arabic headers mapping', async () => {
    const svc = new InventoryService()
    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id })

    const importInput = {
      products: [
        {
          name: 'منتج بدون باركود',
          categoryName: 'قسم تجريبي',
          unitName: 'قطعة',
          price1: '100',
          costPrice: '50',
          initialQty: '10'
        },
        {
          name: 'منتج بباركود يدوي',
          barcode: '999888777',
          price1: '200'
        }
      ]
    }

    const result = await svc.bulkImportProducts(company.id, importInput as any)
    
    expect(result.imported).toBe(2)
    expect(result.errors).toHaveLength(0)

    // Check DB for the products
    const prods = await svc.listProducts(company.id, { limit: 10 })
    expect(prods.items).toHaveLength(2)

    const pWithout = prods.items.find((p: any) => p.name === 'منتج بدون باركود') as any
    const pWith = prods.items.find((p: any) => p.name === 'منتج بباركود يدوي') as any

    // Verify manual barcode and SKU fallback
    expect(pWith.barcode).toBe('999888777')
    expect(pWith.sku).toBe('999888777') // Should match barcode since sku was missing

    // Verify auto-generated barcode and SKU fallback
    expect(pWithout.barcode).toBeDefined()
    expect(pWithout.barcode).toMatch(/^20\d{11}$/)
    expect(pWithout.sku).toBe(pWithout.barcode) // Should match auto-generated barcode
    
    // Verify stock initialization
    const stock = await client.query('select * from product_stock where product_id = $1', [pWithout.id])
    expect(stock.rows).toHaveLength(1)
    expect(Number(stock.rows[0].qty)).toBe(10)
  })

  it('bulkImportProducts skips duplicate barcodes and keeps other imported', async () => {
    const svc = new InventoryService()
    const company = await createCompany(client)
    
    // First import
    await svc.bulkImportProducts(company.id, {
      products: [{ name: 'Existing', barcode: 'DUP123', price1: '10' }]
    } as any)

    // Second import with a duplicate
    const result = await svc.bulkImportProducts(company.id, {
      products: [
        { name: 'New Success', barcode: 'NEW123', price1: '20' },
        { name: 'Failure', barcode: 'DUP123', price1: '30' }
      ]
    } as any)

    expect(result.imported).toBe(1)
    expect(result.skipped).toBe(1)
    expect(result.errors[0]).toContain('موجود مسبقاً')
  })
})
