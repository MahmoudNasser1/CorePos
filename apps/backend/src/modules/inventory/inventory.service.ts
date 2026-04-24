import { Injectable, BadRequestException } from '@nestjs/common'
import { db } from '../../common/db/drizzle'
import { products, categories, productStock } from '../../common/db/schema'
import { eq, and } from 'drizzle-orm'
import { CreateProductDto } from './dto/inventory.dto'

type ListQuery = {
  q?: string
  limit?: number
  cursor?: string
  sort?: string
  order?: string
}

type Paginated<T> = { items: T[]; nextCursor: string | null; total?: number }

@Injectable()
export class InventoryService {
  async listProducts(companyId: string, query: ListQuery = {}): Promise<Paginated<any>> {
    const limit = Math.min(Math.max(query.limit ?? 25, 1), 100)
    if (!db) return { items: [], nextCursor: null }

    // MVP cursor: accept but ignore; we keep nextCursor null for now.
    // MVP search: apply basic contains on name/barcode/sku.
    const q = (query.q ?? '').trim()
    const items = await db.query.products.findMany({
      where: eq(products.companyId, companyId),
      with: { category: true },
      limit: q.length > 0 ? Math.max(limit, 100) : limit,
    })

    // If q filtering is not supported in the ORM expression above, do a safe in-memory filter.
    const filtered =
      q.length === 0
        ? items
        : items.filter((p: any) => {
            const hay = `${p?.name ?? ''} ${p?.barcode ?? ''} ${p?.sku ?? ''}`.toLowerCase()
            return hay.includes(q.toLowerCase())
          })

    return { items: filtered.slice(0, limit), nextCursor: null }
  }

  async createProduct(companyId: string, input: CreateProductDto) {
    if (!db) throw new BadRequestException('Database not connected')
    
    try {
      return await db.transaction(async (tx) => {
        const { warehouseId, initialQty, ...productData } = input
        
        // Sanitize productData to only include keys that exist in the schema
        const sanitizedData: any = {
          name: productData.name || `Product_${Math.floor(Math.random() * 1000)}`,
          nameEn: productData.nameEn,
          barcode: productData.barcode,
          sku: productData.sku,
          price1: productData.price1 || '0',
          costPrice: productData.costPrice || '0',
          companyId,
        }

        // Only add UUID fields if they look like valid UUIDs
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (productData.categoryId && uuidRegex.test(productData.categoryId)) {
          sanitizedData.categoryId = productData.categoryId
        }
        if (productData.unitId && uuidRegex.test(productData.unitId)) {
          sanitizedData.unitId = productData.unitId
        }

        const [newProduct] = await tx
          .insert(products)
          .values(sanitizedData)
          .returning()

        // Initialize stock in default warehouse if provided and valid
        if (warehouseId && uuidRegex.test(warehouseId)) {
          await tx.insert(productStock).values({
            productId: newProduct.id,
            warehouseId: warehouseId,
            qty: initialQty || '0',
            avgCost: input.costPrice || '0',
          })
        }

        return newProduct
      })
    } catch (error) {
      console.error('Error creating product:', error)
      throw new BadRequestException(`Failed to create product: ${(error as any).message}`)
    }
  }

  async getProduct(companyId: string, id: string) {
    if (!db) return null
    return db.query.products.findFirst({
      where: and(eq(products.companyId, companyId), eq(products.id, id)),
      with: { category: true },
    })
  }

  async updateProduct(companyId: string, id: string, patch: Record<string, unknown>) {
    if (!db) return { id }
    const [updated] = await db
      .update(products)
      .set(patch as any)
      .where(and(eq(products.companyId, companyId), eq(products.id, id)))
      .returning()
    return updated ?? null
  }

  async deleteProduct(companyId: string, id: string) {
    if (!db) return { id }
    const [updated] = await db
      .update(products)
      .set({ isActive: false } as any)
      .where(and(eq(products.companyId, companyId), eq(products.id, id)))
      .returning()
    return updated ?? null
  }

  async updateStock(productId: string, warehouseId: string, qtyDelta: number, unitPrice?: number) {
    if (!db) return

    await db.transaction(async (tx) => {
      const existing = await tx.query.productStock.findFirst({
        where: and(
          eq(productStock.productId, productId),
          eq(productStock.warehouseId, warehouseId),
        ),
      })

      if (!existing) {
        await tx.insert(productStock).values({
          productId,
          warehouseId,
          qty: qtyDelta.toString(),
          avgCost: (unitPrice || 0).toString(),
        })
      } else {
        const currentQty = Number(existing.qty)
        const currentAvg = Number(existing.avgCost)
        const newQty = currentQty + qtyDelta

        let newAvg = currentAvg
        if (qtyDelta > 0 && unitPrice !== undefined) {
          // Weighted Average Cost calculation on purchase/inward
          newAvg = ((currentQty * currentAvg) + (qtyDelta * unitPrice)) / newQty
        }

        await tx
          .update(productStock)
          .set({
            qty: newQty.toString(),
            avgCost: newAvg.toString(),
          })
          .where(
            and(
              eq(productStock.productId, productId),
              eq(productStock.warehouseId, warehouseId),
            ),
          )

        // Sync global product avgCost
        await tx.update(products).set({ avgCost: newAvg.toString() }).where(eq(products.id, productId))
      }
    })
  }

  async listCategories(companyId: string) {
    if (!db) return []
    return db.query.categories.findMany({
      where: eq(categories.companyId, companyId),
    })
  }

  async createCategory(companyId: string, name: string, parentId?: string) {
    if (!db) throw new BadRequestException('Database not connected')
    const [category] = await db
      .insert(categories)
      .values({ companyId, name, parentId })
      .returning()
    return category
  }

  async updateCategory(companyId: string, id: string, patch: Record<string, unknown>) {
    if (!db) return { id }
    const [updated] = await db
      .update(categories)
      .set(patch as any)
      .where(and(eq(categories.companyId, companyId), eq(categories.id, id)))
      .returning()
    return updated ?? null
  }

  async getLowStockAlerts(companyId: string) {
    if (!db) return []
    // Join products with productStock and filter where qty <= minQty.
    // Drizzle's column-to-column comparisons can be awkward with numeric-as-text;
    // we fetch rows then apply a safe numeric filter in JS.
    const rows = await db
      .select({
        productId: products.id,
        name: products.name,
        sku: products.sku,
        minQty: products.minQty,
        currentStock: productStock.qty,
        warehouseId: productStock.warehouseId,
      })
      .from(products)
      .innerJoin(productStock, eq(products.id, productStock.productId))
      .where(eq(products.companyId, companyId))

    return (rows as any[]).filter((r) => Number(r.currentStock ?? 0) <= Number(r.minQty ?? 0))
  }

  async search(companyId: string, q: string) {
    const res = await this.listProducts(companyId, { q, limit: 20 })
    return res.items
  }
}
