"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { dashboardNavSections } from "@/components/layout/dashboard-nav-items"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <aside
      className="glass fixed inset-y-0 right-0 z-50 hidden w-72 flex-col border-e bg-card/60 text-card-foreground backdrop-blur-xl print:hidden lg:flex"
      aria-label="التنقل الرئيسي"
    >
      <div className="flex h-16 items-center border-b border-border/50 px-6">
        <Link href="/dashboard" className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 shadow-lg transition-transform group-hover:rotate-6">
            <span className="text-xl font-black text-primary-foreground">C</span>
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-xl font-black tracking-tighter text-transparent">
            CorePOS
          </span>
        </Link>
      </div>

      <ScrollArea dir="rtl" className="min-h-0 flex-1 px-4 py-6">
        <nav className="space-y-6 pb-4">
          {dashboardNavSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-2 text-xs font-semibold text-muted-foreground">{section.title}</p>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (pathname.startsWith(item.href) && item.href !== "/dashboard")
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-2.5 transition-all duration-300",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground motion-safe:group-hover:-translate-x-0.5",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "relative z-10 h-5 w-5 transition-transform duration-300 motion-safe:group-hover:scale-110",
                          isActive ? "text-primary-foreground" : "group-hover:text-primary",
                        )}
                        aria-hidden
                      />
                      <span className="relative z-10 text-sm font-bold">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant={isActive ? "secondary" : "destructive"}
                          className="z-10 ms-auto flex h-5 min-w-5 items-center justify-center px-1.5 text-[10px] font-black"
                        >
                          {item.badge}
                        </Badge>
                      )}
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

      <div className="space-y-4 border-t border-border/50 p-4">
        <div className="glass rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black text-primary">خطة النمو</span>
            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              75%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/50">
            <div className="h-full w-[75%] rounded-full bg-gradient-to-r from-primary to-indigo-500 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
          </div>
          <p className="mt-3 flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            باقي 5 فواتير في حصتك الحالية
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-3 rounded-xl font-bold text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" aria-hidden />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </aside>
  )
}
