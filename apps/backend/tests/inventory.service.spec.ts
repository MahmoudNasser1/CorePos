import { Client } from 'pg'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { ensureTestDatabase, getTestDatabaseUrl } from './helpers/test-db'
import { createPgClient } from './helpers/pg-client'
import { resetDb } from './helpers/reset-db'
import {
  createBranch,
  createCategory,
  createCompany,
  createProduct,
  createTreasury,
  createUnit,
  createWarehouse,
  setStock,
} from './helpers/factories'

describe('InventoryService (db-backed)', () => {
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

  it('listProducts returns only products for the given company (tenant isolation)', async () => {
    const svc = new InventoryService()

    const c1 = await createCompany(client, { name: 'A' })
    const c2 = await createCompany(client, { name: 'B' })

    await createProduct(client, { companyId: c1.id, name: 'Prod A1' })
    await createProduct(client, { companyId: c2.id, name: 'Prod B1' })

    const res = await svc.listProducts(c1.id, { limit: 50 })
    expect(res.items.map((p: any) => p.name)).toEqual(['Prod A1'])
  })

  it('search filters by name/barcode/sku', async () => {
    const svc = new InventoryService()
    const c1 = await createCompany(client)

    await createProduct(client, { companyId: c1.id, name: 'ماوس لاسلكي', barcode: '123', sku: 'SKU-1' })
    await createProduct(client, { companyId: c1.id, name: 'خلاط', barcode: '999', sku: 'SKU-2' })

    const res1 = await svc.listProducts(c1.id, { q: 'sku-2', limit: 25 })
    expect(res1.items).toHaveLength(1)
    expect((res1.items[0] as any).sku).toBe('SKU-2')

    const res2 = await svc.listProducts(c1.id, { q: '123', limit: 25 })
    expect(res2.items).toHaveLength(1)
    expect((res2.items[0] as any).barcode).toBe('123')
  })

  it('createProduct can initialize stock when warehouseId is provided', async () => {
    const svc = new InventoryService()
    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id })
    await createTreasury(client, { companyId: company.id, branchId: branch.id })

    const category = await createCategory(client, { companyId: company.id })
    const unit = await createUnit(client, { companyId: company.id })

    const product = await svc.createProduct(company.id, {
      name: 'منتج',
      categoryId: category.id,
      unitId: unit.id,
      warehouseId: warehouse.id,
      initialQty: '10',
      costPrice: '5',
      price1: '8',
    })

    const stock = await client.query(`select qty, avg_cost from product_stock where product_id = $1 and warehouse_id = $2`, [
      product.id,
      warehouse.id,
    ])
    expect(stock.rows).toHaveLength(1)
    expect(Number(stock.rows[0].qty)).toBe(10)
    expect(Number(stock.rows[0].avg_cost)).toBe(5)
  })

  it('updateStock computes weighted average cost and syncs product avg_cost', async () => {
    const svc = new InventoryService()
    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id })

    const product = await createProduct(client, { companyId: company.id, name: 'P', avgCost: 10 })
    await setStock(client, { productId: product.id, warehouseId: warehouse.id, qty: 10, avgCost: 10 })

    // Buy 10 more @ 20 => newAvg = (10*10 + 10*20) / 20 = 15
    await svc.updateStock(product.id, warehouse.id, 10, 20)

    const s = await client.query(`select qty, avg_cost from product_stock where product_id = $1 and warehouse_id = $2`, [
      product.id,
      warehouse.id,
    ])
    expect(Number(s.rows[0].qty)).toBe(20)
    expect(Number(s.rows[0].avg_cost)).toBeCloseTo(15, 5)

    const p = await client.query(`select avg_cost from products where id = $1`, [product.id])
    expect(Number(p.rows[0].avg_cost)).toBeCloseTo(15, 5)
  })

  it('getLowStockAlerts returns items where current_stock <= min_qty', async () => {
    const svc = new InventoryService()
    const company = await createCompany(client)
    const branch = await createBranch(client, { companyId: company.id })
    const warehouse = await createWarehouse(client, { branchId: branch.id })

    const low = await createProduct(client, { companyId: company.id, name: 'Low', avgCost: 1 })
    const ok = await createProduct(client, { companyId: company.id, name: 'Ok', avgCost: 1 })

    // Set min_qty in products table directly for the test
    await client.query(`update products set min_qty = '5' where id = $1`, [low.id])
    await client.query(`update products set min_qty = '5' where id = $1`, [ok.id])

    await setStock(client, { productId: low.id, warehouseId: warehouse.id, qty: 5, avgCost: 1 })
    await setStock(client, { productId: ok.id, warehouseId: warehouse.id, qty: 6, avgCost: 1 })

    const alerts = await svc.getLowStockAlerts(company.id)
    expect(alerts.map((a: any) => a.name)).toEqual(['Low'])
  })
})

