import { Injectable, BadRequestException } from '@nestjs/common'
import { db } from '../../common/db/drizzle'
import { customers, suppliers } from '../../common/db/schema'
import { and, eq } from 'drizzle-orm'
import { CreateCustomerDto, CreateSupplierDto } from './dto/contacts.dto'

type ListQuery = { q?: string; limit?: number }
type Paginated<T> = { items: T[]; nextCursor: string | null; total?: number }

@Injectable()
export class ContactsService {
  async listCustomers(companyId: string, query: ListQuery = {}): Promise<Paginated<any>> {
    const limit = Math.min(Math.max(query.limit ?? 25, 1), 100)
    if (!db) return { items: [], nextCursor: null }
    const items = await db.query.customers.findMany({
      where: and(eq(customers.companyId, companyId), eq(customers.isActive, true)),
      limit,
    })
    const q = (query.q ?? '').trim().toLowerCase()
    const filtered =
      q.length === 0
        ? items
        : items.filter((c: any) => `${c?.name ?? ''} ${c?.phone ?? ''}`.toLowerCase().includes(q))
    return { items: filtered.slice(0, limit), nextCursor: null }
  }

  async createCustomer(companyId: string, input: CreateCustomerDto) {
    if (!db) throw new BadRequestException('Database not connected')
    try {
      // Filter out any unexpected fields from input to prevent Drizzle errors
      const sanitizedData: any = {
        name: input.name || `Customer_${Math.floor(Math.random() * 1000)}`,
        phone: input.phone,
        address: input.address,
        email: input.email,
        taxNumber: input.taxNumber,
        creditLimit: input.creditLimit || '0',
        companyId,
      }

      const [customer] = await db
        .insert(customers)
        .values(sanitizedData)
        .returning()
      return customer
    } catch (error) {
      console.error('Error creating customer:', error)
      throw new BadRequestException(`Failed to create customer: ${(error as any).message}`)
    }
  }

  async getCustomer(companyId: string, id: string) {
    if (!db) return null
    return db.query.customers.findFirst({
      where: and(eq(customers.companyId, companyId), eq(customers.id, id)),
    })
  }

  async updateCustomer(companyId: string, id: string, patch: Record<string, unknown>) {
    if (!db) return { id }
    const [updated] = await db
      .update(customers)
      .set(patch as any)
      .where(and(eq(customers.companyId, companyId), eq(customers.id, id)))
      .returning()
    return updated ?? null
  }

  async listSuppliers(companyId: string, query: ListQuery = {}): Promise<Paginated<any>> {
    const limit = Math.min(Math.max(query.limit ?? 25, 1), 100)
    if (!db) return { items: [], nextCursor: null }
    const items = await db.query.suppliers.findMany({
      where: and(eq(suppliers.companyId, companyId), eq(suppliers.isActive, true)),
      limit,
    })
    const q = (query.q ?? '').trim().toLowerCase()
    const filtered =
      q.length === 0
        ? items
        : items.filter((s: any) => `${s?.name ?? ''} ${s?.phone ?? ''}`.toLowerCase().includes(q))
    return { items: filtered.slice(0, limit), nextCursor: null }
  }

  async createSupplier(companyId: string, input: CreateSupplierDto) {
    if (!db) throw new BadRequestException('Database not connected')
    try {
      const sanitizedData: any = {
        name: input.name || `Supplier_${Math.floor(Math.random() * 1000)}`,
        phone: input.phone,
        address: input.address,
        email: input.email,
        taxNumber: input.taxNumber,
        companyId,
      }

      const [supplier] = await db
        .insert(suppliers)
        .values(sanitizedData)
        .returning()
      return supplier
    } catch (error) {
      console.error('Error creating supplier:', error)
      throw new BadRequestException(`Failed to create supplier: ${(error as any).message}`)
    }
  }

  async getSupplier(companyId: string, id: string) {
    if (!db) return null
    return db.query.suppliers.findFirst({
      where: and(eq(suppliers.companyId, companyId), eq(suppliers.id, id)),
    })
  }

  async updateSupplier(companyId: string, id: string, patch: Record<string, unknown>) {
    if (!db) return { id }
    const [updated] = await db
      .update(suppliers)
      .set(patch as any)
      .where(and(eq(suppliers.companyId, companyId), eq(suppliers.id, id)))
      .returning()
    return updated ?? null
  }
}
