"use client"

import { Bell, Search, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function Header() {
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 w-full lg:w-[calc(100%-18rem)] left-0 z-40 px-4 md:px-8">
      <div className="h-full flex items-center justify-between">
        {/* Left Side: Page Info/Search */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="relative hidden md:flex items-center">
            <Search className="absolute right-3 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="ابحث عن فاتورة أو منتج..." 
              className="bg-secondary/50 border-none rounded-full pr-10 pl-4 py-1.5 text-sm focus:ring-1 focus:ring-primary w-64 transition-all"
            />
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-[10px]">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              <DropdownMenuLabel className="font-bold">التنبيهات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-2">
                {[1, 2, 3].map((i) => (
                  <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                    <span className="font-semibold text-sm">مخزون منخفض: آيفون 15</span>
                    <span className="text-xs text-muted-foreground">بقي قطعتين فقط في الفرع الرئيسي</span>
                    <span className="text-[10px] text-primary mt-1">منذ ساعتين</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary font-medium p-2">
                عرض كل التنبيهات
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-secondary rounded-full">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="hidden sm:flex flex-col items-start text-xs pr-1">
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
              <DropdownMenuItem className="gap-2 text-destructive">
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
