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
  async getEffectivePermissions(params: { userId: string; companyId: string | null }): Promise<Set<string>> {
    const allowed = new Set<string>()
    if (!db) return allowed

    // 0. Fetch profile to check role
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, params.userId),
    })

    // 1. Platform Admin gets everything (bypass)
    if (profile?.role === 'platform_admin') {
      return new Set(PERMISSION_KEYS)
    }

    // 2. Company Owners and Admins get everything within their company
    if (params.companyId && (profile?.role === 'owner' || profile?.role === 'admin')) {
      return new Set(PERMISSION_KEYS)
    }

    // 3. Apply default permissions based on standard roles if no companyId or not owner/admin
    if (profile?.role && DEFAULT_ROLE_PERMISSIONS[profile.role]) {
      for (const p of DEFAULT_ROLE_PERMISSIONS[profile.role]) {
        allowed.add(p)
      }
    }

    // 4. Collect all role permissions assigned to this user in this company from the database
    if (params.companyId) {
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

      // 5. Apply user overrides (deny wins last)
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
    }

    return allowed
  }
}

const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  manager: [
    'inventory.read',
    'inventory.write',
    'sales.read',
    'sales.write',
    'sales.discount',
    'purchases.read',
    'purchases.write',
    'finance.read',
    'reports.read',
    'contacts.read',
    'contacts.write',
    'admin.users.read',
    'pos.execute',
    'warehouses.manage',
  ],
  cashier: [
    'inventory.read',
    'sales.read',
    'sales.write',
    'pos.execute',
    'contacts.read',
    'contacts.write',
  ],
  viewer: [
    'inventory.read',
    'sales.read',
    'purchases.read',
    'finance.read',
    'reports.read',
    'contacts.read',
  ],
  accountant: [
    'inventory.read',
    'sales.read',
    'purchases.read',
    'purchases.write',
    'finance.read',
    'finance.write',
    'reports.read',
    'reports.view_costs',
    'contacts.read',
  ],
}

