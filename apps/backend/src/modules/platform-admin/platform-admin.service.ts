import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { db } from '../../common/db/drizzle'
import {
  companies,
  orgUnits,
  platformAuditLogs,
  profiles,
  rolePermissions,
  roles,
  subscriptions,
  userPermissionOverrides,
  users,
} from '../../common/db/schema'
import { sql } from 'drizzle-orm'
import * as bcrypt from 'bcryptjs'

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

  async updateCompanySubscription(
    companyId: string,
    patch: { status?: string; planId?: string; extendDays?: number },
  ) {
    if (!db) {
      throw new BadRequestException({
        code: 'DB_UNAVAILABLE',
        message: 'Database not connected',
      })
    }

    const status = patch.status ? String(patch.status).trim() : undefined
    const planId = patch.planId ? String(patch.planId).trim() : undefined
    const extendDays = typeof patch.extendDays === 'number' ? patch.extendDays : undefined

    if (!status && !planId && !extendDays) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'No subscription changes provided',
      })
    }

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

      if (!sub?.id) {
        throw new BadRequestException({
          code: 'NOT_FOUND',
          message: 'Subscription not found',
        })
      }

      const currentEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null
      const nextEnd =
        extendDays && extendDays > 0
          ? new Date((currentEnd ?? new Date()).getTime() + extendDays * 24 * 60 * 60 * 1000)
          : undefined

      const [updated] = await db
        .update(subscriptions)
        .set({
          ...(status ? { status } : {}),
          ...(planId ? { planId } : {}),
          ...(nextEnd ? { currentPeriodEnd: nextEnd } : {}),
          updatedAt: new Date(),
        })
        .where(sql`${subscriptions.id} = ${sub.id}`)
        .returning({
          id: subscriptions.id,
          status: subscriptions.status,
          planId: subscriptions.planId,
          currentPeriodEnd: subscriptions.currentPeriodEnd,
          updatedAt: subscriptions.updatedAt,
        })

      return updated ?? null
    } catch (e) {
      if (e instanceof BadRequestException) throw e
      // subscriptions table may not be migrated
      throw new BadRequestException({
        code: 'SAAS_NOT_READY',
        message: 'Subscriptions are not available on this deployment',
      })
    }
  }

  async listAuditLogs(params: { action?: string; companyId?: string; from?: string; to?: string }) {
    if (!db) return []

    const action = (params.action ?? '').trim()
    const companyId = (params.companyId ?? '').trim()
    const from = (params.from ?? '').trim()
    const to = (params.to ?? '').trim()

    const rows = await db.execute<{
      id: string
      actor_user_id: string
      company_id: string | null
      action: string
      target_type: string
      target_id: string | null
      reason: string | null
      ip: string | null
      request_id: string | null
      created_at: string
    }>(sql`
      select
        l.id,
        l.actor_user_id,
        l.company_id,
        l.action,
        l.target_type,
        l.target_id,
        l.reason,
        l.ip,
        l.request_id,
        l.created_at
      from platform_audit_logs l
      where
        (${action} = '' or l.action = ${action})
        and (${companyId} = '' or coalesce(l.company_id::text, '') = ${companyId})
        and (${from} = '' or l.created_at >= ${from}::timestamp)
        and (${to} = '' or l.created_at <= ${to}::timestamp)
      order by l.created_at desc
      limit 500
    `)

    return rows.rows
  }

  async listUsers(params: { search?: string; companyId?: string; role?: string; status?: string }) {
    if (!db) return []
    const search = (params.search ?? '').trim()
    const companyId = (params.companyId ?? '').trim()
    const role = (params.role ?? '').trim()
    const status = (params.status ?? '').trim()
    const like = `%${search}%`

    const rows = await db.execute<{
      id: string
      full_name: string
      role: string
      is_active: boolean
      company_id: string | null
      org_unit_id: string | null
      email: string
      company_name: string | null
      org_unit_name: string | null
      created_at: string | null
    }>(sql`
      select
        p.id,
        p.full_name,
        p.role,
        p.is_active,
        p.company_id,
        p.org_unit_id,
        u.email,
        c.name as company_name,
        ou.name as org_unit_name,
        p.created_at
      from profiles p
      join users u on u.id = p.id
      left join companies c on c.id = p.company_id
      left join org_units ou on ou.id = p.org_unit_id
      where
        (${search} = '' or p.full_name ilike ${like} or u.email ilike ${like})
        and (${companyId} = '' or coalesce(p.company_id::text, '') = ${companyId})
        and (${role} = '' or p.role = ${role})
        and (
          ${status} = '' or (${status} = 'active' and p.is_active = true) or (${status} = 'disabled' and p.is_active = false)
        )
      order by p.created_at desc nulls last
      limit 500
    `)

    return rows.rows.map((r) => ({
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      role: r.role,
      isActive: Boolean(r.is_active),
      companyId: r.company_id,
      companyName: r.company_name,
      orgUnitId: r.org_unit_id,
      orgUnitName: r.org_unit_name,
      createdAt: r.created_at,
    }))
  }

  async getUser(userId: string) {
    if (!db) {
      throw new NotFoundException({ code: 'DB_UNAVAILABLE', message: 'Database not connected' })
    }

    const rows = await db.execute<{
      id: string
      full_name: string
      role: string
      is_active: boolean
      company_id: string | null
      org_unit_id: string | null
      email: string
      company_name: string | null
      org_unit_name: string | null
      created_at: string | null
    }>(sql`
      select
        p.id,
        p.full_name,
        p.role,
        p.is_active,
        p.company_id,
        p.org_unit_id,
        u.email,
        c.name as company_name,
        ou.name as org_unit_name,
        p.created_at
      from profiles p
      join users u on u.id = p.id
      left join companies c on c.id = p.company_id
      left join org_units ou on ou.id = p.org_unit_id
      where p.id = ${userId}
      limit 1
    `)

    const r = rows.rows[0]
    if (!r?.id) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' })
    }
    return {
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      role: r.role,
      isActive: Boolean(r.is_active),
      companyId: r.company_id,
      companyName: r.company_name,
      orgUnitId: r.org_unit_id,
      orgUnitName: r.org_unit_name,
      createdAt: r.created_at,
    }
  }

  async updateUser(userId: string, patch: { isActive?: boolean; role?: string; orgUnitId?: string }) {
    if (!db) return null
    const role = typeof patch.role === 'string' && patch.role.trim() ? patch.role.trim() : undefined
    const orgUnitId =
      typeof patch.orgUnitId === 'string' ? (patch.orgUnitId.trim() ? patch.orgUnitId.trim() : null) : undefined
    const [row] = await db
      .update(profiles)
      .set({
        ...(patch.isActive !== undefined ? { isActive: Boolean(patch.isActive) } : {}),
        ...(role ? { role } : {}),
        ...(orgUnitId !== undefined ? { orgUnitId } : {}),
        updatedAt: new Date(),
      })
      .where(sql`${profiles.id} = ${userId}`)
      .returning({ id: profiles.id })
    if (!row?.id) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' })
    }
    return row
  }

  async resetUserPassword(userId: string) {
    if (!db) {
      throw new BadRequestException({ code: 'DB_UNAVAILABLE', message: 'Database not connected' })
    }

    // Generate a temporary password (returned once to platform admin).
    const temp = `CP-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 10)}`
    const passwordHash = await bcrypt.hash(temp, 10)

    const [row] = await db
      .update(users)
      .set({ passwordHash })
      .where(sql`${users.id} = ${userId}`)
      .returning({ id: users.id })

    if (!row?.id) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' })
    }

    return { tempPassword: temp }
  }

  async listOrgUnits(companyId: string) {
    if (!db) return []
    const id = (companyId ?? '').trim()
    if (!id) return []

    const rows = await db
      .select({
        id: orgUnits.id,
        companyId: orgUnits.companyId,
        name: orgUnits.name,
        parentId: orgUnits.parentId,
        createdAt: orgUnits.createdAt,
      })
      .from(orgUnits)
      .where(sql`${orgUnits.companyId} = ${id}`)
      .orderBy(orgUnits.createdAt)

    return rows
  }

  async getOrgUnit(id: string) {
    if (!db) throw new NotFoundException({ code: 'DB_UNAVAILABLE', message: 'Database not connected' })
    const [row] = await db
      .select({
        id: orgUnits.id,
        companyId: orgUnits.companyId,
        name: orgUnits.name,
        parentId: orgUnits.parentId,
        createdAt: orgUnits.createdAt,
      })
      .from(orgUnits)
      .where(sql`${orgUnits.id} = ${id}`)
      .limit(1)
    if (!row?.id) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Org unit not found' })
    return row
  }

  async createOrgUnit(input: { companyId: string; name: string; parentId?: string; reason: string }) {
    if (!db) throw new BadRequestException({ code: 'DB_UNAVAILABLE', message: 'Database not connected' })
    const name = (input.name ?? '').trim()
    if (!name) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'name is required' })
    const companyId = (input.companyId ?? '').trim()
    if (!companyId) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'companyId is required' })
    const parentId = (input.parentId ?? '').trim() || null

    const [row] = await db
      .insert(orgUnits)
      .values({ companyId, name, parentId })
      .returning({
        id: orgUnits.id,
        companyId: orgUnits.companyId,
        name: orgUnits.name,
        parentId: orgUnits.parentId,
        createdAt: orgUnits.createdAt,
      })
    return row
  }

  async updateOrgUnit(id: string, input: { companyId?: string; name: string; parentId?: string; reason: string }) {
    if (!db) throw new BadRequestException({ code: 'DB_UNAVAILABLE', message: 'Database not connected' })
    const name = (input.name ?? '').trim()
    if (!name) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'name is required' })
    const parentId = (input.parentId ?? '').trim() || null

    const [row] = await db
      .update(orgUnits)
      .set({ name, parentId })
      .where(sql`${orgUnits.id} = ${id}`)
      .returning({
        id: orgUnits.id,
        companyId: orgUnits.companyId,
        name: orgUnits.name,
        parentId: orgUnits.parentId,
        createdAt: orgUnits.createdAt,
      })
    if (!row?.id) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Org unit not found' })
    return row
  }

  async deleteOrgUnit(id: string) {
    if (!db) return null
    const [row] = await db.delete(orgUnits).where(sql`${orgUnits.id} = ${id}`).returning({ id: orgUnits.id })
    if (!row?.id) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Org unit not found' })
    return row
  }

  async getRbacSnapshot(companyId: string) {
    if (!db) return { roles: [], rolePermissions: {}, overrides: [] }
    const id = (companyId ?? '').trim()
    if (!id) return { roles: [], rolePermissions: {}, overrides: [] }

    const rs = await db
      .select({ id: roles.id, name: roles.name, isSystem: roles.isSystem, createdAt: roles.createdAt })
      .from(roles)
      .where(sql`${roles.companyId} = ${id}`)
      .orderBy(roles.createdAt)

    const perms = await db.execute<{ role_id: string; permission_key: string }>(sql`
      select role_id, permission_key
      from role_permissions
      where role_id in (select id from roles where company_id = ${id})
      order by permission_key asc
    `)

    const byRole: Record<string, string[]> = {}
    for (const r of rs) byRole[String(r.id)] = []
    for (const p of perms.rows) {
      const rid = String(p.role_id)
      if (!byRole[rid]) byRole[rid] = []
      byRole[rid].push(String(p.permission_key))
    }

    const overrides = await db
      .select({
        id: userPermissionOverrides.id,
        userId: userPermissionOverrides.userId,
        permissionKey: userPermissionOverrides.permissionKey,
        effect: userPermissionOverrides.effect,
        reason: userPermissionOverrides.reason,
        createdAt: userPermissionOverrides.createdAt,
      })
      .from(userPermissionOverrides)
      .where(sql`${userPermissionOverrides.companyId} = ${id}`)
      .orderBy(userPermissionOverrides.createdAt)

    return { roles: rs, rolePermissions: byRole, overrides }
  }

  async patchRbac(input: {
    companyId: string
    kind: 'role_permissions' | 'user_override'
    reason: string
    roleId?: string
    permissions?: string[]
    userId?: string
    permissionKey?: string
    effect?: string
  }) {
    if (!db) throw new BadRequestException({ code: 'DB_UNAVAILABLE', message: 'Database not connected' })
    const companyId = (input.companyId ?? '').trim()
    if (!companyId) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'companyId is required' })

    if (input.kind === 'role_permissions') {
      const roleId = (input.roleId ?? '').trim()
      if (!roleId) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'roleId is required' })
      const perms = Array.isArray(input.permissions) ? input.permissions.map((p) => String(p).trim()).filter(Boolean) : []

      const [r] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(sql`${roles.id} = ${roleId} and ${roles.companyId} = ${companyId}`)
        .limit(1)
      if (!r?.id) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Role not found' })

      await db.transaction(async (tx) => {
        await tx.delete(rolePermissions).where(sql`${rolePermissions.roleId} = ${roleId}`)
        if (perms.length > 0) {
          await tx.insert(rolePermissions).values(perms.map((permissionKey) => ({ roleId, permissionKey })))
        }
      })
      return { ok: true }
    }

    const userId = (input.userId ?? '').trim()
    const permissionKey = (input.permissionKey ?? '').trim()
    const effect = (input.effect ?? '').trim()
    if (!userId || !permissionKey || (effect !== 'allow' && effect !== 'deny')) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'userId, permissionKey and effect are required' })
    }

    const reason = String(input.reason ?? '').trim() || null

    const [row] = await db
      .insert(userPermissionOverrides)
      .values({ userId, companyId, permissionKey, effect, reason })
      .onConflictDoUpdate({
        target: [userPermissionOverrides.userId, userPermissionOverrides.companyId, userPermissionOverrides.permissionKey],
        set: { effect, reason },
      })
      .returning({ id: userPermissionOverrides.id })

    return { ok: true, id: row?.id ?? null }
  }
}

