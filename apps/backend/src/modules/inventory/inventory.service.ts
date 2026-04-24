import { Injectable, BadRequestException } from '@nestjs/common'
import { db } from '../../common/db/drizzle'
import { products, categories, productStock, units, warehouses, invoiceItems, invoices } from '../../common/db/schema'
import { eq, and, desc } from 'drizzle-orm'
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
      where: and(eq(products.companyId, companyId), eq(products.isActive, true)),
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
      where: and(eq(products.companyId, companyId), eq(products.id, id), eq(products.isActive, true)),
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

  async getProductInsights(companyId: string, productId: string) {
    if (!db) {
      return {
        product: null,
        stockDistribution: [],
        recentSales: [],
        stats: { totalSold: 0, totalRevenue: 0, totalProfit: 0 },
        dailyData: [],
      }
    }

    const product = await db.query.products.findFirst({
      where: and(
        eq(products.companyId, companyId),
        eq(products.id, productId),
        eq(products.isActive, true),
      ),
      with: {
        category: true,
        unit: true,
      },
    })

    if (!product) {
      return {
        product: null,
        stockDistribution: [],
        recentSales: [],
        stats: { totalSold: 0, totalRevenue: 0, totalProfit: 0 },
        dailyData: [],
      }
    }

    const stockDistribution = await db
      .select({
        qty: productStock.qty,
        warehouse: { name: warehouses.name },
      })
      .from(productStock)
      .innerJoin(warehouses, eq(productStock.warehouseId, warehouses.id))
      .where(eq(productStock.productId, productId))

    const recentSales = await db
      .select({
        qty: invoiceItems.qty,
        invoice: {
          type: invoices.type,
          invoice_number: invoices.invoiceNumber,
          created_at: invoices.createdAt,
          customer_name: invoices.customerId, // placeholder (name join later)
        },
      })
      .from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .where(and(eq(invoices.companyId, companyId), eq(invoiceItems.productId, productId)))
      .orderBy(desc(invoices.createdAt))
      .limit(20)

    // Stats + daily series (MVP: compute from last 30 days rows in JS)
    const now = new Date()
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const statRows = recentSales.filter((r: any) => {
      const d = r?.invoice?.created_at ? new Date(r.invoice.created_at) : null
      return d ? d >= cutoff : true
    })

    const totalSold = statRows.reduce((acc: number, r: any) => acc + Number(r.qty ?? 0), 0)
    const totalRevenue = statRows.reduce((acc: number, r: any) => {
      // use invoiceItems.totalLine if available via join later; approximate with qty*unitPrice not selected here
      return acc
    }, 0)

    // For now, compute revenue/profit from invoiceItems table directly (no date filter for simplicity).
    const moneyRows = await db
      .select({
        qty: invoiceItems.qty,
        unitPrice: invoiceItems.unitPrice,
        profit: invoiceItems.profit,
        createdAt: invoices.createdAt,
      })
      .from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .where(and(eq(invoices.companyId, companyId), eq(invoiceItems.productId, productId)))
      .orderBy(desc(invoices.createdAt))
      .limit(500)

    const totalRevenue2 = moneyRows.reduce((acc: number, r: any) => acc + (Number(r.qty ?? 0) * Number(r.unitPrice ?? 0)), 0)
    const totalProfit = moneyRows.reduce((acc: number, r: any) => acc + Number(r.profit ?? 0), 0)

    const dailyMap = new Map<string, number>()
    for (const r of moneyRows) {
      const d = r.createdAt ? new Date(r.createdAt) : null
      if (!d) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const rev = Number(r.qty ?? 0) * Number(r.unitPrice ?? 0)
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + rev)
    }
    const dailyData = Array.from(dailyMap.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .slice(-30)
      .map(([date, revenue]) => ({ date, revenue }))

    return {
      product: {
        name: product.name,
        barcode: product.barcode,
        sales_price: Number(product.price1 ?? 0),
        cost_price: Number(product.costPrice ?? 0),
        min_qty: Number(product.minQty ?? 0),
        categories: product.category ? { name: product.category.name } : null,
        units: product.unit ? { name: product.unit.name } : null,
      },
      stockDistribution: stockDistribution.map((s: any) => ({
        qty: Number(s.qty ?? 0),
        warehouses: { name: s.warehouse?.name ?? null },
      })),
      recentSales: recentSales.map((r: any) => ({
        qty: Number(r.qty ?? 0),
        invoices: r.invoice,
      })),
      stats: {
        totalSold,
        totalRevenue: totalRevenue2,
        totalProfit,
      },
      dailyData,
    }
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
      .where(and(eq(products.companyId, companyId), eq(products.isActive, true)))

    return (rows as any[]).filter((r) => Number(r.currentStock ?? 0) <= Number(r.minQty ?? 0))
  }

  async search(companyId: string, q: string) {
    const res = await this.listProducts(companyId, { q, limit: 20 })
    return res.items
  }

  async listUnits(companyId: string) {
    if (!db) return []
    return db.query.units.findMany({ where: eq(units.companyId, companyId) })
  }

  async createUnit(companyId: string, input: { name: string; nameEn?: string }) {
    if (!db) throw new BadRequestException('Database not connected')
    const [unit] = await db
      .insert(units)
      .values({ companyId, name: input.name, nameEn: input.nameEn })
      .returning()
    return unit
  }

  async updateUnit(companyId: string, id: string, patch: Record<string, unknown>) {
    if (!db) return { id }
    const [updated] = await db
      .update(units)
      .set(patch as any)
      .where(and(eq(units.companyId, companyId), eq(units.id, id)))
      .returning()
    return updated ?? null
  }

  async deleteUnit(companyId: string, id: string) {
    if (!db) return { id }
    // Soft-delete not modeled for units; hard delete is acceptable for now.
    const [deleted] = await db
      .delete(units)
      .where(and(eq(units.companyId, companyId), eq(units.id, id)))
      .returning()
    return deleted ?? null
  }
}
