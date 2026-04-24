import { getInventoryProducts } from "@/lib/actions/inventory.actions"
import { ProductsTableWithFilter } from "@/components/inventory/ProductsTableWithFilter"
import type { ProductInventory } from "@/components/inventory/ProductColumns"
import { Button } from "@/components/ui/button"
import { Plus, Package } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  const products = (await getInventoryProducts().catch((e) => {
    console.error('Failed to fetch products:', e)
    return []
  })) as unknown as ProductInventory[]


  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Package className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">إدارة المنتجات</h1>
            <p className="text-muted-foreground text-sm">إضافة وتعديل ومراقبة المنتجات والمخزون</p>
          </div>
        </div>
        
        <Button asChild className="gap-2">
          <Link href="/dashboard/inventory/products/new" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            إضافة منتج
          </Link>
        </Button>
      </div>

      <div className="w-full">
        <ProductsTableWithFilter products={products} />
      </div>
    </div>
  )
}
