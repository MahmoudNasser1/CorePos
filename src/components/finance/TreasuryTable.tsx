"use client"

import { DataTable } from "@/components/shared/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface TreasuryTransaction {
  id: string
  created_at: string
  amount: number
  type: 'in' | 'out'
  notes: string
  reference_type: string
  profiles: { full_name: string } | null
}

const columns: ColumnDef<TreasuryTransaction>[] = [
  {
    accessorKey: "created_at",
    header: "التاريخ والوقت",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {format(new Date(row.original.created_at), "PPP", { locale: ar })}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {format(new Date(row.original.created_at), "p", { locale: ar })}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: "amount",
    header: "المبلغ",
    cell: ({ row }) => (
      <CurrencyDisplay 
        amount={row.original.amount} 
        className={cn(
          "text-lg",
          row.original.type === 'in' ? "text-green-600" : "text-red-500"
        )} 
      />
    )
  },
  {
    accessorKey: "type",
    header: "النوع",
    cell: ({ row }) => (
      <Badge variant={row.original.type === 'in' ? "default" : "destructive"} className="font-bold">
        {row.original.type === 'in' ? "توريد نقدي" : "صرف نقدي"}
      </Badge>
    )
  },
  {
    accessorKey: "reference_type",
    header: "المصدر",
    cell: ({ row }) => (
      <div className="text-sm font-medium">
        {row.original.reference_type === 'sale_invoice' && "فاتورة مبيعات"}
        {row.original.reference_type === 'purchase_invoice' && "فاتورة مشتريات"}
        {row.original.reference_type === 'expense' && "مصروفات"}
        {row.original.reference_type === 'manual' && "تسوية يدوية"}
        {row.original.reference_type === 'payment' && "سند قبض/صرف"}
      </div>
    )
  },
  {
    accessorKey: "notes",
    header: "البيان / الملاحظات",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-muted-foreground text-sm" title={row.original.notes}>
        {row.original.notes || "---"}
      </div>
    )
  },
  {
    accessorKey: "balance_after",
    header: "الرصيد بعدها",
    cell: ({ row }) => (
      <CurrencyDisplay 
        amount={row.original.balance_after || 0} 
        className="font-bold text-slate-500" 
      />
    )
  },
  {
    accessorKey: "profiles.full_name",
    header: "الموظف",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.profiles?.full_name || "---"}
      </div>
    )
  }
]

export function TreasuryTable({ data }: { data: TreasuryTransaction[] }) {
  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchPlaceholder="البحث في العمليات..."
    />
  )
}
