"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  LogOut,
  Bell,
  ShieldCheck,
  Store,
  ClipboardList,
  CreditCard,
  LifeBuoy,
  Building2,
  Package2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const menuItems = [
  { icon: LayoutDashboard, label: "الرئيسية", href: "/dashboard" },
  { icon: ShoppingCart, label: "نقطة البيع (POS)", href: "/dashboard/pos" },
  { icon: Package, label: "المخزون", href: "/dashboard/inventory/products", badge: "12" },
  { icon: History, label: "المبيعات", href: "/dashboard/sales/invoices" },
  { icon: ArrowLeftRight, label: "المشتريات", href: "/dashboard/purchases/invoices" },
  { icon: Users, label: "العملاء", href: "/dashboard/customers" },
  { icon: Truck, label: "الموردون", href: "/dashboard/suppliers" },
  { icon: Building2, label: "الفروع", href: "/dashboard/settings/branches" },
  { icon: Package2, label: "المستودعات", href: "/dashboard/settings/warehouses" },
  { icon: Wallet, label: "الخزينة", href: "/dashboard/finance/treasuries" },
  { icon: BarChart3, label: "التقارير", href: "/dashboard/reports" },
  { icon: ClipboardList, label: "سجل النشاطات", href: "/dashboard/audit-logs" },
  { icon: CreditCard, label: "الاشتراكات", href: "/billing" },
  { icon: Settings, label: "الإعدادات", href: "/dashboard/settings" },
  { icon: LifeBuoy, label: "مركز المساعدة", href: "/dashboard/help" },
]

import { useEffect, useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 right-0 z-50 border-l bg-card/60 backdrop-blur-xl text-card-foreground glass">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
            <span className="text-primary-foreground font-black text-xl">C</span>
          </div>
          <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">CorePOS</span>
        </Link>
      </div>

      <ScrollArea dir="rtl" className="flex-1 px-4 py-6">
        <nav className="space-y-1.5">
          {mounted && menuItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground hover:translate-l-1"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-primary-foreground" : "group-hover:text-primary"
                )} />
                <span className="font-bold text-sm relative z-10">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={isActive ? "secondary" : "destructive"} 
                    className="mr-auto text-[10px] font-black px-1.5 h-5 min-w-5 flex items-center justify-center z-10"
                  >
                    {item.badge}
                  </Badge>
                )}
                {/* Active Glow Effect */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Subscription & Footer */}
      <div className="p-4 border-t border-border/50 space-y-4">
        <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 glass">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-black text-primary">خطة النمو</span>
            <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">75%</span>
          </div>
          <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-indigo-500 h-full w-[75%] rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            باقي 5 فواتير في حصتك الحالية
          </p>
        </div>

        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive font-bold hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </aside>
  )
}
