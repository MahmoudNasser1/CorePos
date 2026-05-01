"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar"
import { Header } from "@/components/layout/Header"
import { Building2, Users, CreditCard, LayoutDashboard, ShieldCheck, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

export const superAdminNavItems = [
  {
    title: "النظام المركزي",
    items: [
      { label: "الرئيسية", href: "/super-admin", icon: LayoutDashboard },
      { label: "الشركات", href: "/super-admin/companies", icon: Building2 },
      { label: "الاشتراكات", href: "/super-admin/subscriptions", icon: CreditCard },
      { label: "مستخدمي المنصة", href: "/super-admin/users", icon: Users },
      { label: "سجلات النظام", href: "/super-admin/audit-logs", icon: Activity },
      { label: "الصلاحيات (RBAC)", href: "/super-admin/rbac", icon: ShieldCheck },
    ],
  },
]

export function SuperAdminChrome({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <SuperAdminSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col transition-all duration-300 print:ps-0 lg:ps-72">
        <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            side="right"
            className="flex w-[min(100vw-2rem,20rem)] max-w-none flex-col p-0 sm:max-w-sm"
            dir="rtl"
          >
            <SheetHeader className="space-y-1 border-b p-5 text-start">
              <SheetTitle className="text-lg font-bold">إدارة المنصة</SheetTitle>
            </SheetHeader>
            <ScrollArea className="min-h-0 flex-1">
              <nav className="space-y-6 px-3 py-4 pb-10" aria-label="التنقل للموبايل">
                {superAdminNavItems.map((section) => (
                  <div key={section.title}>
                    <p className="px-3 pb-2 text-xs font-semibold text-muted-foreground">
                      {section.title}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (pathname.startsWith(item.href) && item.href !== "/super-admin")
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileNavOpen(false)}
                            className={cn(
                              "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 transition-all duration-300",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground motion-safe:group-hover:-translate-x-0.5",
                            )}
                          >
                            <item.icon
                              className={cn(
                                "relative z-10 h-5 w-5 shrink-0 transition-transform duration-300 motion-safe:group-hover:scale-110",
                                isActive ? "text-primary-foreground" : "group-hover:text-primary",
                              )}
                              aria-hidden
                            />
                            <span className="relative z-10 text-sm font-bold">{item.label}</span>
                            {isActive && (
                              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-20 md:px-8 print:px-4 print:pb-6 print:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
