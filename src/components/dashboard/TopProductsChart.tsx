"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export function TopProductsChart({ data }: { data: any[] }) {
  const raw = Array.isArray(data) ? data : []
  const chartData = raw.slice(0, 5).map((item, index) => ({
    name: `${index + 1}. ${item.product_name || "غير معروف"}`,
    profit: Number(item.total_profit) || 0,
  }))

  if (chartData.length === 0) {
    return (
      <Card className="h-full border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">أكثر الأصناف ربحًا</CardTitle>
          <CardDescription>تصنيف حسب الربح المسجّل في الفترة الأخيرة.</CardDescription>
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
        <CardTitle className="text-base font-semibold">أكثر الأصناف ربحًا</CardTitle>
        <CardDescription>أعلى خمسة أصناف حسب الربح.</CardDescription>
      </CardHeader>
      <CardContent className="h-[260px] pb-4" dir="rtl">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              width={120}
              tick={{ fontSize: 11 }}
              orientation="right"
            />
            <Tooltip
              contentStyle={{
                direction: "rtl",
                textAlign: "right",
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 8px 16px rgb(0 0 0 / 0.08)",
              }}
              formatter={(value: number) => [formatCurrency(value), "الربح"]}
            />
            <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
