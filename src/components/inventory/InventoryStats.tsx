import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Package, AlertTriangle, TrendingUp, Layers } from "lucide-react"
import { INVENTORY_LOW_STOCK_THRESHOLD } from "@/lib/inventory-ui"

interface InventoryStatsProps {
  products: any[]
}

export function InventoryStats({ products }: InventoryStatsProps) {
  const totalProducts = products.length
  
  const totalStock = products.reduce((acc, p) => {
    const stock = (p.product_stock || []).reduce((sAcc: number, s: any) => sAcc + (s.current_stock || 0), 0)
    return acc + stock
  }, 0)

  const lowStockCount = products.filter(p => {
    const stock = (p.product_stock || []).reduce((sAcc: number, s: any) => sAcc + (s.current_stock || 0), 0)
    return stock <= INVENTORY_LOW_STOCK_THRESHOLD
  }).length

  const categoriesCount = new Set(products.map(p => p.categories?.name || 'عام')).size

  const stats = [
    {
      label: "إجمالي الأصناف",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "إجمالي المخزون",
      value: totalStock,
      icon: Layers,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      label: "نواقص (مخزون منخفض)",
      value: lowStockCount,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      label: "إجمالي الأقسام",
      value: categoriesCount,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="overflow-hidden border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold tracking-tight">{stat.value.toLocaleString('ar-EG')}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
