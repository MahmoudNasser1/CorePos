import { getCategories } from "@/lib/actions/inventory.actions"
import { CategoriesView, type CategoryItem } from "./CategoriesView"

export default async function CategoriesPage() {
  const categories = (await getCategories()) as CategoryItem[]

  return (
    <div className="p-6">
      <CategoriesView initialCategories={categories} />
    </div>
  )
}
