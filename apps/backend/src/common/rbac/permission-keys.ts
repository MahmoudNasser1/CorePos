export const PERMISSION_KEYS = [
  'inventory.read',
  'inventory.write',
  'sales.read',
  'sales.write',
  'finance.read',
  'finance.write',
  'reports.read',
  'reports.view_costs',
  'admin.users.manage',
  'admin.settings.manage',
  'platform.companies.manage',
  'platform.users.manage',
  'platform.ops.execute',
] as const

export type PermissionKey = (typeof PERMISSION_KEYS)[number]

export const PERMISSION_EFFECTS = ['allow', 'deny'] as const
export type PermissionEffect = (typeof PERMISSION_EFFECTS)[number]

