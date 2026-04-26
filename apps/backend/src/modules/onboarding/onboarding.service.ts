import { Injectable, BadRequestException } from '@nestjs/common'
import { db } from '../../common/db/drizzle'
import {
  companies,
  branches,
  warehouses,
  treasuries,
  categories,
  products,
  productStock,
  customers,
  suppliers,
  units,
  subscriptions,
  profiles,
} from '../../common/db/schema'
import { and, desc, eq } from 'drizzle-orm'

type CreateCompanyInput = {
  name: string
  phone: string
  address?: string
  currency: string
  vatRate: number
  countryCode?: string
  timezone?: string
  /** اسم الفرع الأول (افتراضي: الفرع الرئيسي) */
  defaultBranchName?: string
  /** اسم المخزن الافتراضي (افتراضي: المخزن الرئيسي) */
  defaultWarehouseName?: string
}

@Injectable()
export class OnboardingService {
  private defaultBranchLabel(payload: CreateCompanyInput) {
    const t = payload.defaultBranchName?.trim()
    return t && t.length > 0 ? t : 'الفرع الرئيسي'
  }

  private defaultWarehouseLabel(payload: CreateCompanyInput) {
    const t = payload.defaultWarehouseName?.trim()
    return t && t.length > 0 ? t : 'المخزن الرئيسي'
  }

  /**
   * Creates the tenant company stack. When `userId` is set, links that profile to the
   * new company + default branch (required so /auth/session exposes company_id and
   * onboarding does not loop).
   */
  async createInitialCompany(payload: CreateCompanyInput, userId?: string | null) {
    if (!db) throw new BadRequestException('Database not connected')

    const countryCode = (payload.countryCode ?? 'EG').trim().slice(0, 2).toUpperCase() || 'EG'
    const timezone = (payload.timezone ?? 'Africa/Cairo').trim() || 'Africa/Cairo'
    const branchName = this.defaultBranchLabel(payload)
    const warehouseName = this.defaultWarehouseLabel(payload)

    if (userId) {
      const prof = await db.query.profiles.findFirst({ where: eq(profiles.id, userId) })
      if (prof?.companyId) {
        const existing = await db.query.companies.findFirst({ where: eq(companies.id, prof.companyId) })
        if (existing) {
          const [branchRow] = await db
            .select({ id: branches.id })
            .from(branches)
            .where(eq(branches.companyId, existing.id))
            .limit(1)
          if (branchRow) {
            return {
              ...existing,
              slug: existing.name.toLowerCase().replace(/\s+/g, '-'),
            }
          }
          // Company from signup only (no branch yet) — finish subscription/branch/warehouse
          return db.transaction(async (tx) => {
            const [company] = await tx
              .update(companies)
              .set({
                name: payload.name,
                phone: payload.phone,
                address: payload.address,
                currency: payload.currency || 'EGP',
                vatRate: String(payload.vatRate ?? 0),
                countryCode,
                timezone,
              })
              .where(eq(companies.id, existing.id))
              .returning()

            const [existingSub] = await tx
              .select()
              .from(subscriptions)
              .where(eq(subscriptions.companyId, company.id))
              .limit(1)
            if (!existingSub) {
              const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
              await tx.insert(subscriptions).values({
                companyId: company.id,
                planId: 'starter',
                status: 'trialing',
                currentPeriodEnd: trialEndsAt,
              })
            }

            const [branch] = await tx
              .insert(branches)
              .values({
                companyId: company.id,
                name: branchName,
                phone: payload.phone,
                address: payload.address,
              })
              .returning()

            await tx.update(companies).set({ defaultBranchId: branch.id }).where(eq(companies.id, company.id))

            await tx.insert(warehouses).values({
              branchId: branch.id,
              name: warehouseName,
              isDefault: true,
            })

            await tx.insert(treasuries).values({
              companyId: company.id,
              branchId: branch.id,
              name: 'الخزينة الرئيسية',
              isDefault: true,
            })

            if (userId) {
              await tx
                .update(profiles)
                .set({
                  companyId: company.id,
                  branchId: branch.id,
                  updatedAt: new Date(),
                })
                .where(eq(profiles.id, userId))
            }

            return {
              ...company,
              slug: company.name.toLowerCase().replace(/\s+/g, '-'),
            }
          })
        }
      }
    }

    return db.transaction(async (tx) => {
      // 1. Create Company
      const [company] = await tx
        .insert(companies)
        .values({
          name: payload.name,
          phone: payload.phone,
          address: payload.address,
          currency: payload.currency || 'EGP',
          vatRate: String(payload.vatRate || 0),
          countryCode,
          timezone,
        })
        .returning()

      // 1.1 Create default subscription (MVP: manual billing; start with trialing)
      // Default plan: starter (can be changed later by admin).
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      await tx.insert(subscriptions).values({
        companyId: company.id,
        planId: 'starter',
        status: 'trialing',
        currentPeriodEnd: trialEndsAt,
      })

      // 2. Create Default Branch
      const [branch] = await tx
        .insert(branches)
        .values({
          companyId: company.id,
          name: branchName,
          phone: payload.phone,
          address: payload.address,
        })
        .returning()

      await tx.update(companies).set({ defaultBranchId: branch.id }).where(eq(companies.id, company.id))

      // 3. Create Default Warehouse
      await tx.insert(warehouses).values({
        branchId: branch.id,
        name: warehouseName,
        isDefault: true,
      })

      // 4. Create Default Treasury
      await tx.insert(treasuries).values({
        companyId: company.id,
        branchId: branch.id,
        name: 'الخزينة الرئيسية',
        isDefault: true,
      })

      if (userId) {
        await tx
          .update(profiles)
          .set({
            companyId: company.id,
            branchId: branch.id,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, userId))
      }

      return {
        ...company,
        slug: company.name.toLowerCase().replace(/\s+/g, '-'),
      }
    })
  }

