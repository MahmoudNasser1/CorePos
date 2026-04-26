export const backendFlags = {
  onboarding: process.env.BACKEND_FLAG_ONBOARDING === '1',
  finance: process.env.BACKEND_FLAG_FINANCE === '1',
  reports: process.env.BACKEND_FLAG_REPORTS === '1',
  admin: process.env.BACKEND_FLAG_ADMIN === '1',
  inventory: process.env.BACKEND_FLAG_INVENTORY === '1',
}

export function isBackendEnabled(flag: keyof typeof backendFlags): boolean {
  return backendFlags[flag]
}
