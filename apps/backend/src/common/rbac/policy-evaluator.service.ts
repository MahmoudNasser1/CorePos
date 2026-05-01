import { Injectable } from '@nestjs/common'
import { db } from '../db/drizzle'
import { PERMISSION_KEYS, PermissionKey } from './permission-keys'
import { profiles, rolePermissions, roles, userPermissionOverrides } from '../db/schema'
import { eq, sql } from 'drizzle-orm'

@Injectable()
export class PolicyEvaluatorService {
  /**
   * Evaluates effective permissions for a user within a company.
   * - Special case: 'owner' role gets all permissions.
   * - Base: permissions from all assigned userRoles.
   * - Overrides: explicit per-user allow/deny.
   */
  async getEffectivePermissions(params: { userId: string; companyId: string }): Promise<Set<string>> {
    const allowed = new Set<string>()
    if (!db) return allowed

    // 0. Check if user is the company owner
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, params.userId),
    })

    if (profile?.role === 'owner') {
      return new Set(PERMISSION_KEYS)
    }

    // 1. Collect all role permissions assigned to this user in this company
    const perms = await db.execute<{ permission_key: string }>(sql`
      select distinct rp.permission_key
      from role_permissions rp
      join roles r on r.id = rp.role_id
      join user_roles ur on ur.role_id = r.id
      where ur.user_id = ${params.userId} 
      and ur.company_id = ${params.companyId}
      and r.company_id = ${params.companyId}
    `)
    for (const p of perms.rows) allowed.add(String(p.permission_key))

    // 2. Apply user overrides (deny wins last)
    const overrides = await db
      .select({
        permissionKey: userPermissionOverrides.permissionKey,
        effect: userPermissionOverrides.effect,
      })
      .from(userPermissionOverrides)
      .where(sql`${userPermissionOverrides.userId} = ${params.userId} and ${userPermissionOverrides.companyId} = ${params.companyId}`)

    for (const o of overrides) {
      const key = String(o.permissionKey) as PermissionKey
      const effect = String(o.effect)
      if (effect === 'deny') allowed.delete(key)
      if (effect === 'allow') allowed.add(key)
    }

    return allowed
  }
}

