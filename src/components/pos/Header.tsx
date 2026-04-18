"use client"

import { usePOSStore } from "@/stores/posStore"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"
import { 
  Pause, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  User, 
  LayoutDashboard,
  Moon,
  Sun
} from "lucide-react"
import Link from "next/link"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function POSHeader() {
  const { heldCarts, holdCart, clearCart, resumeCart } = usePOSStore()
  const { profile } = useAuthStore()

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b flex items-center justify-between px-4 shadow-sm z-50">
      {/* Right Side: Back & Info (RTL) */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild title="لوحة التحكم">
          <Link href="/dashboard">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-primary leading-tight">🛒 نقطة البيع</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] py-0">الشيفت #125</Badge>
            <span className="text-xs text-muted-foreground">{profile?.full_name || "محاسب 1"}</span>
          </div>
        </div>
      </div>

      {/* Middle: Actions */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="relative gap-2">
              <Pause className="h-4 w-4" />
              فواتير معلقة
              {heldCarts.length > 0 && (
                <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
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
                  <span>{new Date(cart.createdAt).toLocaleTimeString('ar-EG')}</span>
                  <Badge variant="secondary">{cart.items.length} صنف</Badge>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={holdCart} className="gap-2 text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20">
          <Pause className="h-4 w-4" />
          تعليق (Hold)
        </Button>

        <Button variant="outline" size="sm" onClick={clearCart} className="gap-2 text-red-600 border-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-950/20">
          <RotateCcw className="h-4 w-4" />
          تصفير
        </Button>
      </div>

      {/* Left Side: Stats/Time */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-medium">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <span className="text-xs text-muted-foreground tabular-nums">02:45 PM</span>
        </div>
        <div className="h-8 w-px bg-border mx-2" />
        <Button variant="ghost" size="icon" className="rounded-full">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}
