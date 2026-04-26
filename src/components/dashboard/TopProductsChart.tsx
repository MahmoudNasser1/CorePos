"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

type TopProductRow = {
  name?: string
  product_name?: string
  total_sold?: number
  totalSold?: number
  revenue?: number
}

function pickName(item: TopProductRow) {
  return item.name ?? item.product_name ?? "غير معروف"
}

function pickQty(item: TopProductRow) {
  return Number(item.total_sold ?? item.totalSold ?? 0) || 0
}

function pickRevenue(item: TopProductRow) {
  return Number(item.revenue ?? 0) || 0
}

export function TopProductsChart({ data }: { data: any[] }) {
  const raw = Array.isArray(data) ? data : []
  const chartData = raw.slice(0, 5).map((item: TopProductRow, index) => ({
    label: `${index + 1}. ${pickName(item)}`,
    sold: pickQty(item),
    revenue: pickRevenue(item),
  }))

  if (chartData.length === 0) {
    return (
      <Card className="h-full border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">الأكثر مبيعًا</CardTitle>
          <CardDescription>أعلى خمسة أصناف حسب كمية البيع في الفواتير.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="flex h-[240px] items-center justify-center rounded-md border border-dashed bg-muted/30 px-4 text-center text-sm text-muted-foreground"
            role="status"
          >
            لا بيانات كافية لهذه الفترة
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">الأكثر مبيعًا</CardTitle>
        <CardDescription>أعلى خمسة أصناف حسب الكمية المباعة.</CardDescription>
      </CardHeader>
      <CardContent className="h-[260px] pb-4" dir="rtl">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="label"
              type="category"
              axisLine={false}
              tickLine={false}
              width={120}
              tick={{ fontSize: 11 }}
              orientation="right"
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const row = payload[0].payload as { label: string; sold: number; revenue: number }
                return (
                  <div
                    className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md"
                    style={{ direction: "rtl", textAlign: "right" }}
                  >
                    <p className="mb-1 font-semibold leading-snug">{row.label}</p>
                    <p className="tabular-nums text-muted-foreground">
                      الكمية: <span className="font-medium text-foreground">{row.sold.toLocaleString("ar-EG")}</span>
                    </p>
                    <p className="tabular-nums text-muted-foreground">
                      الإيراد: <span className="font-medium text-foreground">{formatCurrency(row.revenue)}</span>
                    </p>
                  </div>
                )
              }}
            />
            <Bar dataKey="sold" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={18} name="الكمية" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
