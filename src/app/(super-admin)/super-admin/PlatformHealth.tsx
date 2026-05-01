"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, ShieldCheck, Database, HardDrive, Plus, Megaphone, Settings } from "lucide-react"

export function PlatformHealth() {
  const healthItems = [
    { name: "API Gateway", status: "online", icon: Activity },
    { name: "Database", status: "online", icon: Database },
    { name: "Auth Service", status: "online", icon: ShieldCheck },
    { name: "Storage", status: "warning", icon: HardDrive, detail: "82%" },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-12" dir="rtl">
      <Card className="md:col-span-8 border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            مركز التحكم السريع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button variant="secondary" className="flex flex-col h-24 gap-2 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all group">
              <Plus className="h-6 w-6 text-blue-400 group-hover:scale-125 transition-transform" />
              <span className="text-xs font-bold">إضافة شركة</span>
            </Button>
            <Button variant="secondary" className="flex flex-col h-24 gap-2 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all group">
              <Megaphone className="h-6 w-6 text-indigo-400 group-hover:scale-125 transition-transform" />
              <span className="text-xs font-bold">بث إعلان</span>
            </Button>
            <Button variant="secondary" className="flex flex-col h-24 gap-2 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all group">
              <ShieldCheck className="h-6 w-6 text-emerald-400 group-hover:scale-125 transition-transform" />
              <span className="text-xs font-bold">إدارة الأدوار</span>
            </Button>
            <Button variant="secondary" className="flex flex-col h-24 gap-2 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-rose-300 transition-all group">
              <Activity className="h-6 w-6 text-rose-400 group-hover:scale-125 transition-transform" />
              <span className="text-xs font-bold">وضع الصيانة</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-4 border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            صحة المنصة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {healthItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.detail && <span className="text-xs text-muted-foreground">{item.detail}</span>}
                <Badge 
                  variant={item.status === 'online' ? 'secondary' : 'outline'}
                  className={item.status === 'online' ? 'bg-emerald-500/10 text-emerald-600 border-none' : 'bg-amber-500/10 text-amber-600 border-none'}
                >
                  {item.status === 'online' ? 'يعمل' : 'تنبيه'}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
