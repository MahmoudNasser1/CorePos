"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { format, parseISO, isValid } from "date-fns"
import { ar } from "date-fns/locale"

interface SalesChartProps {
  data: any[]
}

export function SalesChart({ data }: SalesChartProps) {
  const raw = Array.isArray(data) ? data : []
  const chartData = raw.map((item) => {
    const d = item.date ? parseISO(String(item.date)) : null
    return {
      date: d && isValid(d) ? format(d, "EEE d", { locale: ar }) : "؟",
      sales: Number(item.total_sales) || 0,
    }
  })

  const hasRevenue = chartData.some((d) => d.sales > 0)
  const crowded = chartData.length > 5

  if (raw.length === 0 || !hasRevenue) {
    return (
      <div
        className="flex h-[280px] w-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground"
        role="status"
      >
        <p className="font-medium text-foreground">لا إيرادات في الفترة المختارة</p>
        <p className="max-w-sm text-muted-foreground">جرّب توسيع نطاق التاريخ من تقارير المبيعات عند الحاجة.</p>
      </div>
    )
  }

  return (
    <div className="h-[280px] w-full pt-2" dir="rtl">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: crowded ? 24 : 8 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
            angle={crowded ? -35 : 0}
            textAnchor={crowded ? "end" : "middle"}
            height={crowded ? 48 : 32}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            orientation="right"
            width={44}
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => (typeof value === "number" ? value.toLocaleString("ar-EG") : String(value))}
            label={{ value: "ج.م", angle: -90, position: "insideRight", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 8px 16px rgb(0 0 0 / 0.08)",
              direction: "rtl",
            }}
            formatter={(value: number) => [`${value.toLocaleString("ar-EG")} ج.م`, "المبيعات"]}
            labelFormatter={(label) => `يوم ${label}`}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSales)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
