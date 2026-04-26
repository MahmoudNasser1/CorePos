import { Injectable } from '@nestjs/common'
import { db } from '../../common/db/drizzle'
import {
  branches,
  categories,
  invoices,
  invoiceItems,
  productStock,
  products,
  treasuries,
  treasuryTransactions,
  warehouses,
} from '../../common/db/schema'
import { eq, and, sql, sum } from 'drizzle-orm'

@Injectable()
export class ReportsService {
  private static setupStatusCache = new Map<string, { at: number; data: any }>()
  private static setupStatusCacheMax = 500

  async getSetupStatus(companyId: string) {
    if (!db) {
      return {
        hasProducts: false,
        hasWarehouses: false,
        hasTreasuries: false,
        hasAnyInvoices: false,
        counts: { products: 0, warehouses: 0, treasuries: 0, invoices: 0 },
        percent: 0,
      }
    }

    const now = Date.now()
    const cached = ReportsService.setupStatusCache.get(companyId)
    if (cached && now - cached.at < 60_000) {
      return cached.data
    }

    const [productsCountRow] = await db
      .select({ c: sql<number>`COUNT(*)::int` })
      .from(products)
      .where(eq(products.companyId, companyId))

    const [treasuriesCountRow] = await db
      .select({ c: sql<number>`COUNT(*)::int` })
      .from(treasuries)
      .where(and(eq(treasuries.companyId, companyId), eq(treasuries.isActive, true)))

    const [warehousesCountRow] = await db
      .select({ c: sql<number>`COUNT(*)::int` })
      .from(warehouses)
      .innerJoin(branches, eq(warehouses.branchId, branches.id))
      .where(and(eq(branches.companyId, companyId), eq(warehouses.isActive, true)))

    const [invoicesCountRow] = await db
      .select({
        invoices: sql<number>`COUNT(*)::int`,
        salesInvoices: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.type} = 'sale' THEN 1 ELSE 0 END), 0)::int`,
        purchaseInvoices: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.type} = 'purchase' THEN 1 ELSE 0 END), 0)::int`,
      })
      .from(invoices)
      .where(eq(invoices.companyId, companyId))

    const counts = {
      products: Number(productsCountRow?.c || 0),
      warehouses: Number(warehousesCountRow?.c || 0),
      treasuries: Number(treasuriesCountRow?.c || 0),
      invoices: Number((invoicesCountRow as any)?.invoices || 0),
      salesInvoices: Number((invoicesCountRow as any)?.salesInvoices || 0),
      purchaseInvoices: Number((invoicesCountRow as any)?.purchaseInvoices || 0),
    }

    const hasProducts = counts.products > 0
    const hasWarehouses = counts.warehouses > 0
    const hasTreasuries = counts.treasuries > 0
    const hasAnyInvoices = counts.invoices > 0

    const totalSteps = 4
    const doneSteps = [hasWarehouses, hasTreasuries, hasProducts, hasAnyInvoices].filter(Boolean).length
    const percent = Math.round((doneSteps / totalSteps) * 100)

    const data = {
      hasProducts,
      hasWarehouses,
      hasTreasuries,
      hasAnyInvoices,
      counts,
      percent,
    }

    ReportsService.setupStatusCache.set(companyId, { at: now, data })
    if (ReportsService.setupStatusCache.size > ReportsService.setupStatusCacheMax) {
      // best-effort eviction: drop oldest entries
      const entries = Array.from(ReportsService.setupStatusCache.entries()).sort((a, b) => a[1].at - b[1].at)
      for (const [key] of entries.slice(0, Math.ceil(ReportsService.setupStatusCacheMax * 0.2))) {
        ReportsService.setupStatusCache.delete(key)
      }
    }

    return data
  }

  async getDailySummary(companyId: string) {
    if (!db) {
      return {
        sales: 0,
        purchases: 0,
        profits: 0,
        salesCount: 0,
        treasuryBalance: 0,
        lowStockCount: 0,
      }
    }

    const today = new Date().toISOString().split('T')[0]

    const stats = await db
      .select({
        totalSales: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.type} = 'sale' THEN ${invoices.total} ELSE 0 END), 0)`,
        totalPurchases: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.type} = 'purchase' THEN ${invoices.total} ELSE 0 END), 0)`,
        salesCount: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.type} = 'sale' THEN 1 ELSE 0 END), 0)::int`,
      })
      .from(invoices)
      .where(and(eq(invoices.companyId, companyId), eq(invoices.date, today)))

    const profitStat = await db
      .select({
        totalProfit: sum(invoiceItems.profit),
      })
      .from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .where(and(eq(invoices.companyId, companyId), eq(invoices.date, today), eq(invoices.type, 'sale')))

    const treasuryRow = await db
      .select({
        total: sql<number>`COALESCE(SUM(${treasuries.balance}), 0)`,
      })
      .from(treasuries)
      .where(eq(treasuries.companyId, companyId))

    const lowStockRows = await db.execute<{ c: string }>(sql`
      select count(distinct p.id)::text as c
      from products p
      where p.company_id = ${companyId}
        and coalesce(p.min_qty, 0) > 0
        and (
          select coalesce(sum(ps.qty), 0)
          from product_stock ps
          where ps.product_id = p.id
        ) < p.min_qty
    `)

    return {
      sales: Number(stats[0]?.totalSales || 0),
      purchases: Number(stats[0]?.totalPurchases || 0),
      profits: Number(profitStat[0]?.totalProfit || 0),
      salesCount: Number(stats[0]?.salesCount || 0),
      treasuryBalance: Number(treasuryRow[0]?.total || 0),
      lowStockCount: Number((lowStockRows.rows[0] as { c?: string })?.c || 0),
    }
  }

  async getSalesDashboard(companyId: string) {
    if (!db) return []
    const results = await db.query.invoices.findMany({
      where: and(eq(invoices.companyId, companyId), eq(invoices.type, 'sale')),
      orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
      limit: 5,
    })
    return results.map(inv => ({
      ...inv,
      invoice_number: inv.invoiceNumber,
      total: Number(inv.total || 0),
    }))
  }

  async getSalesTrend(companyId: string) {
    if (!db) return []
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    const data = await db
      .select({
        date: invoices.date,
        total_sales: sql<number>`CAST(SUM(${invoices.total}) AS DOUBLE PRECISION)`,
      })
      .from(invoices)
      .where(and(
        eq(invoices.companyId, companyId),
        eq(invoices.type, 'sale'),
        sql`${invoices.date} >= ${dateStr}`
      ))
      .groupBy(invoices.date)
      .orderBy(invoices.date);

    return data;
  }

  async getTopProducts(companyId: string) {
    if (!db) return []
    const data = await db
      .select({
        name: products.name,
        total_sold: sql<number>`CAST(SUM(${invoiceItems.qty}) AS DOUBLE PRECISION)`,
        revenue: sql<number>`CAST(SUM(${invoiceItems.totalLine}) AS DOUBLE PRECISION)`,
      })
      .from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .innerJoin(products, eq(invoiceItems.productId, products.id))
      .where(and(
        eq(invoices.companyId, companyId),
        eq(invoices.type, 'sale')
      ))
      .groupBy(products.name)
      .orderBy(sql`CAST(SUM(${invoiceItems.qty}) AS DOUBLE PRECISION) DESC`)
      .limit(5);

    return data;
  }

  async getSalesByCategory(companyId: string, params?: { from?: string; to?: string }) {
    if (!db) return []
    const from = (params?.from ?? '').trim()
    const to = (params?.to ?? '').trim()

    const where = [
      eq(invoices.companyId, companyId),
      eq(invoices.type, 'sale'),
      ...(from ? [sql`${invoices.date} >= ${from}`] : []),
      ...(to ? [sql`${invoices.date} <= ${to}`] : []),
    ]

    const rows = await db
      .select({
        category_name: sql<string>`COALESCE(${categories.name}, 'بدون فئة')`,
        items_sold: sql<number>`CAST(SUM(${invoiceItems.qty}) AS DOUBLE PRECISION)`,
        total_sales: sql<number>`CAST(SUM(${invoiceItems.totalLine}) AS DOUBLE PRECISION)`,
      })
      .from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .innerJoin(products, eq(invoiceItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...where))
      .groupBy(sql`COALESCE(${categories.name}, 'بدون فئة')`)
      .orderBy(sql`CAST(SUM(${invoiceItems.totalLine}) AS DOUBLE PRECISION) DESC`)

    const total = rows.reduce((acc, r: any) => acc + Number(r.total_sales ?? 0), 0)
    return rows.map((r: any) => ({
      ...r,
      items_sold: Number(r.items_sold ?? 0),
      total_sales: Number(r.total_sales ?? 0),
      sales_percentage: total > 0 ? (Number(r.total_sales ?? 0) / total) * 100 : 0,
    }))
  }

  async getStockReport(companyId: string) {
    if (!db) return []
    // Join products with their stock across all warehouses
    const stock = await db
      .select({
        id: products.id,
        name: products.name,
        barcode: products.barcode,
        qty: sum(productStock.qty),
        avgCost: products.avgCost,
        totalValue: sql<number>`SUM(product_stock.qty * products.avg_cost)`,
      })
      .from(products)
      .leftJoin(productStock, eq(productStock.productId, products.id))
      .where(eq(products.companyId, companyId))
      .groupBy(products.id)

    return stock.map(s => ({
      ...s,
      qty: Number(s.qty || 0),
      avgCost: Number(s.avgCost || 0),
      totalValue: Number(s.totalValue || 0),
    }))
  }

  async getTreasuryReport(companyId: string) {
    if (!db) return []
    return db.query.treasuryTransactions.findMany({
      where: eq(treasuryTransactions.companyId, companyId),
      orderBy: (tx, { desc }) => [desc(tx.createdAt)],
      limit: 50,
    })
  }
}
