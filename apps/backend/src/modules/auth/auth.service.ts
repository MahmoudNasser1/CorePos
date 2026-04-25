import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'
import { db } from '../../common/db/drizzle'
import { companies, profiles, subscriptions, users } from '../../common/db/schema'
import { eq } from 'drizzle-orm'

type RegisterDto = {
  email: string
  password: string
  fullName?: string
  company?: string
}

type SessionUser = {
  id: string
  email: string
  role: string
  companyId: string | null
}

type SessionPayload = {
  user: SessionUser
  profile: { company_id: string | null; branch_id: string | null; role: string }
  company: {
    id: string
    name: string
    currency: string
    timezone: string
    countryCode: string
  } | null
  subscription: { status: 'active' | 'trialing' | 'expired' | 'cancelled' | 'past_due' | 'unknown'; plan: 'free' | 'starter' | 'pro' | 'unknown'; ends_at?: string | null }
}

@Injectable()
export class AuthService {
  private readonly secret = process.env.JWT_SECRET ?? 'dev-secret'

  private assertSafeSecret() {
    if (process.env.NODE_ENV === 'production' && this.secret === 'dev-secret') {
      throw new BadRequestException('JWT_SECRET must be set in production')
    }
  }

  async register(
    email: string,
    password: string,
    fullName: string,
    companyName?: string,
    companyAddress?: string,
    companyPhone?: string,
  ) {
    this.assertSafeSecret()
    if (!db) throw new BadRequestException('Database not connected')

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    })
    if (existing) throw new BadRequestException('User already exists')

    const passwordHash = await bcrypt.hash(password, 10)
    
    return db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({ email, passwordHash })
        .returning({ id: users.id })

      let companyId: string | null = null
      if (companyName) {
        const [newCompany] = await tx
          .insert(companies)
          .values({
            name: companyName,
            address: companyAddress?.trim() || undefined,
            phone: companyPhone?.trim() || undefined,
          })
          .returning({ id: companies.id })
        companyId = newCompany.id
      }

      const [newProfile] = await tx
        .insert(profiles)
        .values({
          id: newUser.id,
          fullName,
          role: 'owner', // Re-registering user starts as owner
          companyId: companyId,
        })
        .returning()

      const sessionUser: SessionUser = {
        id: newUser.id,
        email,
        role: newProfile.role || 'owner',
        companyId: newProfile.companyId,
      }

      return this.signTokens(sessionUser)
    })
  }

  async login(email: string, password: string) {
    this.assertSafeSecret()
    if (!db) throw new BadRequestException('Database not connected')

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    })

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      role: profile?.role ?? 'viewer',
      companyId: profile?.companyId ?? null,
    }

    return this.signTokens(sessionUser)
  }

  signTokens(user: SessionUser) {
    this.assertSafeSecret()
    const accessToken = jwt.sign(user, this.secret, { expiresIn: '30m' })
    const refreshToken = jwt.sign({ id: user.id }, this.secret, { expiresIn: '30d' })
    return { accessToken, refreshToken, user }
  }

  verifyToken(token: string) {
    this.assertSafeSecret()
    try {
      return jwt.verify(token, this.secret) as SessionUser
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }

  async getSession(token: string): Promise<SessionPayload> {
    this.assertSafeSecret()
    if (!db) throw new BadRequestException('Database not connected')

    const decoded = this.verifyToken(token)

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, decoded.id),
    })

    const resolvedCompanyId = profile?.companyId ?? decoded.companyId ?? null

    const company =
      resolvedCompanyId
        ? await db.query.companies.findFirst({
            where: eq(companies.id, resolvedCompanyId),
          })
        : null

    let sub: any = null
    if (resolvedCompanyId) {
      try {
        sub = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.companyId, resolvedCompanyId),
        })
      } catch {
        // In some deployments the subscriptions table is not migrated yet.
        sub = null
      }
    }

    return {
      user: decoded,
      profile: {
        company_id: resolvedCompanyId,
        branch_id: profile?.branchId ?? null,
        role: profile?.role ?? decoded.role,
      },
      company: company
        ? {
            id: company.id,
            name: company.name,
            currency: (company.currency as string | null | undefined) ?? 'EGP',
            timezone: (company.timezone as string | null | undefined) ?? 'Africa/Cairo',
            countryCode: (company.countryCode as string | null | undefined) ?? 'EG',
          }
        : null,
      subscription: sub
        ? {
            status: (sub.status as any) ?? 'unknown',
            plan: (sub.planId as any) ?? 'unknown',
            ends_at: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null,
          }
        : { status: 'unknown', plan: 'unknown', ends_at: null },
    }
  }

  refresh(refreshToken: string) {
    try {
      this.assertSafeSecret()
      if (!db) throw new BadRequestException('Database not connected')
      const decoded = jwt.verify(refreshToken, this.secret) as { id: string }
      if (!decoded?.id) throw new UnauthorizedException('Invalid refresh token')

      // Keep it simple: issue new tokens based on current user+profile snapshot
      // NOTE: This will evolve to refresh-token rotation and persistence.
      return db.transaction(async (tx) => {
        const user = await tx.query.users.findFirst({ where: eq(users.id, decoded.id) })
        if (!user) throw new UnauthorizedException('User not found')

        const profile = await tx.query.profiles.findFirst({ where: eq(profiles.id, decoded.id) })
        const sessionUser: SessionUser = {
          id: user.id,
          email: user.email,
          role: profile?.role ?? 'viewer',
          companyId: profile?.companyId ?? null,
        }

        return this.signTokens(sessionUser)
      })
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
}
