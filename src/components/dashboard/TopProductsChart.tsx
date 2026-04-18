"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export function TopProductsChart({ data }: { data: any[] }) {
  // Format data for Recharts
  const chartData = data.map((item) => ({
    name: item.product_name,
    profit: item.total_profit,
    revenue: item.total_revenue,
  }))

  return (
    <Card className="border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">الأصناف الأكثر ربحية</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              fontSize={12}
              width={100}
              className="font-bold"
            />
            <Tooltip
              contentStyle={{
                direction: "rtl",
                textAlign: "right",
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [`${value.toLocaleString()} ج.م`, "الربح"]}
            />
            <Bar
              dataKey="profit"
              radius={[0, 4, 4, 0]}
              barSize={20}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
