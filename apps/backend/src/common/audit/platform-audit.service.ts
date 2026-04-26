import { Injectable } from '@nestjs/common'
import { db } from '../db/drizzle'
import { platformAuditLogs } from '../db/schema'

type AuditMeta = Record<string, unknown>

@Injectable()
export class PlatformAuditService {
  async write(entry: {
    actorUserId: string
    action: string
    targetType: string
    targetId?: string | null
    companyId?: string | null
    reason?: string | null
    meta?: AuditMeta
    ip?: string | null
    requestId?: string | null
  }) {
    if (!db) return null

    const metaJson =
      entry.meta && Object.keys(entry.meta).length > 0 ? JSON.stringify(entry.meta) : null

    const [row] = await db
      .insert(platformAuditLogs)
      .values({
        actorUserId: entry.actorUserId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId ?? null,
        companyId: entry.companyId ?? null,
        reason: entry.reason ?? null,
        metaJson,
        ip: entry.ip ?? null,
        requestId: entry.requestId ?? null,
      })
      .returning({ id: platformAuditLogs.id })

    return row ?? null
  }
}

