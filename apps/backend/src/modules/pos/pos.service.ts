import { BadRequestException, Injectable } from '@nestjs/common'
import { randomUUID, createHash } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { db } from '../../common/db/drizzle'

type CreateHeldCartInput = {
  companyId: string
  branchId: string
  customerId: string | null
  items: unknown
  total: number
  notes?: string
  createdBy: string
  idempotencyKey?: string
}

@Injectable()
export class PosService {
  private hashRequest(value: unknown): string {
    return createHash('sha256').update(JSON.stringify(value)).digest('hex')
  }

  async saveHeldCart(input: CreateHeldCartInput) {
    if (!db) return { success: true, id: randomUUID() }

    if (!input.branchId) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'branchId مطلوب' })
    if (!input.createdBy) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'createdBy مطلوب' })

    return db.transaction(async (tx) => {
      // Idempotency (minimal): re-use finance idempotency table
      if (input.idempotencyKey) {
        const reqHash = this.hashRequest(input)
        const existing = await tx.execute(sql`
          select request_hash, response_json
          from idempotency_keys
          where company_id = ${input.companyId}
            and key = ${input.idempotencyKey}
          limit 1
        `)
        const row = existing.rows[0] as any
        if (row?.response_json) {
          if (row.request_hash && row.request_hash !== reqHash) {
            throw new BadRequestException({ code: 'CONFLICT', message: 'Idempotency-Key مستخدم مسبقاً مع بيانات مختلفة' })
          }
          try {
            return JSON.parse(String(row.response_json))
          } catch {}
        }
      }

      const id = randomUUID()
      await tx.execute(sql`
        insert into pos_hold_carts (
          id, company_id, branch_id, customer_id, items, total, notes, created_by
        ) values (
          ${id}, ${input.companyId}, ${input.branchId}, ${input.customerId ?? null},
          ${JSON.stringify(input.items)}, ${input.total}, ${input.notes ?? null}, ${input.createdBy}
        )
      `)

      const result = { success: true, id }
      if (input.idempotencyKey) {
        const reqHash = this.hashRequest(input)
        await tx.execute(sql`
          insert into idempotency_keys (company_id, key, request_hash, response_json)
          values (${input.companyId}, ${input.idempotencyKey}, ${reqHash}, ${JSON.stringify(result)})
          on conflict (company_id, key) do nothing
        `)
      }
      return result
    })
  }

  async listHeldCarts(companyId: string, branchId: string, limit = 50) {
    if (!db) return []
    const lim = Math.min(Math.max(limit, 1), 200)
    const res = await db.execute(sql`
      select
        c.id,
        c.branch_id,
        c.customer_id,
        c.items,
        c.total,
        c.notes,
        c.created_at,
        cu.name as customer_name
      from pos_hold_carts c
      left join customers cu on cu.id = c.customer_id
      where c.company_id = ${companyId}
        and c.branch_id = ${branchId}
      order by c.created_at desc
      limit ${lim}
    `)
    return (res.rows as any[]).map((r) => ({
      id: r.id,
      branch_id: r.branch_id,
      customer_id: r.customer_id,
      items: (() => {
        try { return JSON.parse(String(r.items || '[]')) } catch { return [] }
      })(),
      total: Number(r.total || 0),
      notes: r.notes,
      created_at: r.created_at,
      customers: r.customer_id ? { name: r.customer_name } : null,
    }))
  }

  async deleteHeldCart(companyId: string, id: string) {
    if (!db) return { success: true }
    await db.execute(sql`
      delete from pos_hold_carts
      where company_id = ${companyId}
        and id = ${id}
    `)
    return { success: true }
  }
}

