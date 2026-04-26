import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCategories, getUnits } from "@/lib/actions/inventory.actions"
import { CategoriesView, type CategoryItem } from "@/app/(dashboard)/dashboard/inventory/categories/CategoriesView"
import { UnitsView, type UnitItem } from "@/app/(dashboard)/dashboard/inventory/units/UnitsView"

export default async function VariablesSettingsPage() {
  const [rawCategories, rawUnits] = await Promise.all([getCategories().catch(() => []), getUnits().catch(() => [])])

  const initialCategories: CategoryItem[] = (Array.isArray(rawCategories) ? rawCategories : []).map((c: any) => ({
    id: c.id,
    name: c.name,
    sort_order: c.sort_order ?? c.sortOrder ?? 0,
  }))

  const initialUnits: UnitItem[] = (Array.isArray(rawUnits) ? rawUnits : []).map((u: any) => ({
    id: u.id,
    name: u.name,
    short_name: u.nameEn ?? u.name_en ?? null,
  }))

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">المتغيرات</h1>
        <p className="text-sm text-muted-foreground">
          تحكم مركزي في القيم المرجعية اللي بتظهر في أكثر من مكان (مثل فئات المنتجات ووحدات القياس).
        </p>
      </div>

      <Tabs defaultValue="categories" dir="rtl" className="w-full">
        <TabsList className="grid h-10 w-full grid-cols-2 bg-muted/60 p-1">
          <TabsTrigger value="categories" className="text-xs font-medium">
            الفئات
          </TabsTrigger>
          <TabsTrigger value="units" className="text-xs font-medium">
            وحدات القياس
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="pt-4">
          <CategoriesView initialCategories={initialCategories} />
        </TabsContent>

        <TabsContent value="units" className="pt-4">
          <UnitsView initialUnits={initialUnits} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

