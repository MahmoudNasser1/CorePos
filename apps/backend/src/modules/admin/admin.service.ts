import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { db } from '../../common/db/drizzle'
import { branches, companies, profiles, users, warehouses, printSettings, printTemplates, companyAuditLogs, roles, rolePermissions, userPermissionOverrides } from '../../common/db/schema'
import { sql, and, eq } from 'drizzle-orm'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'

import { BillingService } from '../billing/billing.service'

@Injectable()
export class AdminService {
  constructor(private readonly billingService: BillingService) {}
  async writeAuditLog(params: {
    companyId: string
    actorUserId: string
    action: string
    targetType: string
    targetId?: string
    reason?: string
    metaJson?: any
    ip?: string
  }) {
    if (!db) return
    try {
      await db.insert(companyAuditLogs).values({
        companyId: params.companyId,
        actorUserId: params.actorUserId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        reason: params.reason,
        metaJson: params.metaJson ? JSON.stringify(params.metaJson) : null,
        ip: params.ip,
      })
    } catch (e) {
      console.error('Failed to write audit log:', e)
      // We don't want to crash the main operation if logging fails
    }
  }
  async getCompany(companyId: string) {
    if (!db) return null
    const [row] = await db.select().from(companies).where(sql`${companies.id} = ${companyId}`).limit(1)
    return row ?? null
  }

