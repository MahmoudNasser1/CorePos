"use client"

import { Bell, Search, User, Menu, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/authStore"
import { cn } from "@/lib/utils"

type HeaderProps = {
  onOpenMobileNav?: () => void
  searchComponent?: React.ReactNode
}

export function Header({ onOpenMobileNav, searchComponent }: HeaderProps) {
  const router = useRouter()
  const { profile, user } = useAuthStore()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      useAuthStore.getState().clearAuth()
      router.push("/login")
      router.refresh()
    } catch {
      toast.error("تعذّر تسجيل الخروج. تحقق من الاتصال ثم أعد المحاولة.")
    }
  }

  const isSuperAdmin = (user?.role?.toUpperCase() === 'PLATFORM_ADMIN') || (profile?.role?.toUpperCase() === 'PLATFORM_ADMIN')
  const userName = profile?.full_name || user?.email?.split('@')[0] || "المستخدم"
  
  const roleLabels: Record<string, string> = {
    'platform_admin': "مدير المنصة",
    'owner': "المالك",
    'admin': "مدير",
    'manager': "مشرف",
    'cashier': "كاشير",
    'viewer': "مشاهد",
    'accountant': "محاسب"
  }
  const userRoleLabel = isSuperAdmin ? "مدير المنصة" : (roleLabels[profile?.role?.toLowerCase() || ""] || profile?.role || "موظف")

  return (
    <header className="fixed left-0 top-0 z-40 h-16 w-full border-b bg-background/95 px-4 backdrop-blur print:hidden supports-[backdrop-filter]:bg-background/60 md:px-8 lg:w-[calc(100%-18rem)]">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="فتح قائمة التنقل"
            onClick={() => onOpenMobileNav?.()}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </Button>
          
          {searchComponent || (
            <button
              type="button"
              onClick={() => {
                const isApple =
                  typeof navigator !== "undefined" &&
                  /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent)
                window.dispatchEvent(
                  new KeyboardEvent("keydown", {
                    key: "k",
                    bubbles: true,
                    ...(isApple ? { metaKey: true } : { ctrlKey: true }),
                  }),
                )
              }}
              className="group relative hidden items-center md:flex"
            >
              <Search
                className="pointer-events-none absolute start-3 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden
              />
              <div className="glass flex w-72 items-center justify-between rounded-xl border border-border/50 bg-secondary/40 py-1.5 pe-4 ps-10 text-sm text-muted-foreground transition-all hover:bg-secondary/60">
                <span>ابحث عن أي شيء...</span>
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">Ctrl</span>K
                </kbd>
              </div>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="التنبيهات">
                <Bell className="h-5 w-5" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              <DropdownMenuLabel className="font-bold">التنبيهات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                لا تنبيهات جديدة حاليًا. سيظهر هنا تنبيه المخزون والفوترة عند ربطهما بالنظام.
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="flex items-center gap-2 rounded-full px-2 hover:bg-secondary"
                aria-label="قائمة الحساب"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  {profile?.full_name ? (
                    <span className="text-xs font-bold text-primary">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="h-5 w-5 text-primary" aria-hidden />
                  )}
                </div>
                <div className="hidden flex-col items-start text-xs sm:flex pe-1">
                  <span className="font-bold">{userName}</span>
                  <span className="text-muted-foreground">{userRoleLabel}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href={isSuperAdmin ? "/super-admin/profile" : "/dashboard/profile"} className="cursor-pointer gap-2 flex items-center">
                  <User className="h-4 w-4 opacity-70" />
                  <span>الملف الشخصي</span>
                </Link>
              </DropdownMenuItem>

              {!isSuperAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/company" className="cursor-pointer gap-2 flex items-center">
                      <Search className="h-4 w-4 opacity-70" />
                      <span>إعدادات الشركة</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/subscription" className="cursor-pointer gap-2 flex items-center">
                      <Bell className="h-4 w-4 opacity-70" />
                      <span>الاشتراك</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              {isSuperAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/super-admin/subscriptions" className="cursor-pointer gap-2 flex items-center">
                    <CreditCard className="h-4 w-4 opacity-70" />
                    <span>الاشتراكات العامة</span>
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer" onClick={handleLogout}>
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
