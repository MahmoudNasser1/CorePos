import { BadRequestException, Injectable } from '@nestjs/common'
import { db } from '../../common/db/drizzle'
import { branches, companies, profiles, warehouses, printSettings, printTemplates } from '../../common/db/schema'
import { sql } from 'drizzle-orm'

@Injectable()
export class AdminService {
  async getCompany(companyId: string) {
    if (!db) return null
    const [row] = await db.select().from(companies).where(sql`${companies.id} = ${companyId}`).limit(1)
    return row ?? null
  }

  async updateCompany(
    companyId: string,
    patch: {
      name?: string
      phone?: string
      address?: string | null
      email?: string | null
      nameEn?: string | null
      logoUrl?: string | null
      taxNumber?: string | null
      vatRate?: number | string
      currency?: string
      countryCode?: string
      timezone?: string
      defaultBranchId?: string | null
    },
  ) {
    if (!db) return null
    const vatStr =
      patch.vatRate !== undefined && patch.vatRate !== null && patch.vatRate !== ''
        ? String(patch.vatRate)
        : undefined
    if (patch.defaultBranchId !== undefined) {
      const t = String(patch.defaultBranchId ?? '').trim()
      if (!t) {
        patch.defaultBranchId = null
      } else {
        const [b] = await db
          .select({ id: branches.id })
          .from(branches)
          .where(sql`${branches.id} = ${t} and ${branches.companyId} = ${companyId} and ${branches.isActive} = true`)
          .limit(1)
        if (!b?.id) {
          throw new BadRequestException({ code: 'NOT_FOUND', message: 'الفرع غير موجود' })
        }
        patch.defaultBranchId = t
      }
    }

    const [row] = await db
      .update(companies)
      .set({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
        ...(patch.address !== undefined ? { address: patch.address } : {}),
        ...(patch.email !== undefined ? { email: patch.email } : {}),
        ...(patch.nameEn !== undefined ? { nameEn: patch.nameEn } : {}),
        ...(patch.logoUrl !== undefined ? { logoUrl: patch.logoUrl } : {}),
        ...(patch.taxNumber !== undefined ? { taxNumber: patch.taxNumber } : {}),
        ...(vatStr !== undefined ? { vatRate: vatStr } : {}),
        ...(patch.currency !== undefined ? { currency: patch.currency } : {}),
        ...(patch.countryCode !== undefined ? { countryCode: patch.countryCode } : {}),
        ...(patch.timezone !== undefined ? { timezone: patch.timezone } : {}),
        ...(patch.defaultBranchId !== undefined ? { defaultBranchId: patch.defaultBranchId } : {}),
      })
      .where(sql`${companies.id} = ${companyId}`)
      .returning()
    return row ?? null
  }

  async listBranches(companyId: string) {
    if (!db) return []
    const res = await db
      .select()
      .from(branches)
      .where(sql`${branches.companyId} = ${companyId}`)
      .orderBy(branches.createdAt)
    return res
  }

  async createBranch(companyId: string, input: { name: string; address?: string; phone?: string }) {
    if (!db) return null
    const [row] = await db
      .insert(branches)
      .values({
        companyId,
        name: input.name,
        address: input.address,
        phone: input.phone,
      })
      .returning()
    return row ?? null
  }

