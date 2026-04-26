import { AsyncLocalStorage } from 'node:async_hooks'

type TenantStore = {
  companyId: string | null
  userId: string | null
}

const tenantAls = new AsyncLocalStorage<TenantStore>()

export function runWithTenant(store: TenantStore, callback: () => void) {
  tenantAls.run(store, callback)
}

export function getTenantContext() {
  return tenantAls.getStore() ?? { companyId: null, userId: null }
}
