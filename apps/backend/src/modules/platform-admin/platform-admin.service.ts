import { Injectable, NotFoundException } from '@nestjs/common'
import { db } from '../../common/db/drizzle'
import { companies, profiles, subscriptions, users } from '../../common/db/schema'
import { sql } from 'drizzle-orm'

@Injectable()
export class PlatformAdminService {
  async getOverview() {
    if (!db) {
      return {
        companies: { total: 0 },
        users: { total: 0, active: 0, disabled: 0 },
        subscriptions: { total: 0, active: 0, trialing: 0, expired: 0, cancelled: 0, pastDue: 0 },
      }
    }

    const [companiesRow] = await db.select({ c: sql<number>`COUNT(*)::int` }).from(companies)
    const [usersRow] = await db.select({ c: sql<number>`COUNT(*)::int` }).from(users)

    const [profilesRow] = await db
      .select({
        active: sql<number>`COALESCE(SUM(CASE WHEN ${profiles.isActive} = true THEN 1 ELSE 0 END), 0)::int`,
        disabled: sql<number>`COALESCE(SUM(CASE WHEN ${profiles.isActive} = false THEN 1 ELSE 0 END), 0)::int`,
      })
      .from(profiles)

    let subStats = { total: 0, active: 0, trialing: 0, expired: 0, cancelled: 0, pastDue: 0 }
    try {
      const [subRow] = await db
        .select({
          total: sql<number>`COUNT(*)::int`,
          active: sql<number>`COALESCE(SUM(CASE WHEN ${subscriptions.status} = 'active' THEN 1 ELSE 0 END), 0)::int`,
          trialing: sql<number>`COALESCE(SUM(CASE WHEN ${subscriptions.status} = 'trialing' THEN 1 ELSE 0 END), 0)::int`,
          expired: sql<number>`COALESCE(SUM(CASE WHEN ${subscriptions.status} = 'expired' THEN 1 ELSE 0 END), 0)::int`,
          cancelled: sql<number>`COALESCE(SUM(CASE WHEN ${subscriptions.status} = 'cancelled' THEN 1 ELSE 0 END), 0)::int`,
          pastDue: sql<number>`COALESCE(SUM(CASE WHEN ${subscriptions.status} = 'past_due' THEN 1 ELSE 0 END), 0)::int`,
        })
        .from(subscriptions)

      subStats = {
        total: Number(subRow?.total ?? 0),
        active: Number(subRow?.active ?? 0),
        trialing: Number(subRow?.trialing ?? 0),
        expired: Number(subRow?.expired ?? 0),
        cancelled: Number(subRow?.cancelled ?? 0),
        pastDue: Number(subRow?.pastDue ?? 0),
      }
    } catch {
      // subscriptions table may not be migrated in some deployments
      subStats = { total: 0, active: 0, trialing: 0, expired: 0, cancelled: 0, pastDue: 0 }
    }

    return {
      companies: { total: Number(companiesRow?.c ?? 0) },
      users: {
        total: Number(usersRow?.c ?? 0),
        active: Number(profilesRow?.active ?? 0),
        disabled: Number(profilesRow?.disabled ?? 0),
      },
      subscriptions: subStats,
    }
  }

  async listCompanies(params: { search?: string; status?: string; plan?: string }) {
    if (!db) return []

    const search = (params.search ?? '').trim()
    const status = (params.status ?? '').trim()
    const plan = (params.plan ?? '').trim()
    const searchLike = `%${search}%`

    // Prefer returning subscription info when the table exists.
    try {
      const rows = await db.execute<{
        id: string
        name: string
        phone: string | null
        email: string | null
        country_code: string | null
        timezone: string | null
        created_at: string | null
        plan_id: string | null
        sub_status: string | null
        current_period_end: string | null
      }>(sql`
        select
          c.id,
          c.name,
          c.phone,
          c.email,
          c.country_code,
          c.timezone,
          c.created_at,
          s.plan_id,
          s.status as sub_status,
          s.current_period_end
        from companies c
        left join subscriptions s on s.company_id = c.id
        where
          (${search} = '' or c.name ilike ${searchLike} or coalesce(c.email, '') ilike ${searchLike} or coalesce(c.phone, '') ilike ${searchLike})
          and (${status} = '' or coalesce(s.status, '') = ${status})
          and (${plan} = '' or coalesce(s.plan_id, '') = ${plan})
        order by c.created_at desc nulls last
        limit 500
      `)

      return rows.rows.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        countryCode: r.country_code,
        timezone: r.timezone,
        createdAt: r.created_at,
        subscription: r.plan_id || r.sub_status
          ? { planId: r.plan_id, status: r.sub_status, currentPeriodEnd: r.current_period_end }
          : null,
      }))
    } catch {
      // subscriptions table may not be migrated
      const rows = await db.execute<{
        id: string
        name: string
        phone: string | null
        email: string | null
        country_code: string | null
        timezone: string | null
        created_at: string | null
      }>(sql`
        select c.id, c.name, c.phone, c.email, c.country_code, c.timezone, c.created_at
        from companies c
        where
          (${search} = '' or c.name ilike ${searchLike} or coalesce(c.email, '') ilike ${searchLike} or coalesce(c.phone, '') ilike ${searchLike})
        order by c.created_at desc nulls last
        limit 500
      `)

      return rows.rows.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        countryCode: r.country_code,
        timezone: r.timezone,
        createdAt: r.created_at,
        subscription: null,
      }))
    }
  }

  async getCompany(companyId: string) {
    if (!db) {
      throw new NotFoundException({
        code: 'DB_UNAVAILABLE',
        message: 'Database not connected',
      })
    }

    const [company] = await db
      .select({
        id: companies.id,
        name: companies.name,
        phone: companies.phone,
        email: companies.email,
        address: companies.address,
        taxNumber: companies.taxNumber,
        currency: companies.currency,
        timezone: companies.timezone,
        countryCode: companies.countryCode,
        createdAt: companies.createdAt,
      })
      .from(companies)
      .where(sql`${companies.id} = ${companyId}`)

    if (!company) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Company not found',
      })
    }

    let subscription: { id: string; status: string; planId: string; currentPeriodEnd: string | null } | null = null
    try {
      const [sub] = await db
        .select({
          id: subscriptions.id,
          status: subscriptions.status,
          planId: subscriptions.planId,
          currentPeriodEnd: subscriptions.currentPeriodEnd,
        })
        .from(subscriptions)
        .where(sql`${subscriptions.companyId} = ${companyId}`)
        .limit(1)
      subscription = sub
        ? {
            id: sub.id,
            status: String(sub.status),
            planId: String(sub.planId),
            currentPeriodEnd: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null,
          }
        : null
    } catch {
      subscription = null
    }

    const [usersStats] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        active: sql<number>`COALESCE(SUM(CASE WHEN ${profiles.isActive} = true THEN 1 ELSE 0 END), 0)::int`,
        disabled: sql<number>`COALESCE(SUM(CASE WHEN ${profiles.isActive} = false THEN 1 ELSE 0 END), 0)::int`,
      })
      .from(profiles)
      .where(sql`${profiles.companyId} = ${companyId}`)

    return {
      ...company,
      subscription,
      users: {
        total: Number(usersStats?.total ?? 0),
        active: Number(usersStats?.active ?? 0),
        disabled: Number(usersStats?.disabled ?? 0),
      },
    }
  }
}

