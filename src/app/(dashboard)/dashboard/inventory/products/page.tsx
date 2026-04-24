import { getInventoryProducts } from "@/lib/actions/inventory.actions"
import { DataTable } from "@/components/shared/DataTable"
import { productColumns } from "@/components/inventory/ProductColumns"
import type { ProductInventory } from "@/components/inventory/ProductColumns"
import { Button } from "@/components/ui/button"
import { Plus, Package } from "lucide-react"
import Link from "next/link"

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
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">إدارة المنتجات</h1>
            <p className="text-muted-foreground text-sm">إضافة وتعديل ومراقبة المنتجات والمخزون</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/dashboard/inventory/products/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة منتج
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="w-full">
        <DataTable 
          columns={productColumns} 
          data={products} 
          searchKey="name"
          placeholder="ابحث عن منتج بالاسم أو الباركود..."
        />
      </div>
    </div>
  )
}
