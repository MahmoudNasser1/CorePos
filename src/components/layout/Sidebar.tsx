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
  LifeBuoy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const menuItems = [
  { icon: LayoutDashboard, label: "الرئيسية", href: "/dashboard" },
  { icon: ShoppingCart, label: "نقطة البيع (POS)", href: "/dashboard/pos" },
  { icon: Package, label: "المخزون", href: "/dashboard/inventory", badge: "12" },
  { icon: History, label: "المبيعات", href: "/dashboard/sales" },
  { icon: ArrowLeftRight, label: "المشتريات", href: "/dashboard/purchases" },
  { icon: Users, label: "العملاء", href: "/dashboard/customers" },
  { icon: Truck, label: "الموردون", href: "/dashboard/suppliers" },
  { icon: Store, label: "الفروع", href: "/dashboard/branches" },
  { icon: Wallet, label: "الخزينة", href: "/dashboard/finance" },
  { icon: BarChart3, label: "التقارير", href: "/dashboard/reports" },
  { icon: ClipboardList, label: "سجل النشاطات", href: "/dashboard/audit-logs" },
  { icon: CreditCard, label: "الاشتراكات", href: "/billing" },
  { icon: Settings, label: "الإعدادات", href: "/dashboard/settings" },
  { icon: LifeBuoy, label: "مركز المساعدة", href: "/dashboard/help" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 right-0 z-50 border-l bg-card text-card-foreground">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">C</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight">CorePOS</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                pathname === item.href ? "text-primary-foreground" : "group-hover:text-primary"
              )} />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <Badge variant={pathname === item.href ? "secondary" : "destructive"} className="mr-auto text-[10px] px-1.5 h-5 min-w-5 flex items-center justify-center">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* Subscription & Footer */}
      <div className="p-4 border-t space-y-4">
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-primary">خطة النمو</span>
            <span className="text-[10px] text-muted-foreground">75%</span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[75%]" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 leading-tight">
            باقي 5 أرقام في اشتراكك
          </p>
        </div>

        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </aside>
  )
}
