import { Injectable, Logger } from '@nestjs/common'
import { db } from '../../common/db/drizzle'
import { subscriptions, profiles, branches, warehouses, products, invoices, paymentInvoices } from '../../common/db/schema'
import { eq, sql, and, gte } from 'drizzle-orm'
import { PLAN_LIMITS, PlanKey, PlanLimit } from './constants/plan-limits'

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name)

  async getSubscription(companyId: string) {
    if (!db) return null
    return db.query.subscriptions.findFirst({
      where: eq(subscriptions.companyId, companyId),
    })
  }

  async getUsage(companyId: string) {
    if (!db) throw new Error('Database not connected')

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.companyId, companyId))
      .limit(1)

    const planKey = (sub?.planId as PlanKey) || 'free'
    const limits = PLAN_LIMITS[planKey]

    // 1. Current Users Count
    const [{ count: userCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(eq(profiles.companyId, companyId))

    // 2. Current Branches Count
    const [{ count: branchCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(branches)
      .where(eq(branches.companyId, companyId))

    // 3. Current Warehouses Count
    const [{ count: warehouseCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(warehouses)
      .innerJoin(branches, eq(warehouses.branchId, branches.id))
      .where(eq(branches.companyId, companyId))

    // 4. Current Products Count
    const [{ count: productCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.companyId, companyId))

    // 5. Monthly Invoices Count
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [{ count: monthlyInvoices }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(
        and(
          eq(invoices.companyId, companyId),
          gte(invoices.createdAt, startOfMonth)
        )
      )

    return {
      plan: planKey,
      status: sub?.status || 'active',
      limits,
      usage: {
        users: Number(userCount),
        branches: Number(branchCount),
        warehouses: Number(warehouseCount),
        products: Number(productCount),
        monthlyInvoices: Number(monthlyInvoices),
      },
    }
  }

  async checkLimit(companyId: string, resource: keyof PlanLimit) {
    const { usage, limits } = await this.getUsage(companyId)
    
    const mapping: Record<keyof PlanLimit, keyof typeof usage> = {
      maxUsers: 'users',
      maxBranches: 'branches',
      maxWarehouses: 'warehouses',
      maxProducts: 'products',
      maxInvoicesPerMonth: 'monthlyInvoices',
    }

    const usageKey = mapping[resource]
    const current = usage[usageKey]
    const max = limits[resource]
    
    return {
      allowed: current < max,
      current,
      max,
    }
  }

  async createCheckout(companyId: string, planId: string, cycle: 'monthly' | 'yearly') {
    // 1. Calculate amount based on plan
    const prices: Record<string, number> = {
      starter: cycle === 'monthly' ? 500 : 5000,
      pro: cycle === 'monthly' ? 1000 : 10000,
    }
    const amount = prices[planId] || 0
    if (amount === 0) throw new Error('Invalid plan selection')
    if (!db) throw new Error('Database not connected')
    // 2. Create payment invoice record
    const [invoice] = await db.insert(paymentInvoices).values({
      companyId,
      amount: amount.toString(),
      currency: 'EGP',
      status: 'pending',
    }).returning()

    this.logger.log(`Created checkout invoice ${invoice.id} for company ${companyId}`)

    // 3. Return Paymob-ready URL (Template)
    // Integration: Call Paymob API here in production
    return {
      checkoutUrl: `https://accept.paymob.com/api/acceptance/iframes/12345?payment_token=PAY_${invoice.id}`,
      invoiceId: invoice.id,
    }
  }

  async handleWebhook(payload: any) {
    if (!db) throw new Error('Database not connected')
    const { success, id: gatewayRef, order: { merchant_order_id: invoiceId } } = payload
    
    if (!success) {
      await db.update(paymentInvoices)
        .set({ status: 'failed', gatewayRef, gatewayResponse: JSON.stringify(payload) })
        .where(eq(paymentInvoices.id, invoiceId))
      return
    }

    // 1. Update Invoice
    const [invoice] = await db.update(paymentInvoices)
      .set({ 
        status: 'paid', 
        gatewayRef, 
        gatewayResponse: JSON.stringify(payload),
        paidAt: new Date()
      })
      .where(eq(paymentInvoices.id, invoiceId))
      .returning()

    if (!invoice) return

    // 2. Upgrade Subscription
    // Logic: Find plan by amount or metadata (here we simplify)
    const planId = Number(invoice.amount) >= 1000 ? 'pro' : 'starter'
    const nextPeriod = new Date()
    nextPeriod.setMonth(nextPeriod.getMonth() + 1) // Default to 1 month

    await db.insert(subscriptions)
      .values({
        companyId: invoice.companyId,
        planId,
        status: 'active',
        currentPeriodEnd: nextPeriod,
      })
      .onConflictDoUpdate({
        target: [subscriptions.companyId],
        set: {
          planId,
          status: 'active',
          currentPeriodEnd: nextPeriod,
          updatedAt: new Date(),
        }
      })

    this.logger.log(`Successfully processed payment for invoice ${invoiceId}. Company ${invoice.companyId} upgraded to ${planId}`)
  }
}

