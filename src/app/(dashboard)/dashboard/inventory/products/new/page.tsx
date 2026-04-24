import { getCategories, getUnits } from "@/lib/actions/inventory.actions"
import { ProductForm } from "@/components/inventory/ProductForm"

type IdNameRow = { id: string; name: string }

export default async function NewProductPage() {
  const [categories, units] = (await Promise.all([
    getCategories(),
    getUnits()
  ])) as unknown as [IdNameRow[], IdNameRow[]]

  return (
    <div className="p-6">
      <ProductForm 
        categories={categories} 
        units={units}
      />
    </div>
  )
}
