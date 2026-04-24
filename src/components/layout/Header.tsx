"use client"

import { Bell, Search, User, Menu } from "lucide-react"
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
import { toast } from "sonner"

type HeaderProps = {
  onOpenMobileNav?: () => void
}

export function Header({ onOpenMobileNav }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      router.push("/login")
      router.refresh()
    } catch {
      toast.error("تعذّر تسجيل الخروج. تحقق من الاتصال ثم أعد المحاولة.")
    }
  }

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
                  <User className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div className="hidden flex-col items-start text-xs sm:flex pe-1">
                  <span className="font-bold">محمود</span>
                  <span className="text-muted-foreground">مدير النظام</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <span>إعدادات الشركة</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <span>الاشتراك</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive" onClick={handleLogout}>
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
