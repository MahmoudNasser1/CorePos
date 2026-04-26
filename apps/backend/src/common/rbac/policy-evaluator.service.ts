import { Injectable } from '@nestjs/common'
import { db } from '../db/drizzle'
import { rolePermissions, roles, userPermissionOverrides } from '../db/schema'
import { sql } from 'drizzle-orm'
import type { PermissionKey } from './permission-keys'

@Injectable()
export class PolicyEvaluatorService {
  /**
   * Minimal RBAC evaluator:
   * - Base permissions: union of all permissions granted by company roles (future: role assignment table)
   * - Overrides: per-user allow/deny applied last
   *
   * NOTE: Current codebase uses `profiles.role` string; full role assignment
   * table is phase-2. For now we support overrides only (and role permissions
   * when roles exist).
   */
  async getEffectivePermissions(params: { userId: string; companyId: string }): Promise<Set<string>> {
    const allowed = new Set<string>()
    if (!db) return allowed

    // Collect all role permissions for the company (MVP: no user-role assignment yet)
    const perms = await db.execute<{ permission_key: string }>(sql`
      select rp.permission_key
      from role_permissions rp
      join roles r on r.id = rp.role_id
      where r.company_id = ${params.companyId}
    `)
    for (const p of perms.rows) allowed.add(String(p.permission_key))

    // Apply user overrides (deny wins last)
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

