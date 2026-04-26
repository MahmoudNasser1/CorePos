"use client"

import { useEffect, useMemo, useState } from "react"
import { usePOSStore } from "@/stores/posStore"
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data"
import { getPOSProducts } from "@/lib/actions/pos.actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Tag, Package } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency } from "@/lib/utils"
import type { Product } from "@/types/pos.types"

function maxStock(p: Product): number | null {
  const raw: unknown = p.stock
  if (raw === null || raw === undefined || raw === "") return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function isProductAvailable(product: Product) {
  if (product.is_active === false) return false
  const m = maxStock(product)
  if (m !== null && m <= 0) return false
  return true
}

function HighlightName({ name, query }: { name: string; query: string }) {
  const q = query.trim().toLowerCase()
  if (!q) return <>{name}</>
  const lower = name.toLowerCase()
  const idx = lower.indexOf(q)
  if (idx === -1) return <>{name}</>
  return (
    <>
      {name.slice(0, idx)}
      <mark className="rounded-sm bg-primary/25 px-0.5 text-inherit dark:bg-primary/30">
        {name.slice(idx, idx + q.length)}
      </mark>
      {name.slice(idx + q.length)}
    </>
  )
}

export function POSProductGrid() {
  const { addItem, priceList } = usePOSStore()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS as any)
  const [categories, setCategories] = useState<any[]>(MOCK_CATEGORIES as any)
  const [gridLoading, setGridLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setGridLoading(true)
      try {
        const list = await getPOSProducts()
        if (!mounted) return
        if (Array.isArray(list) && list.length > 0) {
          setProducts(list as any)

          const unique = new Map<string, any>()
          for (const p of list as any[]) {
            const catId = p?.category?.id ?? p?.category_id ?? p?.categoryId
            const catName = p?.category?.name
            if (catId && !unique.has(String(catId))) {
              unique.set(String(catId), { id: String(catId), name: catName ?? "تصنيف" })
            }
          }
          if (unique.size > 0) setCategories(Array.from(unique.values()))
        }
      } finally {
        if (mounted) setGridLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const filteredProducts = useMemo(
    () =>
      products.filter((product: any) => {
        const matchesSearch =
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.barcode?.includes(search)
        const catId = product?.category_id ?? product?.categoryId ?? product?.category?.id
        const matchesCategory = !selectedCategory || String(catId) === String(selectedCategory)
        return matchesSearch && matchesCategory
      }),
    [products, search, selectedCategory],
  )

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 border-b bg-slate-50/50 p-4 dark:bg-slate-900/50">
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="ابحث بالاسم أو الباركود"
            className="h-11 bg-white ps-10 text-base shadow-sm focus-visible:ring-primary dark:bg-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="ابحث بالاسم أو الباركود"
          />
        </div>

        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="h-8 rounded-full"
          >
            الكل
          </Button>
          {categories.map((category: any) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="h-8 gap-2 whitespace-nowrap rounded-full"
            >
              <Tag className="h-3 w-3 shrink-0" aria-hidden />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {gridLoading ? (
          <div
            className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            aria-busy="true"
            aria-live="polite"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex h-[160px] sm:h-[180px] flex-col overflow-hidden rounded-xl border bg-white dark:bg-slate-800">
                <Skeleton className="h-24 w-full rounded-none" />
                <div className="flex flex-1 flex-col justify-between gap-2 p-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-muted-foreground">
            <Search className="mb-2 h-10 w-10 opacity-20" aria-hidden />
            <p className="text-sm">لا توجد نتائج مطابقة لبحثك</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 pb-safe">
            {filteredProducts.map((product: Product) => {
              const p1 = Number(product.price1 ?? product.price_1 ?? product.sales_price ?? 0)
              const p2 = Number(product.price2 ?? product.price_2 ?? p1)
              const p3 = Number(product.price3 ?? product.price_3 ?? p1)
              const price = priceList === 1 ? p1 : priceList === 2 ? p2 : p3
              const available = isProductAvailable(product)

              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={!available}
                  onClick={() => available && addItem(product)}
                  className={cn(
                    "group relative flex h-[160px] sm:h-[180px] flex-col overflow-hidden rounded-xl border bg-white text-right transition-all dark:bg-slate-800",
                    available
                      ? "hover:border-primary/50 hover:shadow-md active:scale-[0.98]"
                      : "cursor-not-allowed opacity-60",
                  )}
                >
                  <div className="relative h-24 overflow-hidden bg-slate-100 dark:bg-slate-700">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt=""
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full min-h-[6rem] items-center justify-center">
                        <Package className="h-8 w-8 text-slate-300 dark:text-slate-500" aria-hidden />
                      </div>
                    )}
                    <div className="absolute end-1 top-1 flex flex-wrap justify-end gap-1">
                      <Badge className="h-5 border-none bg-white/90 px-1.5 py-0 text-[10px] text-slate-900 shadow-sm dark:bg-slate-900/90 dark:text-white">
                        {product.sku ?? product.code ?? product.id}
                      </Badge>
                      {!available && (
                        <Badge variant="secondary" className="h-5 bg-destructive/90 text-[10px] text-destructive-foreground">
                          غير متوفر
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-2">
                    <h3 className="line-clamp-2 text-sm font-bold leading-tight transition-colors group-hover:text-primary">
                      <HighlightName name={product.name} query={search} />
                    </h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-black tabular-nums text-primary">{formatCurrency(price)}</span>
                      {available && maxStock(product) != null && (
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          متبقي {maxStock(product)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
