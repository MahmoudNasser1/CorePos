"use client"

import { useEffect, useMemo, useState } from "react"
import { usePOSStore } from "@/stores/posStore"
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data"
import { getPOSProducts } from "@/lib/actions/pos.actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Grid, List, Tag } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function POSProductGrid() {
  const { addItem, priceList } = usePOSStore()
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS as any)
  const [categories, setCategories] = useState<any[]>(MOCK_CATEGORIES as any)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const list = await getPOSProducts()
      if (!mounted) return
      if (Array.isArray(list) && list.length > 0) {
        setProducts(list as any)

        // Best-effort categories (backend includes category relation sometimes)
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
    })()
    return () => {
      mounted = false
    }
  }, [])

  const filteredProducts = useMemo(() => products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.barcode?.includes(search)
    const catId = product?.category_id ?? product?.categoryId ?? product?.category?.id
    const matchesCategory = !selectedCategory || String(catId) === String(selectedCategory)
    return matchesSearch && matchesCategory
  }), [products, search, selectedCategory])

  return (
    <div className="flex flex-col h-full">
      {/* Search & Categories Bar */}
      <div className="p-4 border-b space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="بحث بالاسم أو الباركود... (F1)"
            className="pr-10 bg-white dark:bg-slate-800 h-11 text-base shadow-sm focus-visible:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="rounded-full h-8"
          >
            الكل
          </Button>
          {categories.map((category: any) => (
            <Button 
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full h-8 whitespace-nowrap gap-2"
            >
              <Tag className="h-3 w-3" />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <ScrollArea className="flex-1 p-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Search className="h-10 w-10 mb-2 opacity-20" />
            <p>لا توجد نتائج مطابقة لبحثك</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filteredProducts.map((product) => {
              const p1 = Number(product.price1 ?? product.price_1 ?? product.sales_price ?? 0)
              const p2 = Number(product.price2 ?? product.price_2 ?? p1)
              const p3 = Number(product.price3 ?? product.price_3 ?? p1)
              const price = priceList === 1 ? p1 : priceList === 2 ? p2 : p3
              
              return (
                <button
                  key={product.id}
                  onClick={() => addItem(product)}
                  className={cn(
                    "group relative flex flex-col bg-white dark:bg-slate-800 border rounded-xl overflow-hidden text-right transition-all hover:shadow-md hover:border-primary/50 active:scale-[0.98]",
                    "h-[180px]"
                  )}
                >
                  {/* Product Image */}
                  <div className="h-24 bg-slate-100 dark:bg-slate-700 overflow-hidden relative">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Grid className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute top-1 right-1">
                      <Badge className="bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white border-none shadow-sm text-[10px] py-0 px-1.5 h-5">
                        {product.sku ?? product.code ?? product.id}
                      </Badge>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-primary font-black text-sm tabular-nums">
                        {price?.toLocaleString()} ج
                      </span>
                      {product.min_qty && (
                        <span className="text-[10px] text-muted-foreground">
                          متاح
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
