"use client"

import { TrendingUp, Wallet, ShoppingCart, AlertTriangle, Receipt } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface KPI {
  title: string
  value: string
  change?: string
  icon: React.ComponentType<{ className?: string }>
}

export function KPIGrid({
  initialData,
  statsFailed = false,
}: {
  initialData: any
  statsFailed?: boolean
}) {
  const displayData = {
    todaySales: initialData?.todaySales ?? 0,
    salesChange: initialData?.salesChange ?? "0.0",
    salesCount: initialData?.salesCount ?? 0,
    treasuryBalance: initialData?.treasuryBalance ?? 0,
    lowStockCount: initialData?.lowStockCount ?? 0,
  }

  const changeNum = parseFloat(String(displayData.salesChange).replace(/[^\d.-]/g, "")) || 0
  const trendPositive = changeNum >= 0
  const rawChange = String(initialData?.salesChange ?? "").trim()
  const showSalesTrend = rawChange !== "" && rawChange !== "0.0" && rawChange !== "0"

  const kpis: KPI[] = [
    {
      title: "مبيعات اليوم",
      value: formatCurrency(Number(displayData.todaySales)),
      change: showSalesTrend ? `${Math.abs(changeNum).toFixed(1)}٪ مقارنة بأمس` : undefined,
      icon: ShoppingCart,
    },
    {
      title: "فواتير اليوم",
      value: String(displayData.salesCount),
      icon: Receipt,
    },
    {
      title: "رصيد الخزينة",
      value: formatCurrency(Number(displayData.treasuryBalance)),
      icon: Wallet,
    },
    {
      title: "أصناف دون الحد الأدنى",
      value: String(displayData.lowStockCount),
      icon: AlertTriangle,
    },
  ]

  if (statsFailed) {
    return (
      <Alert variant="destructive" className="border-destructive/50">
        <AlertTitle>تعذّر تحميل المؤشرات</AlertTitle>
        <AlertDescription>أعد تحميل الصفحة. إذا تكرّر الأمر، تحقق من الاتصال أو صلاحيات الحساب.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.title}
          className="flex h-full min-h-[112px] flex-col border bg-card shadow-sm transition-shadow hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent className="mt-auto flex flex-1 flex-col justify-end pt-0">
            <div className="text-2xl font-bold tabular-nums tracking-tight">{kpi.value}</div>
            {kpi.change && (
              <div
                className={cn(
                  "mt-2 flex items-center gap-1 text-xs font-medium tabular-nums",
                  trendPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                )}
              >
                <TrendingUp className={cn("h-3 w-3", !trendPositive && "rotate-180")} aria-hidden />
                <span>{kpi.change}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
