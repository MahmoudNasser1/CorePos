"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuthStore } from "@/stores/authStore"
import { superAdminNavItems } from "./SuperAdminChrome"

export function SuperAdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      useAuthStore.getState().clearAuth()
      router.push("/login")
      router.refresh()
    } catch {
      toast.error("تعذّر تسجيل الخروج. تحقق من الاتصال ثم أعد المحاولة.")
    }
  }

  return (
    <aside
      className="glass fixed inset-y-0 right-0 z-50 hidden w-72 flex-col border-e bg-slate-900 text-slate-100 backdrop-blur-xl print:hidden lg:flex"
      aria-label="التنقل الرئيسي لمدير المنصة"
    >
      <div className="flex h-16 items-center border-b border-slate-800 px-6 bg-slate-950/50">
        <Link href="/super-admin" className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-lg transition-transform group-hover:rotate-6">
            <span className="text-xl font-black text-white">SA</span>
          </div>
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-xl font-black tracking-tighter text-transparent">
            SuperAdmin
          </span>
        </Link>
      </div>

      <ScrollArea dir="rtl" className="min-h-0 flex-1 px-4 py-6">
        <nav className="space-y-6 pb-10">
          {superAdminNavItems.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{section.title}</p>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (pathname.startsWith(item.href) && item.href !== "/super-admin")
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-2.5 transition-all duration-300",
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white motion-safe:group-hover:-translate-x-0.5",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "relative z-10 h-5 w-5 transition-transform duration-300 motion-safe:group-hover:scale-110",
                          isActive ? "text-white" : "group-hover:text-blue-400",
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

      <div className="space-y-4 border-t border-slate-800 p-4 bg-slate-950/30">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-3 rounded-xl font-bold text-rose-400 transition-colors hover:bg-rose-950 hover:text-rose-300"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" aria-hidden />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </aside>
  )
}
