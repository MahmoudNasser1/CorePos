import { Injectable } from '@nestjs/common'
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
}

