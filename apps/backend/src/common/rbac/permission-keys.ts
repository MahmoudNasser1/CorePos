export const PERMISSION_KEYS = [
  // ──── المخزون ────
  'inventory.read',
  'inventory.write',

  // ──── المبيعات ────
  'sales.read',
  'sales.write',
  'sales.void',
  'sales.discount',

  // ──── المشتريات ────
  'purchases.read',
  'purchases.write',

  // ──── المالية ────
  'finance.read',
  'finance.write',

  // ──── التقارير ────
  'reports.read',
  'reports.view_costs',

  // ──── جهات الاتصال ────
  'contacts.read',
  'contacts.write',

  // ──── الإدارة ────
  'admin.users.read',
  'admin.users.manage',
  'admin.roles.manage',
  'admin.settings.read',
  'admin.settings.manage',
  'admin.audit.read',

  // ──── نقطة البيع ────
  'pos.execute',

  // ──── الفروع والمستودعات ────
  'branches.manage',
  'warehouses.manage',

  // ──── الاشتراكات ────
  'billing.read',

  // ──── المنصة ────
  'platform.companies.manage',
  'platform.users.manage',
  'platform.ops.execute',
] as const

export type PermissionKey = (typeof PERMISSION_KEYS)[number]

export const PERMISSION_EFFECTS = ['allow', 'deny'] as const
export type PermissionEffect = (typeof PERMISSION_EFFECTS)[number]

