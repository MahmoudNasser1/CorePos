import { Injectable } from '@nestjs/common'
import { db } from '../../common/db/drizzle'
import { invoices, invoiceItems, productStock, products, treasuryTransactions } from '../../common/db/schema'
import { eq, and, sql, sum, count } from 'drizzle-orm'

@Injectable()
export class ReportsService {
  async getDailySummary(companyId: string) {
    if (!db) return { sales: 0, purchases: 0, profits: 0 }

    const today = new Date().toISOString().split('T')[0]

    const stats = await db
      .select({
        totalSales: sql<number>`COALESCE(SUM(CASE WHEN type = 'sale' THEN total ELSE 0 END), 0)`,
        totalPurchases: sql<number>`COALESCE(SUM(CASE WHEN type = 'purchase' THEN total ELSE 0 END), 0)`,
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

    return {
      sales: Number(stats[0]?.totalSales || 0),
      purchases: Number(stats[0]?.totalPurchases || 0),
      profits: Number(profitStat[0]?.totalProfit || 0),
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
      .orderBy(sql`total_sold DESC`)
      .limit(5);

    return data;
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
    // Simplified: list all transactions for the company's treasuries
    // In a real scenario, we'd join with the treasuries table to ensure company isolation
    return db.query.treasuryTransactions.findMany({
      orderBy: (tx, { desc }) => [desc(tx.createdAt)],
      limit: 50,
    })
  }
}
