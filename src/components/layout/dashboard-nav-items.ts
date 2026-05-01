import { PermissionKey } from "@/hooks/usePermissions"
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  History,
  ArrowLeftRight,
  Users,
  Truck,
  Wallet,
  BarChart3,
  Settings,
  Building2,
  Package2,
  ClipboardList,
  CreditCard,
  LifeBuoy,
} from "lucide-react"

export type DashboardNavItem = {
  icon: LucideIcon
  label: string
  href: string
  badge?: string
  permission?: PermissionKey
}

export type DashboardNavSection = {
  title: string
  items: DashboardNavItem[]
}

/** تجميع الروابط (T1.1) — نفس البيانات للشريط الجانبي ودرج الموبايل */
export const dashboardNavSections: DashboardNavSection[] = [
  {
    title: "التشغيل اليومي",
    items: [
      { icon: LayoutDashboard, label: "الرئيسية", href: "/dashboard" },
      { icon: ShoppingCart, label: "نقطة البيع (POS)", href: "/dashboard/pos", permission: 'pos.execute' },
      { icon: Package, label: "المخزون", href: "/dashboard/inventory/products", permission: 'inventory.read' },
      { icon: History, label: "المبيعات", href: "/dashboard/sales/invoices", permission: 'sales.read' },
      { icon: ArrowLeftRight, label: "المشتريات", href: "/dashboard/purchases/invoices", permission: 'sales.write' },
    ],
  },
  {
    title: "العملاء والموردون",
    items: [
      { icon: Users, label: "العملاء", href: "/dashboard/customers", permission: 'customers.read' },
      { icon: Truck, label: "الموردون", href: "/dashboard/suppliers", permission: 'suppliers.read' },
    ],
  },
  {
    title: "الفروع والمستودعات والمالية",
    items: [
      { icon: Building2, label: "الفروع", href: "/dashboard/settings/branches", permission: 'branches.manage' },
      { icon: Package2, label: "المستودعات", href: "/dashboard/settings/warehouses", permission: 'warehouses.manage' },
      { icon: Wallet, label: "الخزينة", href: "/dashboard/finance/treasuries", permission: 'finance.read' },
      { icon: BarChart3, label: "التقارير", href: "/dashboard/reports", permission: 'reports.read' },
    ],
  },
  {
    title: "النظام",
    items: [
      { icon: Users, label: "المستخدمون", href: "/dashboard/settings/users", permission: 'admin.users.manage' },
      { icon: ClipboardList, label: "سجل النشاطات", href: "/dashboard/audit-logs", permission: 'admin.audit.read' },
      { icon: CreditCard, label: "الاشتراكات", href: "/dashboard/billing", permission: 'billing.read' },
      { icon: Settings, label: "الإعدادات", href: "/dashboard/settings", permission: 'admin.settings.manage' },
      { icon: LifeBuoy, label: "مركز المساعدة", href: "/dashboard/help" },
    ],
  },
]
