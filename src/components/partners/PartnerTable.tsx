"use client"

import { DataTable } from "@/components/shared/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, User, Phone, MapPin, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export interface Partner {
  id: string
  name: string
  phone: string | null
  address: string | null
  balance: number
  type: 'customer' | 'supplier'
}

const columns: ColumnDef<Partner>[] = [
  {
    accessorKey: "name",
    header: "الاسم",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="font-bold">{row.original.name}</span>
      </div>
    )
  },
  {
    accessorKey: "phone",
    header: "رقم الهاتف",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Phone className="w-3 h-3" />
        <span>{row.original.phone || "---"}</span>
      </div>
    )
  },
  {
    accessorKey: "balance",
    header: "الرصيد",
    cell: ({ row }) => {
      const balance = row.original.balance
      return (
        <div className="flex items-center gap-2">
           <CurrencyDisplay 
            amount={Math.abs(balance)} 
            className={balance > 0 ? "text-red-500" : balance < 0 ? "text-green-600" : "text-muted-foreground"} 
          />
          <Badge variant="outline" className="text-[10px]">
             {balance > 0 ? "عليه" : balance < 0 ? "له" : "متزن"}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: "address",
    header: "العنوان",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-[200px] truncate">
        <MapPin className="w-3 h-3 shrink-0" />
        <span>{row.original.address || "---"}</span>
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const partner = row.original
      const typePath = partner.type === 'customer' ? 'customers' : 'suppliers'
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>العمليات</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/${typePath}/${partner.id}`}>
                <Eye className="ml-2 h-4 w-4" /> عرض كشف الحساب
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>تعديل البيانات</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">حذف</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

export function PartnerTable({ data }: { data: Partner[] }) {
  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchPlaceholder="البحث بالاسم أو رقم الهاتف..."
    />
  )
}
