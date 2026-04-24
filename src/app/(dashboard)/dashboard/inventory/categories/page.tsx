import { getCategories } from "@/lib/actions/inventory.actions"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { Plus, LayoutGrid } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CategoryItem {
  id: string
  name: string
  sort_order: number | null
}

const categoryColumns: ColumnDef<CategoryItem>[] = [
  {
    accessorKey: "name",
    header: "اسم الفئة",
    cell: ({ getValue }) => <span className="font-medium">{String(getValue() ?? "")}</span>
  },
  {
    accessorKey: "sort_order",
    header: "الترتيب",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{String(getValue() ?? "—")}</span>
    ),
  },
  {
    id: "actions",
    cell: () => {
      return (
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="فتح عمليات الفئة">
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>العمليات</DropdownMenuLabel>
            <DropdownMenuItem>
              <Edit className="h-4 w-4" aria-hidden />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash className="h-4 w-4" aria-hidden />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default async function CategoriesPage() {
  const categories = (await getCategories()) as CategoryItem[]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <LayoutGrid className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">إدارة الفئات</h1>
            <p className="text-muted-foreground text-sm">تنظيم المنتجات في فئات لتسهيل الوصول إليها</p>
          </div>
        </div>
        
        <Button type="button" className="gap-2" disabled title="يتم ربط نموذج إضافة الفئة لاحقاً">
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          إضافة فئة
        </Button>
      </div>

      <DataTable
        columns={categoryColumns}
        data={categories}
        searchKey="name"
        placeholder="ابحث عن فئة…"
        emptyState={{
          title: "لا توجد فئات بعد.",
          description: "أضف فئات لتنظيم المنتجات عند تفعيل نموذج الإضافة.",
        }}
      />
    </div>
  )
}
