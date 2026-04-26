import { Client } from 'pg'
import { randomUUID } from 'node:crypto'

export function uuid() {
  return randomUUID()
}

export async function createCompany(client: Client, input?: { name?: string; phone?: string }) {
  const id = uuid()
  const name = input?.name ?? 'شركة الاختبار'
  const phone = input?.phone ?? '01000000000'
  await client.query(
    `
    insert into companies (id, name, phone, currency, vat_rate)
    values ($1, $2, $3, 'EGP', 0)
  `,
    [id, name, phone],
  )
  return { id, name, phone }
}

export async function createBranch(client: Client, input: { companyId: string; name?: string }) {
  const id = uuid()
  await client.query(
    `
    insert into branches (id, company_id, name, is_active)
    values ($1, $2, $3, true)
  `,
    [id, input.companyId, input.name ?? 'الفرع الرئيسي'],
  )
  return { id }
}

export async function createWarehouse(client: Client, input: { branchId: string; name?: string; isDefault?: boolean }) {
  const id = uuid()
  await client.query(
    `
    insert into warehouses (id, branch_id, name, is_default, is_active)
    values ($1, $2, $3, $4, true)
  `,
    [id, input.branchId, input.name ?? 'المخزن الرئيسي', input.isDefault ?? true],
  )
  return { id }
}

export async function createTreasury(client: Client, input: { companyId: string; branchId: string; name?: string; isDefault?: boolean }) {
  const id = uuid()
  await client.query(
    `
    insert into treasuries (id, company_id, branch_id, name, is_default, is_active, balance)
    values ($1, $2, $3, $4, $5, true, 0)
  `,
    [id, input.companyId, input.branchId, input.name ?? 'الخزينة الرئيسية', input.isDefault ?? true],
  )
  return { id }
}

export async function createCustomer(client: Client, input: { companyId: string; name?: string; balance?: number; creditLimit?: number }) {
  const id = uuid()
  await client.query(
    `
    insert into customers (id, company_id, name, balance, credit_limit, is_active)
    values ($1, $2, $3, $4, $5, true)
  `,
    [id, input.companyId, input.name ?? 'عميل', String(input.balance ?? 0), String(input.creditLimit ?? 0)],
  )
  return { id }
}

export async function createUserWithProfile(client: Client, input: { email: string; passwordHash: string; fullName: string; companyId?: string | null; branchId?: string | null; role?: string }) {
  const id = uuid()
  await client.query(`insert into users (id, email, password_hash) values ($1, $2, $3)`, [id, input.email, input.passwordHash])
  await client.query(
    `
    insert into profiles (id, full_name, role, company_id, branch_id, is_active)
    values ($1, $2, $3, $4, $5, true)
  `,
    [id, input.fullName, input.role ?? 'owner', input.companyId ?? null, input.branchId ?? null],
  )
  return { id }
}

export async function createCategory(client: Client, input: { companyId: string; name?: string }) {
  const id = uuid()
  await client.query(`insert into categories (id, company_id, name) values ($1, $2, $3)`, [id, input.companyId, input.name ?? 'تصنيف'])
  return { id }
}

export async function createUnit(client: Client, input: { companyId: string; name?: string }) {
  const id = uuid()
  await client.query(`insert into units (id, company_id, name) values ($1, $2, $3)`, [id, input.companyId, input.name ?? 'قطعة'])
  return { id }
}

export async function createProduct(client: Client, input: { companyId: string; name?: string; barcode?: string | null; sku?: string | null; categoryId?: string | null; unitId?: string | null; price1?: number; avgCost?: number }) {
  const id = uuid()
  await client.query(
    `
    insert into products (id, company_id, name, barcode, sku, category_id, unit_id, price1, avg_cost, cost_price, is_active)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9,true)
  `,
    [
      id,
      input.companyId,
      input.name ?? 'صنف',
      input.barcode ?? null,
      input.sku ?? null,
      input.categoryId ?? null,
      input.unitId ?? null,
      String(input.price1 ?? 0),
      String(input.avgCost ?? 0),
    ],
  )
  return { id }
}

export async function setStock(client: Client, input: { productId: string; warehouseId: string; qty: number; avgCost?: number }) {
  await client.query(
    `
    insert into product_stock (id, product_id, warehouse_id, qty, avg_cost)
    values ($1, $2, $3, $4, $5)
    on conflict (product_id, warehouse_id)
    do update set qty = excluded.qty, avg_cost = excluded.avg_cost
  `,
    [uuid(), input.productId, input.warehouseId, String(input.qty), String(input.avgCost ?? 0)],
  )
}