  async updateCompany(
    companyId: string,
    actorId: string,
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
      receiptFooter?: string | null
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
        ...(patch.receiptFooter !== undefined ? { receiptFooter: patch.receiptFooter } : {}),
        ...(patch.defaultBranchId !== undefined ? { defaultBranchId: patch.defaultBranchId } : {}),
      })
      .where(sql`${companies.id} = ${companyId}`)
      .returning()

    if (row) {
      await this.writeAuditLog({
        companyId,
        actorUserId: actorId,
        action: 'company.update',
        targetType: 'company',
        targetId: companyId,
        metaJson: patch,
      })
    }
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

  async createBranch(companyId: string, actorId: string, input: { name: string; address?: string; phone?: string }) {
    if (!db) return null

    // 0. Check Limits
    const { allowed, current, max } = await this.billingService.checkLimit(companyId, 'maxBranches')
    if (!allowed) {
      throw new ForbiddenException({
        code: 'LIMIT_EXCEEDED',
        message: `لقد وصلت للحد الأقصى للفروع (${max}). يرجى ترقية الاشتراك.`,
        details: { current, max }
      })
    }

    const [row] = await db
      .insert(branches)
      .values({
        companyId,
        name: input.name,
        address: input.address,
        phone: input.phone,
      })
      .returning()

    if (row) {
      await this.writeAuditLog({
        companyId,
        actorUserId: actorId,
        action: 'branch.create',
        targetType: 'branch',
        targetId: row.id,
        metaJson: { name: input.name },
      })
    }
    return row ?? null
  }

  async updateBranch(
    companyId: string,
    actorId: string,
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

    if (row) {
      await this.writeAuditLog({
        companyId,
        actorUserId: actorId,
        action: 'branch.update',
        targetType: 'branch',
        targetId: id,
        metaJson: patch,
      })
    }
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

  async createWarehouse(companyId: string, actorId: string, input: { branchId: string; name: string; isDefault?: boolean; isActive?: boolean }) {
    if (!db) return null

    // 0. Check Limits
    const { allowed, current, max } = await this.billingService.checkLimit(companyId, 'maxWarehouses')
    if (!allowed) {
      throw new ForbiddenException({
        code: 'LIMIT_EXCEEDED',
        message: `لقد وصلت للحد الأقصى للمستودعات (${max}). يرجى ترقية الاشتراك.`,
        details: { current, max }
      })
    }

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

      if (row) {
        await this.writeAuditLog({
          companyId,
          actorUserId: actorId,
          action: 'warehouse.create',
          targetType: 'warehouse',
          targetId: row.id,
          metaJson: { name, branchId },
        })
      }

      return row ?? null
    })
  }

  async updateWarehouse(
    companyId: string,
    actorId: string,
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

      if (row) {
        await this.writeAuditLog({
          companyId,
          actorUserId: actorId,
          action: 'warehouse.update',
          targetType: 'warehouse',
          targetId: id,
          metaJson: patch,
        })
      }

      return row ?? null
    })
  }

  async listUsers(companyId: string) {
    if (!db) return []
    // Join with users table for email and branches for branchName
    const res = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        email: users.email,
        phone: profiles.phone,
        role: profiles.role,
        branchId: profiles.branchId,
        branchName: branches.name,
        isActive: profiles.isActive,
        lastLoginAt: profiles.lastLoginAt,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .innerJoin(users, sql`${profiles.id} = ${users.id}`)
      .leftJoin(branches, sql`${profiles.branchId} = ${branches.id}`)
      .where(sql`${profiles.companyId} = ${companyId}`)
      .orderBy(profiles.fullName)
    return res
  }

  async createUser(
    companyId: string,
    actorId: string,
    data: {
      email: string
      fullName: string
      role: string
      password?: string
      branchId?: string
      phone?: string
    },
  ) {
    if (!db) throw new BadRequestException('Database not connected')

    // 0. Check Limits
    const { allowed, current, max } = await this.billingService.checkLimit(companyId, 'maxUsers')
    if (!allowed) {
      throw new ForbiddenException({
        code: 'LIMIT_EXCEEDED',
        message: `لقد وصلت للحد الأقصى للمستخدمين (${max}). يرجى ترقية الاشتراك.`,
        details: { current, max }
      })
    }

    // 1. Check if user already exists
    const existing = await db.query.users.findFirst({
      where: sql`${users.email} = ${data.email.toLowerCase()}`,
    })
    if (existing) {
      throw new BadRequestException('البريد الإلكتروني مسجل مسبقاً لمستخدم آخر')
    }

    // 2. Hash password (use provided or default)
    const pass = data.password || crypto.randomBytes(8).toString('hex')
    const passwordHash = await bcrypt.hash(pass, 10)

    return db.transaction(async (tx) => {
      // 3. Create User
      const [newUser] = await tx
        .insert(users)
        .values({
          email: data.email.toLowerCase(),
          passwordHash,
        })
        .returning({ id: users.id })

      // 4. Create Profile
      const [newProfile] = await tx
        .insert(profiles)
        .values({
          id: newUser.id,
          companyId,
          fullName: data.fullName,
          phone: data.phone || null,
          role: data.role,
          branchId: data.branchId || null,
          isActive: true,
        })
        .returning()

      await this.writeAuditLog({
        companyId,
        actorUserId: actorId,
        action: 'user.create',
        targetType: 'profile',
        targetId: newProfile.id,
        metaJson: { email: data.email, role: data.role, branchId: data.branchId },
      })

      return {
        ...newProfile,
        email: data.email,
        tempPassword: data.password ? undefined : pass,
      }
    })
  }

  async updateUser(
    companyId: string,
    actorId: string,
    targetUserId: string,
    data: {
      fullName?: string
      role?: string
      branchId?: string | null
      phone?: string | null
      reason: string
    },
  ) {
    if (!db) throw new BadRequestException('Database not connected')

    const profile = await db.query.profiles.findFirst({
      where: sql`${profiles.id} = ${targetUserId} AND ${profiles.companyId} = ${companyId}`,
    })

    if (!profile) throw new NotFoundException('المستخدم غير موجود')

    // Rules:
    // 1. Cannot change role of self
    if (actorId === targetUserId && data.role && data.role !== profile.role) {
      throw new ForbiddenException('لا يمكنك تغيير دورك الوظيفي بنفسك')
    }
    // 2. Cannot change role of owner if not owner (this will be handled by RBAC Stage B)
    if (profile.role === 'owner' && data.role && data.role !== 'owner') {
      // Allow only if there's another owner? For now, prevent.
      throw new ForbiddenException('لا يمكن تغيير دور مالك النظام')
    }

    const [updated] = await db
      .update(profiles)
      .set({
        fullName: data.fullName ?? profile.fullName,
        role: data.role ?? profile.role,
        branchId: data.branchId === undefined ? profile.branchId : data.branchId,
        phone: data.phone === undefined ? profile.phone : data.phone,
        updatedAt: new Date(),
      })
      .where(sql`${profiles.id} = ${targetUserId}`)
      .returning()

    await this.writeAuditLog({
      companyId,
      actorUserId: actorId,
      action: 'user.update',
      targetType: 'profile',
      targetId: targetUserId,
      reason: data.reason,
      metaJson: {
        fullName: data.fullName,
        role: data.role,
        branchId: data.branchId,
        phone: data.phone,
      },
    })

    return updated
  }

  async toggleUserActive(companyId: string, actorId: string, targetUserId: string, reason: string) {
    if (!db) throw new BadRequestException('Database not connected')

    if (actorId === targetUserId) {
      throw new ForbiddenException('لا يمكنك تعطيل حسابك الخاص')
    }

    const profile = await db.query.profiles.findFirst({
      where: sql`${profiles.id} = ${targetUserId} AND ${profiles.companyId} = ${companyId}`,
    })

    if (!profile) throw new NotFoundException('المستخدم غير موجود')

    if (profile.role === 'owner') {
      throw new ForbiddenException('لا يمكن تعطيل حساب مالك النظام')
    }

    const [updated] = await db
      .update(profiles)
      .set({
        isActive: !profile.isActive,
        updatedAt: new Date(),
      })
      .where(sql`${profiles.id} = ${targetUserId}`)
      .returning()

    await this.writeAuditLog({
      companyId,
      actorUserId: actorId,
      action: updated.isActive ? 'user.activate' : 'user.deactivate',
      targetType: 'profile',
      targetId: targetUserId,
      reason,
    })

    return updated
  }

  async resetUserPassword(companyId: string, actorId: string, targetUserId: string, reason: string) {
    if (!db) throw new BadRequestException('Database not connected')

    const profile = await db.query.profiles.findFirst({
      where: sql`${profiles.id} = ${targetUserId} AND ${profiles.companyId} = ${companyId}`,
    })
    if (!profile) throw new NotFoundException('المستخدم غير موجود')

    // Generate strong temporary password
    const tempPassword = crypto.randomBytes(6).toString('hex') + '!' + Math.floor(Math.random() * 100)
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    await db
      .update(users)
      .set({
        passwordHash,
      })
      .where(sql`${users.id} = ${targetUserId}`)

    await this.writeAuditLog({
      companyId,
      actorUserId: actorId,
      action: 'user.password_reset',
      targetType: 'user',
      targetId: targetUserId,
      reason,
    })

    return { success: true, tempPassword }
  }

  async getProfile(userId: string) {
    if (!db) return null
    const [row] = await db
      .select()
      .from(profiles)
      .where(sql`${profiles.id} = ${userId}`)
      .limit(1)
    return row ?? null
  }

  async updateMyProfile(userId: string, patch: { fullName?: string; phone?: string; avatarUrl?: string; quickStartDismissed?: boolean }) {
    if (!db) return null

    const [row] = await db
      .update(profiles)
      .set({
        ...(patch.fullName !== undefined ? { fullName: patch.fullName } : {}),
        ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
        ...(patch.avatarUrl !== undefined ? { avatarUrl: patch.avatarUrl } : {}),
        ...(patch.quickStartDismissed !== undefined ? { quickStartDismissed: Boolean(patch.quickStartDismissed) } : {}),
        updatedAt: new Date(),
      })
      .where(sql`${profiles.id} = ${userId}`)
      .returning()

    if (row?.companyId) {
      await this.writeAuditLog({
        companyId: row.companyId,
        actorUserId: userId,
        action: 'profile.update_self',
        targetType: 'profile',
        targetId: userId,
        metaJson: patch,
      })
    }
    return row ?? null
  }

  async listPrintTemplates(companyId: string) {
    if (!db) return []
    return db.select().from(printTemplates).where(sql`${printTemplates.companyId} = ${companyId}`)
  }

  async createPrintTemplate(companyId: string, actorId: string, input: { type: string; name: string; contentHtml: string; isDefault?: boolean }) {
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

      if (row) {
        await this.writeAuditLog({
          companyId,
          actorUserId: actorId,
          action: 'print_template.create',
          targetType: 'print_template',
          targetId: row.id,
          metaJson: { name: input.name, type: input.type },
        })
      }
      return row ?? null
    })
  }

  async updatePrintTemplate(companyId: string, actorId: string, id: string, patch: { name?: string; contentHtml?: string; isDefault?: boolean }) {
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

      if (row) {
        await this.writeAuditLog({
          companyId,
          actorUserId: actorId,
          action: 'print_template.update',
          targetType: 'print_template',
          targetId: id,
          metaJson: patch,
        })
      }
      return row ?? null
    })
  }

  async deletePrintTemplate(companyId: string, actorId: string, id: string) {
    if (!db) return
    const [row] = await db.delete(printTemplates).where(sql`${printTemplates.id} = ${id} and ${printTemplates.companyId} = ${companyId}`).returning()
    if (row) {
      await this.writeAuditLog({
        companyId,
        actorUserId: actorId,
        action: 'print_template.delete',
        targetType: 'print_template',
        targetId: id,
        metaJson: { name: row.name },
      })
    }
  }

  async getPrintSettings(companyId: string) {
    if (!db) return []
    const res = await db.execute(sql`
      select 
        ps.id as "id",
        ps.document_type as "documentType",
        ps.paper_size as "paperSize",
        ps.printer_name as "printerName",
        ps.template_id as "templateId",
        ps.margin_config as "marginConfig",
        ps.created_at as "createdAt",
        ps.updated_at as "updatedAt",
        pt.content_html as "templateCode"
      from print_settings ps
      left join print_templates pt on pt.id = ps.template_id
      where ps.company_id = ${companyId}
    `)
    return res.rows
  }

  async upsertPrintSettings(companyId: string, actorId: string, input: { documentType: string; paperSize: string; printerName?: string; templateId?: string; marginConfig?: string }) {
    if (!db) return null

    console.log('Upserting print settings:', { companyId, ...input });

    if (input.marginConfig) {
      try {
        JSON.parse(input.marginConfig)
      } catch (e) {
        throw new BadRequestException({ code: 'INVALID_JSON', message: 'marginConfig must be a valid JSON string' })
      }
    }

    const [existing] = await db.select({ id: printSettings.id })
      .from(printSettings)
      .where(and(
        eq(printSettings.companyId, companyId),
        eq(printSettings.documentType, input.documentType)
      ))
      .limit(1)
    
    if (existing) {
      const [row] = await db.update(printSettings).set({
        paperSize: input.paperSize,
        ...(input.printerName !== undefined ? { printerName: input.printerName } : {}),
        ...(input.templateId !== undefined ? { templateId: input.templateId } : {}),
        ...(input.marginConfig !== undefined ? { marginConfig: input.marginConfig } : {}),
        updatedAt: new Date(),
      }).where(eq(printSettings.id, existing.id)).returning()

      if (row) {
        await this.writeAuditLog({
          companyId,
          actorUserId: actorId,
          action: 'print_settings.update',
          targetType: 'print_settings',
          targetId: row.id,
          metaJson: input,
        })
      }
      return row ?? null
    } else {
      const [row] = await db.insert(printSettings).values({
        id: crypto.randomUUID(),
        companyId,
        documentType: input.documentType,
        paperSize: input.paperSize,
        printerName: input.printerName,
        templateId: input.templateId,
        marginConfig: input.marginConfig,
      }).returning()

      if (row) {
        await this.writeAuditLog({
          companyId,
          actorUserId: actorId,
          action: 'print_settings.create',
          targetType: 'print_settings',
          targetId: row.id,
          metaJson: input,
        })
      }
      return row ?? null
    }
  }

  async listAuditLogs(companyId: string) {
    if (!db) return []
    const res = await db.execute(sql`
      select 
        al.id,
        al.action,
        al.target_type as "targetType",
        al.target_id as "targetId",
        al.reason,
        al.meta_json as "metaJson",
        al.ip,
        al.created_at as "createdAt",
        p.full_name as "actorName",
        u.email as "actorEmail"
      from company_audit_logs al
      left join profiles p on p.id = al.actor_user_id
      left join users u on u.id = al.actor_user_id
      where al.company_id = ${companyId}
      order by al.created_at desc
      limit 200
    `)
    return res.rows
  }

  // --- RBAC Management ---
  async getRbacSnapshot(companyId: string) {
    if (!db) return { roles: [], rolePermissions: {}, overrides: [] }

    let rs = await db
      .select({ id: roles.id, name: roles.name, isSystem: roles.isSystem, createdAt: roles.createdAt })
      .from(roles)
      .where(sql`${roles.companyId} = ${companyId}`)
      .orderBy(roles.createdAt)

    // Lazy Seed if empty
    if (rs.length === 0) {
      const defaultRoles = [
        { name: "owner", isSystem: true },
        { name: "admin", isSystem: true },
        { name: "manager", isSystem: false },
        { name: "cashier", isSystem: false },
        { name: "accountant", isSystem: false },
      ]

      for (const dr of defaultRoles) {
        const rid = crypto.randomUUID()
        await db.insert(roles).values({
          id: rid,
          companyId,
          name: dr.name,
          isSystem: dr.isSystem,
        })

        // Simple default permissions for cashier/accountant
        if (dr.name === "cashier") {
          await db.insert(rolePermissions).values([
            { roleId: rid, permissionKey: "sales.read" },
            { roleId: rid, permissionKey: "sales.write" },
          ])
        } else if (dr.name === "accountant") {
          await db.insert(rolePermissions).values([
            { roleId: rid, permissionKey: "finance.read" },
            { roleId: rid, permissionKey: "reports.read" },
            { roleId: rid, permissionKey: "inventory.read" },
          ])
        }
      }

      // Re-fetch
      rs = await db
        .select({ id: roles.id, name: roles.name, isSystem: roles.isSystem, createdAt: roles.createdAt })
        .from(roles)
        .where(sql`${roles.companyId} = ${companyId}`)
        .orderBy(roles.createdAt)
    }

    const perms = await db.execute<{ role_id: string; permission_key: string }>(sql`
      select role_id, permission_key
      from role_permissions
      where role_id in (select id from roles where company_id = ${companyId})
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
      .where(sql`${userPermissionOverrides.companyId} = ${companyId}`)
      .orderBy(userPermissionOverrides.createdAt)

    const companyUsers = await db
      .select({ id: profiles.id, fullName: profiles.fullName })
      .from(profiles)
      .where(sql`${profiles.companyId} = ${companyId}`)

    return { roles: rs, rolePermissions: byRole, overrides, users: companyUsers }
  }

  async patchRbac(
    companyId: string,
    actorId: string,
    input: {
      kind: 'role_permissions' | 'user_override'
      reason: string
      roleId?: string
      permissions?: string[]
      userId?: string
      permissionKey?: string
      effect?: string
    },
  ) {
    if (!db) throw new BadRequestException('Database not connected')

    if (input.kind === 'role_permissions') {
      const roleId = (input.roleId ?? '').trim()
      if (!roleId) throw new BadRequestException('roleId is required')
      const perms = Array.isArray(input.permissions) ? input.permissions.map((p) => String(p).trim()).filter(Boolean) : []

      const [r] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(sql`${roles.id} = ${roleId} and ${roles.companyId} = ${companyId}`)
        .limit(1)
      if (!r?.id) throw new NotFoundException('Role not found')

      await db.transaction(async (tx) => {
        await tx.delete(rolePermissions).where(sql`${rolePermissions.roleId} = ${roleId}`)
        if (perms.length > 0) {
          await tx.insert(rolePermissions).values(perms.map((permissionKey) => ({ roleId, permissionKey })))
        }
      })

      await this.writeAuditLog({
        companyId,
        actorUserId: actorId,
        action: 'rbac.role_update',
        targetType: 'role',
        targetId: roleId,
        reason: input.reason,
        metaJson: { permissions: perms },
      })

      return { ok: true }
    }

    const userId = (input.userId ?? '').trim()
    const permissionKey = (input.permissionKey ?? '').trim()
    const effect = (input.effect ?? '').trim()
    if (!userId || !permissionKey || (effect !== 'allow' && effect !== 'deny')) {
      throw new BadRequestException('userId, permissionKey and effect are required')
    }

    // Ensure user belongs to company
    const [p] = await db.select({ id: profiles.id }).from(profiles).where(sql`${profiles.id} = ${userId} and ${profiles.companyId} = ${companyId}`).limit(1)
    if (!p?.id) throw new NotFoundException('User not found in this company')

    const reason = String(input.reason ?? '').trim() || null

    const [row] = await db
      .insert(userPermissionOverrides)
      .values({ userId, companyId, permissionKey, effect, reason })
      .onConflictDoUpdate({
        target: [userPermissionOverrides.userId, userPermissionOverrides.companyId, userPermissionOverrides.permissionKey],
        set: { effect, reason },
      })
      .returning({ id: userPermissionOverrides.id })

    await this.writeAuditLog({
      companyId,
      actorUserId: actorId,
      action: 'rbac.user_override',
      targetType: 'profile',
      targetId: userId,
      reason: input.reason,
      metaJson: { permissionKey, effect },
    })

    return { ok: true, id: row?.id ?? null }
  }
}

