export type PlanKey = 'free' | 'starter' | 'pro'

export interface PlanLimit {
  maxUsers: number
  maxBranches: number
  maxWarehouses: number
  maxProducts: number
  maxInvoicesPerMonth: number
}

export const PLAN_LIMITS: Record<PlanKey, PlanLimit> = {
  free: {
    maxUsers: 2,
    maxBranches: 1,
    maxWarehouses: 1,
    maxProducts: 50,
    maxInvoicesPerMonth: 100,
  },
  starter: {
    maxUsers: 5,
    maxBranches: 3,
    maxWarehouses: 3,
    maxProducts: 500,
    maxInvoicesPerMonth: 1000,
  },
  pro: {
    maxUsers: 999,
    maxBranches: 999,
    maxWarehouses: 999,
    maxProducts: 99999,
    maxInvoicesPerMonth: 99999,
  },
}
