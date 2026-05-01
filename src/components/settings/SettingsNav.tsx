"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Building2, Globe2, Package2, Receipt, SlidersHorizontal, Printer, Users, ShieldCheck } from "lucide-react"

const items = [
  { title: "الشركة والمنطقة", href: "/dashboard/settings/company", icon: Globe2 },
  { title: "الفروع", href: "/dashboard/settings/branches", icon: Building2 },
  { title: "المخازن", href: "/dashboard/settings/warehouses", icon: Package2 },
  { title: "المستخدمون", href: "/dashboard/settings/users", icon: Users },
  { title: "المتغيرات", href: "/dashboard/settings/variables", icon: SlidersHorizontal },
  { title: "الفاتورة والشركة", href: "/dashboard/settings/invoice", icon: Receipt },
  { title: "الطباعة والقوالب", href: "/dashboard/settings/printing", icon: Printer },
  { title: "الصلاحيات", href: "/dashboard/settings/rbac", icon: ShieldCheck },
] as const

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav
      className="flex min-h-[3rem] flex-wrap items-center gap-1 rounded-xl border border-border/60 bg-muted/30 p-1"
      aria-label="أقسام الإعدادات"
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
