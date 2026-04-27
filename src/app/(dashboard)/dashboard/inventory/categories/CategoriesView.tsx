"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/DataTable"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { deleteManyCategories, saveCategory } from "@/lib/actions/inventory.actions"
import { Plus, LayoutGrid, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export interface CategoryItem {
  id: string
  name: string
  sort_order: number
}

export function CategoriesView({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<CategoryItem | null>(null)
  const [name, setName] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  // Move columns inside to access setEditingCategory and setOpen
  const columns = React.useMemo<ColumnDef<CategoryItem>[]>(() => [
    {
      accessorKey: "name",
      header: "اسم الفئة",
      cell: ({ getValue }) => <span className="font-medium">{String(getValue() ?? "")}</span>,
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
      cell: ({ row }) => {
        const cat = row.original
        return (
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" type="button" aria-label="فتح عمليات الفئة">
                <MoreHorizontal className="h-4 w-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>العمليات</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => {
                  setEditingCategory(cat)
                  setName(cat.name)
                  setOpen(true)
                }}
              >
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={async () => {
                  if (confirm(`هل أنت متأكد من حذف فئة "${cat.name}"؟`)) {
                    try {
                      await deleteManyCategories([cat.id])
                      toast.success("تم حذف الفئة")
                      router.refresh()
                    } catch (err: any) {
                      toast.error(err?.message || "تعذّر حذف الفئة")
                    }
                  }
                }}
              >
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [router])

  async function handleAction(e: React.FormEvent) {
    e.preventDefault()
    const t = name.trim()
    if (t.length < 2) {
      toast.error("الاسم يجب أن يكون حرفين على الأقل")
      return
    }
    setSaving(true)
    try {
      await saveCategory({ 
        id: editingCategory?.id,
        name: t 
      })
      toast.success(editingCategory ? "تم تحديث الفئة" : "تمت إضافة الفئة")
      handleClose()
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("تعذّر حفظ الفئة")
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setEditingCategory(null)
    setName("")
  }

  return (
    <div className="flex flex-col gap-6">
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

        <Dialog open={open} onOpenChange={(val) => {
          if (!val) handleClose()
          else setOpen(true)
        }}>
          <DialogTrigger asChild>
            <Button type="button" className="gap-2">
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              إضافة فئة
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="sm:max-w-md">
            <form onSubmit={handleAction}>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "تعديل الفئة" : "فئة جديدة"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-4">
                <label className="text-sm font-medium" htmlFor="cat-name">
                  اسم الفئة
                </label>
                <Input
                  id="cat-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: ألبان ومشروبات"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "…" : "حفظ"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns} // Use the local columns
        data={initialCategories}
        searchKey="name"
        placeholder="ابحث عن فئة…"
        enableRowSelection
        getRowId={(c) => c.id}
        onBulkDelete={async (ids) => {
          try {
            await deleteManyCategories(ids)
            toast.success(`تم حذف ${ids.length} فئة`)
            router.refresh()
          } catch (err: any) {
            console.error(err)
            toast.error(err?.message || "تعذّر حذف بعض الفئات")
            throw err
          }
        }}
        bulkDeleteLabel="حذف الفئات المحددة"
        emptyState={{
          title: "لا توجد فئات بعد.",
          description: "أضف فئات لتنظيم المنتجات عند ربطها بأسعار المخزون.",
        }}
      />
    </div>
  )
}
