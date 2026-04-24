"use client"

import { useReportLegacy as useReport } from "@/hooks/use-report-legacy"
import { getTreasuryMovement } from "@/lib/actions/reports.actions"
import { ReportFilters } from "@/components/reports/ReportFilters"
import { ReportTable } from "@/components/reports/ReportTable"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export default function TreasuryMovementPage() {
  const { data, isLoading, totals, setFilters, exportToExcel } = useReport({
    queryKey: ["treasury-movement"],
    queryFn: (filters) => getTreasuryMovement(filters),
  })

  const columns = [
    {
      header: "التاريخ والوقت",
      accessorKey: "created_at",
      cell: ({ row }: any) => format(new Date(row.original.created_at), "PPP p", { locale: ar }),
    },
    {
      header: "النوع",
      accessorKey: "type",
      cell: ({ row }: any) => (
        <Badge variant={row.original.type === "in" ? "default" : "destructive"}>
          {row.original.type === "in" ? "وارد" : "صادر"}
        </Badge>
      ),
    },
    {
      header: "المبلغ",
      accessorKey: "amount",
      cell: ({ row }: any) => (
        <span className={row.original.type === "in" ? "text-green-600 font-black" : "text-destructive font-black"}>
          {row.original.amount.toLocaleString()} ج.م
        </span>
      ),
    },
    {
      header: "البيان / الوصف",
      accessorKey: "note",
    },
    {
      header: "الموظف",
      accessorKey: "profiles.full_name",
      cell: ({ row }: any) => row.original.profiles?.full_name || "النظام",
    },
  ]

  const tableTotals = totals ? [
    { label: "إجمالي الوارد", value: `${totals.amount_in.toLocaleString()} ج.م`, className: "text-green-600" },
    { label: "إجمالي الصادر", value: `${totals.amount_out.toLocaleString()} ج.م`, className: "text-destructive" },
    { label: "صافي الحركة", value: `${(totals.amount_in - totals.amount_out).toLocaleString()} ج.م` },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">حركة الخزينة</h1>
        <p className="text-muted-foreground font-bold">تتبع كل عمليات الإيداع والسحب من الخزينة</p>
      </div>

      <ReportFilters 
        onFilter={setFilters} 
        onExport={() => exportToExcel(columns, "حركة_الخزينة")}
      />

      <ReportTable 
        columns={columns} 
        data={data || []} 
        isLoading={isLoading}
        totals={tableTotals}
      />
    </div>
  )
}
