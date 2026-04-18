"use client"

import { useState, useEffect } from "react"
import { getLowStockAlerts } from "@/lib/actions/inventory.actions"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ArrowRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export function StockAlertsWidget() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuthStore()

  useEffect(() => {
    async function load() {
      if (!profile?.company_id) return
      try {
        const data = await getLowStockAlerts(profile.company_id)
        setAlerts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile?.company_id])

  if (loading) return <Skeleton className="h-[300px] w-full" />
  if (alerts.length === 0) return null

  return (
    <Card className="border-orange-200 dark:border-orange-900/50 bg-orange-50/30 dark:bg-orange-950/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <AlertTriangle className="h-4 w-4" />
          تنبيهات المخزون المنخفض
        </CardTitle>
        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
          {alerts.length} منتجات
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-3">
            {alerts.slice(0, 3).map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm bg-white dark:bg-slate-900/50 p-2 rounded-lg border border-orange-100 dark:border-orange-900/30">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Package className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-bold line-clamp-1">{alert.products.name}</p>
                    <p className="text-[10px] text-muted-foreground">{alert.branches.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-orange-600 tabular-nums">
                    {alert.current_stock} / {alert.products.min_qty}
                  </p>
                  <p className="text-[10px] text-muted-foreground">المتبقي</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button asChild variant="ghost" className="w-full text-xs gap-2 text-orange-700 hover:text-orange-800 hover:bg-orange-100">
            <Link href="/dashboard/inventory">
              عرض كل النواقص
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
