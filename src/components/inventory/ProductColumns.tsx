"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ProductInventory {
  id: string
  name: string
  barcode: string | null
  price1: number | null
  cost_price: number | null
  categories: { name: string } | null
  product_stock: { branch_id: string, current_stock: number }[] | null
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
      <span>{formatCurrency(row.original.cost_price || 0)}</span>
    )
  },
  {
    accessorKey: "price1",
    header: "سعر البيع",
    cell: ({ row }) => (
      <span className="font-bold text-primary">
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
        <Badge variant={totalStock <= 5 ? "destructive" : "secondary"}>
          {totalStock} قطعة
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>العمليات</DropdownMenuLabel>
            <DropdownMenuItem>
              <Edit className="ml-2 h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash className="ml-2 h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