  async updateBranch(
    companyId: string,
    id: string,
    patch: { name?: string; address?: string; phone?: string; isActive?: boolean },
  ) {
    if (!db) return null
    const [row] = await db
      .update(branches)
      .set({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.address !== undefined ? { address: patch.address } : {}),
        ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
        ...(patch.isActive !== undefined ? { isActive: Boolean(patch.isActive) } : {}),
      })
      .where(sql`${branches.id} = ${id} and ${branches.companyId} = ${companyId}`)
      .returning()
    return row ?? null
  }

  async listWarehouses(companyId: string) {
    if (!db) return []
    // Join warehouses -> branches to filter by company and expose branch name
    const res = await db.execute(sql`
      select 
        w.id,
        w.name,
        w.branch_id as "branchId",
        w.is_default as "isDefault",
        w.is_active as "isActive",
        w.created_at as "createdAt",
        b.name as "branchName"
      from warehouses w
      join branches b on b.id = w.branch_id
      where b.company_id = ${companyId}
      order by w.created_at asc
    `)
    return res.rows
  }

  async createWarehouse(
    companyId: string,
    input: { name: string; branchId: string; isDefault?: boolean; isActive?: boolean },
  ) {
    if (!db) return null

    const name = (input.name || '').trim()
    if (!name) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'اسم المستودع مطلوب' })
    }
    const branchId = (input.branchId || '').trim()
    if (!branchId) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'يجب اختيار الفرع' })
    }

    // Ensure branch belongs to company
    const [b] = await db
      .select({ id: branches.id })
      .from(branches)
      .where(sql`${branches.id} = ${branchId} and ${branches.companyId} = ${companyId}`)
      .limit(1)
    if (!b?.id) {
      throw new BadRequestException({ code: 'NOT_FOUND', message: 'الفرع غير موجود' })
    }

    return db.transaction(async (tx) => {
      if (input.isDefault) {
        await tx.update(warehouses).set({ isDefault: false }).where(sql`${warehouses.branchId} = ${branchId}`)
      }

      const [row] = await tx
        .insert(warehouses)
        .values({
          branchId,
          name,
          isDefault: Boolean(input.isDefault),
          isActive: input.isActive !== false,
        })
        .returning()

      return row ?? null
    })
  }

  async updateWarehouse(
    companyId: string,
    id: string,
    patch: { name?: string; isDefault?: boolean; isActive?: boolean },
  ) {
    if (!db) return null

    // Ensure warehouse belongs to company + read branchId for default handling
    const res = await db.execute(sql`
      select w.id, w.branch_id as "branchId"
      from warehouses w
      join branches b on b.id = w.branch_id
      where w.id = ${id} and b.company_id = ${companyId}
      limit 1
    `)
    const row0 = (res.rows as any[])[0]
    const branchId = row0?.branchId as string | undefined
    if (!branchId) {
      throw new BadRequestException({ code: 'NOT_FOUND', message: 'المستودع غير موجود' })
    }

    return db.transaction(async (tx) => {
      if (patch.isDefault === true) {
        await tx.update(warehouses).set({ isDefault: false }).where(sql`${warehouses.branchId} = ${branchId}`)
      }

      const [row] = await tx
        .update(warehouses)
        .set({
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.isDefault !== undefined ? { isDefault: Boolean(patch.isDefault) } : {}),
          ...(patch.isActive !== undefined ? { isActive: Boolean(patch.isActive) } : {}),
        })
        .where(sql`${warehouses.id} = ${id}`)
        .returning()

      // Ensure at least one default warehouse per branch if we just unset the default
      if (patch.isDefault === false) {
        const [anyDefault] = await tx
          .select({ id: warehouses.id })
          .from(warehouses)
          .where(sql`${warehouses.branchId} = ${branchId} and ${warehouses.isDefault} = true and ${warehouses.isActive} = true`)
          .limit(1)
        if (!anyDefault?.id) {
          const [fallback] = await tx
            .select({ id: warehouses.id })
            .from(warehouses)
            .where(sql`${warehouses.branchId} = ${branchId} and ${warehouses.isActive} = true`)
            .limit(1)
          if (fallback?.id) {
            await tx.update(warehouses).set({ isDefault: true }).where(sql`${warehouses.id} = ${fallback.id}`)
          }
        }
      }

      return row ?? null
    })
  }

  async listUsers(companyId: string) {
    if (!db) return []
    const res = await db
      .select()
      .from(profiles)
      .where(sql`${profiles.companyId} = ${companyId}`)
      .orderBy(profiles.fullName)
    return res
  }

  async updateMyProfile(userId: string, patch: { quickStartDismissed?: boolean }) {
    if (!db) return null

    const [row] = await db
      .update(profiles)
      .set({
        ...(patch.quickStartDismissed !== undefined ? { quickStartDismissed: Boolean(patch.quickStartDismissed) } : {}),
        updatedAt: new Date(),
      })
      .where(sql`${profiles.id} = ${userId}`)
      .returning()
    return row ?? null
  }

  async listPrintTemplates(companyId: string) {
    if (!db) return []
    return db.select().from(printTemplates).where(sql`${printTemplates.companyId} = ${companyId}`)
  }

  async createPrintTemplate(companyId: string, input: { type: string; name: string; contentHtml: string; isDefault?: boolean }) {
    if (!db) return null
    return db.transaction(async (tx) => {
      if (input.isDefault) {
        await tx.update(printTemplates).set({ isDefault: false }).where(sql`${printTemplates.companyId} = ${companyId} AND ${printTemplates.type} = ${input.type}`)
      }
      const [row] = await tx.insert(printTemplates).values({
        companyId,
        type: input.type,
        name: input.name,
        contentHtml: input.contentHtml,
        isDefault: input.isDefault ?? false,
      }).returning()
      return row ?? null
    })
  }

  async updatePrintTemplate(companyId: string, id: string, patch: { name?: string; contentHtml?: string; isDefault?: boolean }) {
    if (!db) return null
    
    return db.transaction(async (tx) => {
      if (patch.isDefault) {
        const [existing] = await tx.select({ type: printTemplates.type }).from(printTemplates).where(sql`${printTemplates.id} = ${id} and ${printTemplates.companyId} = ${companyId}`).limit(1)
        if (existing) {
          await tx.update(printTemplates).set({ isDefault: false }).where(sql`${printTemplates.companyId} = ${companyId} AND ${printTemplates.type} = ${existing.type}`)
        }
      }
      
      const [row] = await tx.update(printTemplates).set({
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.contentHtml !== undefined ? { contentHtml: patch.contentHtml } : {}),
        ...(patch.isDefault !== undefined ? { isDefault: patch.isDefault } : {}),
        updatedAt: new Date()
      }).where(sql`${printTemplates.id} = ${id} and ${printTemplates.companyId} = ${companyId}`).returning()
      return row ?? null
    })
  }

  async deletePrintTemplate(companyId: string, id: string) {
    if (!db) return
    await db.delete(printTemplates).where(sql`${printTemplates.id} = ${id} and ${printTemplates.companyId} = ${companyId}`)
  }

  async getPrintSettings(companyId: string) {
    if (!db) return []
    const res = await db.execute(sql`
      select 
        ps.*,
        pt.content_html as "templateCode"
      from print_settings ps
      left join print_templates pt on pt.id = ps.template_id
      where ps.company_id = ${companyId}
    `)
    return res.rows
  }

  async upsertPrintSettings(companyId: string, input: { documentType: string; paperSize: string; printerName?: string; templateId?: string; marginConfig?: string }) {
    if (!db) return null

    if (input.marginConfig) {
      try {
        JSON.parse(input.marginConfig)
      } catch (e) {
        throw new BadRequestException({ code: 'INVALID_JSON', message: 'marginConfig must be a valid JSON string' })
      }
    }

    const [existing] = await db.select({ id: printSettings.id }).from(printSettings).where(sql`${printSettings.companyId} = ${companyId} and ${printSettings.documentType} = ${input.documentType}`).limit(1)
    
    if (existing) {
      const [row] = await db.update(printSettings).set({
        paperSize: input.paperSize,
        ...(input.printerName !== undefined ? { printerName: input.printerName } : { printerName: null }),
        ...(input.templateId !== undefined ? { templateId: input.templateId } : { templateId: null }),
        ...(input.marginConfig !== undefined ? { marginConfig: input.marginConfig } : { marginConfig: null }),
        updatedAt: new Date(),
      }).where(sql`${printSettings.id} = ${existing.id}`).returning()
      return row ?? null
    } else {
      const [row] = await db.insert(printSettings).values({
        companyId,
        documentType: input.documentType,
        paperSize: input.paperSize,
        printerName: input.printerName,
        templateId: input.templateId,
        marginConfig: input.marginConfig,
      }).returning()
      return row ?? null
    }
  }
}

