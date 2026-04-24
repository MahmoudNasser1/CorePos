"use client"

import { DataTable } from "@/components/shared/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export interface TreasuryTransaction {
  id: string
  created_at: string
  amount: number
  type: "in" | "out"
  notes: string
  reference_type: string
  profiles: { full_name: string } | null
  balance_after?: number
}

function referenceLabel(referenceType: string): string {
  switch (referenceType) {
    case "sale_invoice":
      return "فاتورة مبيعات"
    case "purchase_invoice":
      return "فاتورة مشتريات"
    case "expense":
      return "مصروف"
    case "manual":
      return "تسوية يدوية"
    case "payment":
      return "سند قبض/صرف"
    default:
      return referenceType || "—"
  }
}

const columns: ColumnDef<TreasuryTransaction>[] = [
  {
    accessorKey: "created_at",
    id: "created_at",
    header: "التاريخ والوقت",
    cell: ({ row }) => (
      <div className="flex flex-col text-start">
        <span className="font-medium">
          {format(new Date(row.original.created_at), "PPP", { locale: ar })}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {format(new Date(row.original.created_at), "p", { locale: ar })}
        </span>
      </div>
    ),
  },
  {
    id: "notes",
    accessorKey: "notes",
    header: "البيان",
    cell: ({ row }) => (
      <div
        className="max-w-[280px] truncate text-sm text-muted-foreground"
        title={row.original.notes || undefined}
      >
        {row.original.notes || "—"}
      </div>
    ),
  },
  {
    id: "debit",
    header: () => (
      <span className="text-start">
        وارد <span className="text-xs font-normal text-muted-foreground">(للخزينة)</span>
      </span>
    ),
    cell: ({ row }) =>
      row.original.type === "in" ? (
        <CurrencyDisplay amount={row.original.amount} className="text-foreground" />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "credit",
    header: () => (
      <span className="text-start">
        صادر <span className="text-xs font-normal text-muted-foreground">(من الخزينة)</span>
      </span>
    ),
    cell: ({ row }) =>
      row.original.type === "out" ? (
        <CurrencyDisplay amount={row.original.amount} className="text-foreground" />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "balance_after",
    header: "الرصيد بعدها",
    cell: ({ row }) => (
      <CurrencyDisplay amount={row.original.balance_after || 0} className="font-semibold text-muted-foreground" />
    ),
  },
  {
    accessorKey: "reference_type",
    header: "المصدر",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal">
        {referenceLabel(row.original.reference_type)}
      </Badge>
    ),
  },
  {
    accessorKey: "profiles.full_name",
    header: "المستخدم",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.profiles?.full_name || "—"}</div>
    ),
  },
]

export function TreasuryTable({ data }: { data: TreasuryTransaction[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="notes"
      placeholder="بحث في البيان أو الملاحظات…"
      showToolbar
      emptyState={{
        title: "لا حركات في الفترة",
        description: "جرّب تغيير نطاق التاريخ أو انتظر تسجيل عمليات جديدة.",
      }}
    />
  )
}
