"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Wallet, Package, ShoppingCart, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"

interface KPI {
  title: string
  value: string | number
  change?: string
  icon: any
  color: string
  meshClass?: string
}

export function KPIGrid({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const { profile } = useAuthStore()

  useEffect(() => {
    // For now, we rely on initialData and manual refreshes
    return () => {
    }
  }, [profile?.company_id])

  const displayData = {
    todaySales: data?.todaySales || 0,
    salesChange: data?.salesChange || "0.0",
    profit: data?.profit || 0,
    profitChange: data?.profitChange || "0.0",
    salesCount: data?.salesCount || 0,
    treasuryBalance: data?.treasuryBalance || 0,
    lowStockCount: data?.lowStockCount || 0,
  }

  const kpis: KPI[] = [
    {
      title: "مبيعات اليوم",
      value: `${displayData.todaySales.toLocaleString()} ج.م`,
      change: `${displayData.salesChange}%`,
      icon: ShoppingCart,
      color: "text-indigo-600 dark:text-indigo-400",
      meshClass: "mesh-gradient-indigo"
    },
    {
      title: "أرباح اليوم",
      value: `${displayData.profit.toLocaleString()} ج.م`,
      change: `${displayData.profitChange}%`,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      meshClass: "mesh-gradient-emerald"
    },
    {
      title: "فواتير اليوم",
      value: displayData.salesCount,
      icon: ShoppingCart,
      color: "text-rose-600 dark:text-rose-400",
      meshClass: "mesh-gradient-rose"
    },
    {
      title: "رصيد الخزينة",
      value: `${displayData.treasuryBalance.toLocaleString()} ج.م`,
      icon: Wallet,
      color: "text-amber-600 dark:text-amber-400",
      meshClass: "mesh-gradient-amber"
    },
    {
      title: "أصناف منخفضة",
      value: displayData.lowStockCount,
      icon: AlertTriangle,
      color: "text-cyan-600 dark:text-cyan-400",
      meshClass: "mesh-gradient-cyan"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 animate-fade-up">
      {kpis.map((kpi, idx) => (
        <Card 
          key={kpi.title} 
          className={cn(
            "group relative overflow-hidden border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl glass",
            kpi.meshClass
          )}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-xs font-black text-muted-foreground/80 uppercase tracking-wider">{kpi.title}</CardTitle>
            <div className={cn("p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 shadow-sm transition-colors group-hover:scale-110 duration-300")}>
              <kpi.icon className={cn("w-5 h-5", kpi.color)} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              {kpi.value}
            </div>
            {kpi.change && (
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-black mt-2 px-2 py-0.5 rounded-full w-fit",
                kpi.change.startsWith('-') 
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" 
                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              )}>
                {kpi.change.startsWith('-') ? (
                  <TrendingUp className="w-3 h-3 rotate-180" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                <span>
                  {Math.abs(parseFloat(kpi.change))}% 
                  <span className="opacity-70 font-bold mr-1 italic">vs أمس</span>
                </span>
              </div>
            )}
          </CardContent>
          
          {/* Decorative Background Element */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        </Card>
      ))}
    </div>
  )
}
