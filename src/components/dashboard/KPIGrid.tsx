"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Wallet, Package, ShoppingCart, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"

interface KPI {
  title: string
  value: string | number
  change?: string
  icon: any
  color: string
}

export function KPIGrid({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData)
  const supabase = createClient()
  const { profile } = useAuthStore()

  useEffect(() => {
    // 1. Subscribe to treasury balance changes
    const channel = supabase
      .channel('treasury_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'treasuries' },
        (payload) => {
          if (payload.new.is_default && (!profile?.company_id || payload.new.company_id === profile.company_id)) {
            setData((prev: any) => ({
              ...prev,
              treasuryBalance: payload.new.balance
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, profile?.company_id])

  const kpis: KPI[] = [
    {
      title: "مبيعات اليوم",
      value: `${data.todaySales.toLocaleString()} ج.م`,
      change: `${data.salesChange}%`,
      icon: ShoppingCart,
      color: "text-primary"
    },
    {
      title: "أرباح اليوم",
      value: `${data.profit.toLocaleString()} ج.م`,
      change: `${data.profitChange}%`,
      icon: TrendingUp,
      color: "text-accent"
    },
    {
      title: "فواتير اليوم",
      value: data.salesCount,
      icon: ShoppingCart,
      color: "text-blue-500"
    },
    {
      title: "رصيد الخزينة",
      value: `${data.treasuryBalance.toLocaleString()} ج.م`,
      icon: Wallet,
      color: "text-green-600"
    },
    {
      title: "أصناف منخفضة",
      value: data.lowStockCount,
      icon: AlertTriangle,
      color: "text-destructive"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="hover:shadow-md transition-all border-none shadow-sm relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold text-muted-foreground">{kpi.title}</CardTitle>
            <div className={cn("p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors")}>
              <kpi.icon className={cn("w-4 h-4", kpi.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight">{kpi.value}</div>
            {kpi.change && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold mt-1",
                kpi.change.startsWith('-') ? "text-destructive" : "text-emerald-500"
              )}>
                {kpi.change.startsWith('-') ? (
                  <TrendingUp className="w-3 h-3 rotate-180" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                <span>
                  {Math.abs(parseFloat(kpi.change))}% 
                  <span className="text-muted-foreground font-normal mr-1">مقارنة بأمس</span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
