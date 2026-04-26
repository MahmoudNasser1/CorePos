"use client"

import { usePOSStore } from "@/stores/posStore"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { Pause, RotateCcw, ArrowRight, Moon, Sun, History } from "lucide-react"
import Link from "next/link"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

export function POSHeader() {
  const { heldCarts, holdCart, clearCart, resumeCart } = usePOSStore()
  const { profile } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b flex items-center justify-between px-2 sm:px-4 shadow-sm z-50 gap-2">
      {/* Right Side: Back & Info (RTL) */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Button variant="ghost" size="icon" asChild aria-label="العودة إلى لوحة التحكم" className="shrink-0">
          <Link href="/dashboard">
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </Button>
        <div className="flex flex-col min-w-0">
          <h1 className="text-base sm:text-lg font-bold leading-tight text-primary truncate">نقطة البيع</h1>
          <div className="hidden sm:flex flex-wrap items-center gap-1 sm:gap-2">
            <Badge variant="secondary" className="py-0 text-[10px] font-medium">
              جلسة بيع
            </Badge>
            <span className="text-xs text-muted-foreground truncate">{profile?.full_name || "—"}</span>
            <span className="hidden text-[10px] text-muted-foreground lg:inline" title="البحث الشامل في النظام">
              اختصار: Ctrl+K
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="relative gap-1 sm:gap-2 px-2 sm:px-4" title="فواتير معلقة">
              <History className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">فواتير معلقة</span>
              {heldCarts.length > 0 && (
                <span className="absolute -top-1 end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-0.5 text-[10px] text-white">
                  {heldCarts.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            {heldCarts.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">لا توجد فواتير معلقة</div>
            ) : (
              heldCarts.map((cart) => (
                <DropdownMenuItem 
                  key={cart.id} 
                  onClick={() => resumeCart(cart.id)}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <span className="tabular-nums">{new Date(cart.createdAt).toLocaleTimeString("ar-EG")}</span>
                  <Badge variant="secondary">{cart.items.length} صنف</Badge>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={holdCart} className="gap-1 sm:gap-2 px-2 sm:px-3 border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-950/20" title="تعليق سريع">
          <Pause className="h-4 w-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">تعليق سريع</span>
        </Button>

        <Button variant="outline" size="sm" onClick={clearCart} className="gap-1 sm:gap-2 px-2 sm:px-3 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20" title="تصفير السلة">
          <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">تصفير السلة</span>
        </Button>
      </div>

      {/* Left Side: Stats/Time */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="hidden md:flex flex-col items-end">
          {mounted ? (
            <>
              <span className="text-sm font-medium">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              <span className="tabular-nums text-xs text-muted-foreground">
                {new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </>
          ) : (
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          )}
        </div>
        <div className="h-8 w-px bg-border ms-2 me-2 md:ms-2 md:me-0" />
        <Button variant="ghost" size="icon" className="relative rounded-full shrink-0" type="button" aria-label="تبديل الوضع الفاتح أو الداكن">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden />
        </Button>
      </div>
    </header>
  )
}
