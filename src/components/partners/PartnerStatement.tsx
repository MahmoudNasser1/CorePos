"use client"

import { DataTable } from "@/components/shared/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export interface StatementEntry {
  id: string
  created_at: string
  type: 'invoice' | 'payment'
  description: string
  debit: number  // مبلغ عليه
  credit: number // مبلغ له
  balance: number // الرصيد التراكمي
}

const columns: ColumnDef<StatementEntry>[] = [
  {
    accessorKey: "created_at",
    header: "التاريخ",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">
        {format(new Date(row.original.created_at), "PPP", { locale: ar })}
      </span>
    )
  },
  {
    accessorKey: "description",
    header: "البيان / الحركة",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold">{row.original.description}</span>
        <span className="text-[10px] text-muted-foreground uppercase">{row.original.type}</span>
      </div>
    )
  },
  {
    accessorKey: "debit",
    header: "مدين (عليه)",
    cell: ({ row }) => row.original.debit > 0 ? (
      <CurrencyDisplay amount={row.original.debit} className="text-red-500 font-normal" />
    ) : "---"
  },
  {
    accessorKey: "credit",
    header: "دائن (له)",
    cell: ({ row }) => row.original.credit > 0 ? (
      <CurrencyDisplay amount={row.original.credit} className="text-green-600 font-normal" />
    ) : "---"
  },
  {
    accessorKey: "balance",
    header: "الرصيد التراكمي",
    cell: ({ row }) => (
      <CurrencyDisplay 
        amount={Math.abs(row.original.balance)} 
        className={row.original.balance > 0 ? "text-red-600 font-black" : "text-green-700 font-black"} 
      />
    )
  }
]

export function PartnerStatement({ data }: { data: StatementEntry[] }) {
  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchPlaceholder="البحث في الحركات..."
    />
  )
}