  async getCompanyIdForUser(userId: string): Promise<string | null> {
    if (!db) return null
    const p = await db.query.profiles.findFirst({ where: eq(profiles.id, userId) })
    return p?.companyId ?? null
  }

  async setupSampleData(companyId: string) {
    if (!db) throw new BadRequestException('Database not connected')
    const targetCompanyId = companyId

    return db.transaction(async (tx) => {
      // 1. Units
      const [unit] = await tx
        .insert(units)
        .values({ companyId: targetCompanyId!, name: 'قطعة', nameEn: 'Pcs' })
        .returning()

      // 2. Categories
      const [cat1] = await tx
        .insert(categories)
        .values({ companyId: targetCompanyId!, name: 'إلكترونيات' })
        .returning()
      const [cat2] = await tx
        .insert(categories)
        .values({ companyId: targetCompanyId!, name: 'أجهزة منزلية' })
        .returning()

      // 3. Products
      const [prod1] = await tx
        .insert(products)
        .values({
          companyId: targetCompanyId!,
          categoryId: cat1.id,
          unitId: unit.id,
          name: 'ماوس لاسلكي',
          price1: '150',
          costPrice: '100',
          avgCost: '100',
        })
        .returning()

      const [prod2] = await tx
        .insert(products)
        .values({
          companyId: targetCompanyId!,
          categoryId: cat2.id,
          unitId: unit.id,
          name: 'خلاط كهربائي',
          price1: '1200',
          costPrice: '800',
          avgCost: '800',
        })
        .returning()

      // 4. Stock — مخزن «المخزن الرئيسي» لهذه الشركة فقط (تجنّب أول مخزن عشوائي باسم مطابق)
      const [warehouseRow] = await tx
        .select({ id: warehouses.id })
        .from(warehouses)
        .innerJoin(branches, eq(warehouses.branchId, branches.id))
        .where(eq(branches.companyId, targetCompanyId))
        .orderBy(desc(warehouses.isDefault))
        .limit(1)

      if (warehouseRow) {
        await tx.insert(productStock).values([
          { productId: prod1.id, warehouseId: warehouseRow.id, qty: '50', avgCost: '100' },
          { productId: prod2.id, warehouseId: warehouseRow.id, qty: '10', avgCost: '800' },
        ])
      }

      // 5. Contacts
      await tx.insert(customers).values({
        companyId: targetCompanyId!,
        name: 'عميل نقدي',
        phone: '000',
      })

      await tx.insert(suppliers).values({
        companyId: targetCompanyId!,
        name: 'مورد عام',
        phone: '000',
      })

      return {
        categories: 2,
        products: 2,
        customers: 1,
        suppliers: 1,
      }
    })
  }
}
