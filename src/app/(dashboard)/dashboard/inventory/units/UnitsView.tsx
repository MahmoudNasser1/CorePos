"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { saveUnit, deleteManyUnits } from "@/lib/actions/inventory.actions"
import { Plus, Ruler, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export interface UnitItem {
  id: string
  name: string
  short_name: string | null
}

const unitColumns: ColumnDef<UnitItem>[] = [
  {
    accessorKey: "name",
    header: "اسم الوحدة",
    cell: ({ getValue }) => <span className="font-medium">{String(getValue() ?? "")}</span>,
  },
  {
    accessorKey: "short_name",
    header: "الاسم المختصر / English",
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" type="button" aria-label="فتح عمليات الوحدة">
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>العمليات</DropdownMenuLabel>
          <DropdownMenuItem disabled>تعديل (قريباً)</DropdownMenuItem>
          <DropdownMenuItem disabled>حذف منفرد (قريباً)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function UnitsView({ initialUnits }: { initialUnits: UnitItem[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [shortName, setShortName] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const t = name.trim()
    if (t.length < 1) {
      toast.error("اسم الوحدة مطلوب")
      return
    }
    setSaving(true)
    try {
      await saveUnit({ name: t, short_name: shortName.trim() || undefined })
      toast.success("تمت إضافة الوحدة")
      setName("")
      setShortName("")
      setOpen(false)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("تعذّر حفظ الوحدة")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Ruler className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">وحدات القياس</h1>
            <p className="text-muted-foreground text-sm">إدارة الوحدات التي تباع بها المنتجات</p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" className="gap-2">
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              إضافة وحدة
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="sm:max-w-md">
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle>وحدة قياس جديدة</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="unit-name">
                    الاسم (عربي)
                  </label>
                  <Input
                    id="unit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: كرتون"
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="unit-en">
                    الاسم المختصر (English) — اختياري
                  </label>
                  <Input
                    id="unit-en"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="e.g. carton"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
        columns={unitColumns}
        data={initialUnits}
        searchKey="name"
        placeholder="ابحث عن وحدة…"
        enableRowSelection
        getRowId={(u) => u.id}
        onBulkDelete={async (ids) => {
          try {
            await deleteManyUnits(ids)
            toast.success(`تم حذف ${ids.length} وحدة`)
            router.refresh()
          } catch (err) {
            console.error(err)
            toast.error("تعذّر حذف الوحدات")
            throw err
          }
        }}
        bulkDeleteLabel="حذف الوحدات المحددة"
        emptyState={{
          title: "لا توجد وحدات قياس بعد.",
          description: "أضف وحدات مثل قطعة، كيلو، كرتون واستخدمها عند إنشاء المنتجات.",
        }}
      />
    </div>
  )
}
