"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/shared/DataTable"
import { Button } from "@/components/ui/button"
import { Plus, Ruler } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { inventoryApi } from "@/lib/api/inventory"

interface UnitItem {
  id: string
  name: string
  short_name: string | null
}

const unitColumns: ColumnDef<UnitItem>[] = [
  {
    accessorKey: "name",
    header: "اسم الوحدة",
    cell: ({ getValue }) => <span className="font-medium">{String(getValue() ?? "")}</span>
  },
  {
    accessorKey: "short_name",
    header: "الاسم المختصر",
  },
  {
    id: "actions",
    cell: () => {
      return (
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="فتح عمليات الوحدة">
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

export default function UnitsPage() {
  const [units, setUnits] = useState<UnitItem[]>([])

  useEffect(() => {
    let mounted = true
    inventoryApi.getUnits().then((res: any) => {
      if (!mounted) return
      setUnits(
        (res || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          short_name: (u.short_name ?? u.shortName ?? u.symbol ?? null) as string | null,
        })),
      )
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <div className="flex flex-col gap-6 p-6">
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
        
        <Button type="button" className="gap-2" disabled title="يتم ربط نموذج إضافة الوحدة لاحقاً">
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          إضافة وحدة
        </Button>
      </div>

      <DataTable
        columns={unitColumns}
        data={units}
        searchKey="name"
        placeholder="ابحث عن وحدة…"
        emptyState={{
          title: "لا توجد وحدات قياس بعد.",
          description: "تُستخدم الوحدات في تعريف المنتجات وسيتم ربط الإضافة لاحقاً.",
        }}
      />
    </div>
  )
}
