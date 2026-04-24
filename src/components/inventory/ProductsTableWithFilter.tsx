"use client"

import * as React from "react"
import { DataTable } from "@/components/shared/DataTable"
import { productColumns, type ProductInventory } from "@/components/inventory/ProductColumns"
import { INVENTORY_LOW_STOCK_THRESHOLD } from "@/lib/inventory-ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
function totalStock(p: ProductInventory) {
  return (p.product_stock || []).reduce((acc, curr) => acc + (curr.current_stock || 0), 0)
}

export function ProductsTableWithFilter({ products }: { products: ProductInventory[] }) {
  const [category, setCategory] = React.useState("all")
  const [stock, setStock] = React.useState<"all" | "low" | "ok">("all")

  const categoryOptions = React.useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      const n = p.categories?.name || "عام"
      set.add(n)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"))
  }, [products])

  const filtered = React.useMemo(() => {
    return products.filter((p) => {
      const catName = p.categories?.name || "عام"
      if (category !== "all" && catName !== category) return false
      const t = totalStock(p)
      if (stock === "low" && t > INVENTORY_LOW_STOCK_THRESHOLD) return false
      if (stock === "ok" && t <= INVENTORY_LOW_STOCK_THRESHOLD) return false
      return true
    })
  }, [products, category, stock])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[11rem] flex-1 space-y-1">
          <span className="text-xs font-medium text-muted-foreground">الفئة</span>
          <Select dir="rtl" value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="تصفية حسب الفئة">
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفئات</SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[11rem] flex-1 space-y-1">
          <span className="text-xs font-medium text-muted-foreground">حالة المخزون</span>
          <Select dir="rtl" value={stock} onValueChange={(v) => setStock(v as "all" | "low" | "ok")}>
            <SelectTrigger aria-label="تصفية حسب المخزون">
              <SelectValue placeholder="المخزون" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="low">
                منخفض (حتى {INVENTORY_LOW_STOCK_THRESHOLD} قطعة)
              </SelectItem>
              <SelectItem value="ok">كافٍ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={productColumns}
        data={filtered}
        searchKey="name"
        placeholder="ابحث بالاسم أو الباركود"
        emptyState={{
          title: "لا توجد منتجات بعد. ابدأ بإضافة أول صنف.",
          description:
            products.length > 0
              ? "جرّب تغيير البحث أو الفلاتر لعرض نتائج أخرى."
              : "لم يُحمّل أي منتج بعد، أو القائمة فارغة.",
          ctaHref: "/dashboard/inventory/products/new",
          ctaLabel: "إضافة منتج",
        }}
      />
    </div>
  )
}
