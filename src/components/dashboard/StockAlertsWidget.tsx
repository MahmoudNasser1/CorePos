"use client"

import { useState, useEffect } from "react"
import { getLowStockAlerts } from "@/lib/actions/inventory.actions"
import { useAuthStore } from "@/stores/authStore"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ChevronLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export function StockAlertsWidget() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuthStore()

  useEffect(() => {
    async function load() {
      if (!profile?.company_id) {
        setLoading(false)
        return
      }
      try {
        const data = await getLowStockAlerts(profile.company_id)
        setAlerts(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setAlerts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile?.company_id])

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground" role="status">
        <Package className="h-8 w-8 text-amber-600/70" aria-hidden />
        <p className="font-medium text-foreground">لا نواقص مسجّلة حاليًا</p>
        <p>عند انخفاض صنف عن الحد الأدنى سيظهر هنا.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <span>تنبيه مخزون</span>
        </div>
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          {alerts.length} صنف
        </Badge>
      </div>

      <ul className="space-y-2">
        {alerts.slice(0, 5).map((alert, idx) => {
          if (!alert?.products) return null
          return (
            <li
              key={`${alert.products?.id ?? idx}-${idx}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-amber-200/80 bg-amber-50/40 px-3 py-2 text-sm dark:border-amber-900/50 dark:bg-amber-950/20"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{alert.products.name || "صنف"}</p>
                <p className="text-xs text-muted-foreground">{alert.branches?.name || "فرع"}</p>
              </div>
              <p className="shrink-0 text-xs font-medium tabular-nums text-amber-900 dark:text-amber-100">
                {alert.current_stock ?? 0} / {alert.products.min_qty ?? 0}
              </p>
            </li>
          )
        })}
      </ul>

      <Button variant="outline" size="sm" className="w-full gap-1 border-amber-200 font-medium text-amber-900 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-100 dark:hover:bg-amber-950/40" asChild>
        <Link href="/dashboard/inventory/products">
          عرض المنتجات
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </div>
  )
}
