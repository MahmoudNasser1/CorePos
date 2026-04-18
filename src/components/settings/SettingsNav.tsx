"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Building2, Package2, Users, Receipt, Settings } from "lucide-react"

export function SettingsNav() {
  const pathname = usePathname()

  const items = [
    { title: "إدارة الفروع", href: "/dashboard/settings/branches", icon: Building2 },
    { title: "إدارة المخازن", href: "/dashboard/settings/warehouses", icon: Package2 },
    { title: "إدارة المستخدمين", href: "/dashboard/settings/users", icon: Users },
    { title: "إعدادات المتجر", href: "/dashboard/settings/shop", icon: Settings },
  ]

  return (
    <nav className="flex items-center gap-1 bg-secondary/30 p-1 rounded-xl w-fit">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all",
              isActive 
                ? "bg-white text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
