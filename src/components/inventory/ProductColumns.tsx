"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteProduct } from "@/lib/actions/inventory.actions"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { INVENTORY_LOW_STOCK_THRESHOLD } from "@/lib/inventory-ui"

export { INVENTORY_LOW_STOCK_THRESHOLD } from "@/lib/inventory-ui"

export interface ProductInventory {
  id: string
  name: string
  barcode: string | null
  price1: number | null
  cost_price: number | null
  categories: { name: string } | null
  product_stock: { branch_id: string, current_stock: number }[] | null
}

function ProductRowActions({ id }: { id: string }) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function onConfirmDelete() {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await deleteProduct(id)
      toast.success("تم حذف المنتج")
      router.refresh()
    } catch (e) {
      console.error(e)
      toast.error("فشل حذف المنتج")
    } finally {
      setIsDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label="فتح قائمة عمليات المنتج"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>العمليات</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/dashboard/inventory/products/${id}/edit`)}>
            <Edit className="me-2 h-4 w-4" aria-hidden="true" />
            تعديل
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash className="me-2 h-4 w-4" aria-hidden="true" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onConfirmDelete}
        title="تأكيد حذف المنتج"
        description="سيتم حذف المنتج ولن يظهر في القوائم. المتابعة؟"
        confirmText={isDeleting ? "جاري الحذف..." : "حذف"}
        cancelText="إلغاء"
        variant="destructive"
      />
    </>
  )
}

export const productColumns: ColumnDef<ProductInventory>[] = [
  {
    accessorKey: "name",
    header: "المنتج",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.barcode || "بدون باركود"}</span>
      </div>
    )
  },
  {
    accessorKey: "categories.name",
    header: "الفئة",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.categories?.name || "عام"}
      </Badge>
    )
  },
  {
    accessorKey: "cost_price",
    header: "التكلفة",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.cost_price || 0)}</span>
    )
  },
  {
    accessorKey: "price1",
    header: "سعر البيع",
    cell: ({ row }) => (
      <span className="font-bold text-primary tabular-nums">
        {formatCurrency(row.original.price1 || 0)}
      </span>
    )
  },
  {
    id: "stock",
    header: "المخزون",
    cell: ({ row }) => {
      const stocks = row.original.product_stock || []
      const totalStock = stocks.reduce((acc, curr) => acc + (curr.current_stock || 0), 0)

      return (
        <Badge
          variant={totalStock <= INVENTORY_LOW_STOCK_THRESHOLD ? "destructive" : "secondary"}
          className="tabular-nums"
        >
          {totalStock} قطعة
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <ProductRowActions id={row.original.id} />
    },
  },
]
