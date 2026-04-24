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
      { icon: ShoppingCart, label: "نقطة البيع (POS)", href: "/dashboard/pos" },
      { icon: Package, label: "المخزون", href: "/dashboard/inventory/products" },
      { icon: History, label: "المبيعات", href: "/dashboard/sales/invoices" },
      { icon: ArrowLeftRight, label: "المشتريات", href: "/dashboard/purchases/invoices" },
    ],
  },
  {
    title: "العملاء والموردون",
    items: [
      { icon: Users, label: "العملاء", href: "/dashboard/customers" },
      { icon: Truck, label: "الموردون", href: "/dashboard/suppliers" },
    ],
  },
  {
    title: "الفروع والمستودعات والمالية",
    items: [
      { icon: Building2, label: "الفروع", href: "/dashboard/settings/branches" },
      { icon: Package2, label: "المستودعات", href: "/dashboard/settings/warehouses" },
      { icon: Wallet, label: "الخزينة", href: "/dashboard/finance/treasuries" },
      { icon: BarChart3, label: "التقارير", href: "/dashboard/reports" },
    ],
  },
  {
    title: "النظام",
    items: [
      { icon: ClipboardList, label: "سجل النشاطات", href: "/dashboard/audit-logs" },
      { icon: CreditCard, label: "الاشتراكات", href: "/billing" },
      { icon: Settings, label: "الإعدادات", href: "/dashboard/settings" },
      { icon: LifeBuoy, label: "مركز المساعدة", href: "/dashboard/help" },
    ],
  },
]
