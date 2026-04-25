import { getCategories, getUnits } from "@/lib/actions/inventory.actions"
import { inventoryApi } from "@/lib/api/inventory"
import { ProductForm } from "@/components/inventory/ProductForm"

type IdNameRow = { id: string; name: string }

export const dynamic = "force-dynamic"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [categories, units, product] = (await Promise.all([
    getCategories(),
    getUnits(),
    inventoryApi.getProduct(id).catch(() => null),
  ])) as unknown as [IdNameRow[], IdNameRow[], any]

  if (!product) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">المنتج غير موجود</div>
      </div>
    )
  }

  const initialData = {
    id: product.id,
    name: product.name ?? "",
    barcode: product.barcode ?? "",
    category_id: product.categoryId ?? "",
    unit_id: product.unitId ?? "",
    cost_price: Number(product.costPrice ?? 0),
    price1: Number(product.price1 ?? 0),
    price2: Number(product.price2 ?? 0),
    price3: Number(product.price3 ?? 0),
    min_qty: Number(product.minQty ?? 0),
    initial_stock: 0,
    image_url: String(product.imageUrl ?? ""),
  }

  return (
    <div className="p-6">
      <ProductForm initialData={initialData} categories={categories} units={units} />
    </div>
  )
}

