import { CanActivate, ForbiddenException, Injectable } from '@nestjs/common'
import { db } from '../../common/db/drizzle'
import { profiles } from '../../common/db/schema'
import { eq } from 'drizzle-orm'
import { requireUserId } from '../../common/tenant/require-user-id'

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  async canActivate(): Promise<boolean> {
    const userId = requireUserId()
    if (!db) {
      throw new ForbiddenException({
        code: 'DB_UNAVAILABLE',
        message: 'Database not connected',
      })
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      columns: { role: true },
    })

    const role = String(profile?.role ?? '').trim()
    if (role !== 'platform_admin') {
      throw new ForbiddenException({
        code: 'RBAC_FORBIDDEN',
        message: 'Platform admin access required',
      })
    }

    return true
  }
}

