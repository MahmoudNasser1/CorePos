"use client"

import { useReportLegacy as useReport } from "@/hooks/use-report-legacy"
import { getSupplierBalances } from "@/lib/actions/reports.actions"
import { ReportFilters } from "@/components/reports/ReportFilters"
import { ReportTable } from "@/components/reports/ReportTable"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export default function SupplierBalancesPage() {
  const { data, isLoading, totals, setFilters, exportToExcel, isExporting } = useReport({
    queryKey: ["supplier-balances"],
    queryFn: () => getSupplierBalances(),
  })

  const columns = [
    {
      header: "اسم المورد",
      accessorKey: "name",
      cell: ({ row }: any) => <span className="font-black">{row.original.name}</span>,
    },
    {
      header: "رقم الهاتف",
      accessorKey: "phone",
    },
    {
      header: "الرصيد الحالي",
      accessorKey: "balance",
      cell: ({ row }: any) => {
        const balance = row.original.balance
        const isDebt = balance < 0
        return (
          <span className={isDebt ? "text-destructive font-black" : "text-green-600 font-black"}>
            {Math.abs(balance).toLocaleString()} ج.م 
            {isDebt ? " (لينا عنده)" : " (علينا ليه)"}
          </span>
        )
      },
    },
    {
      header: "آخر تحديث",
      accessorKey: "updated_at",
      cell: ({ row }: any) => format(new Date(row.original.updated_at), "PPP", { locale: ar }),
    },
  ]

  const tableTotals = totals ? [
    { 
      label: "إجمالي أرصدة الموردين", 
      value: `${Math.abs(totals.balance).toLocaleString()} ج.م`,
      className: totals.balance < 0 ? "text-destructive" : "text-green-600"
    },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">أرصدة الموردين</h1>
        <p className="text-muted-foreground font-bold">كشف بمديونيات وأرصدة الموردين المستحقة</p>
      </div>

      <ReportFilters 
        onFilter={setFilters} 
        onExport={() => exportToExcel(columns, "أرصدة_الموردين")}
        exportLoading={isExporting}
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
