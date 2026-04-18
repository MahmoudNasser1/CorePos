import { getCategories, getUnits } from "@/lib/actions/inventory.actions"
import { ProductForm } from "@/components/inventory/ProductForm"

export default async function NewProductPage() {
  const [categories, units] = await Promise.all([
    getCategories(),
    getUnits()
  ])

  return (
    <div className="p-6">
      <ProductForm 
        categories={categories} 
        units={units}
      />
    </div>
  )
}
