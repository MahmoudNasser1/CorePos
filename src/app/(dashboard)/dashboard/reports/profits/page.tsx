"use client"

import { useReport } from "@/hooks/use-report"
import { getProfitReport } from "@/lib/actions/reports.actions"
import { ReportFilters } from "@/components/reports/ReportFilters"
import { ReportTable } from "@/components/reports/ReportTable"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export default function ProfitsReportPage() {
  const { data, isLoading, totals, setFilters, exportToExcel } = useReport({
    queryKey: ["profits-report"],
    queryFn: (filters) => getProfitReport(filters),
  })

  const columns = [
    {
      header: "رقم الفاتورة",
      accessorKey: "invoice_number",
      cell: ({ row }: any) => <span className="font-black">{row.original.invoice_number}</span>,
    },
    {
      header: "التاريخ",
      accessorKey: "created_at",
      cell: ({ row }: any) => format(new Date(row.original.created_at), "PPP p", { locale: ar }),
    },
    {
      header: "إجمالي البيع",
      accessorKey: "total_sales",
      cell: ({ row }: any) => `${row.original.total_sales.toLocaleString()} ج.م`,
    },
    {
      header: "إجمالي التكلفة",
      accessorKey: "total_cost",
      cell: ({ row }: any) => `${row.original.total_cost.toLocaleString()} ج.م`,
    },
    {
      header: "مجمل الربح",
      accessorKey: "gross_profit",
      cell: ({ row }: any) => (
        <span className="text-green-600 font-black">
          {row.original.gross_profit.toLocaleString()} ج.م
        </span>
      ),
    },
    {
      header: "نسبة الربح",
      accessorKey: "profit_margin",
      cell: ({ row }: any) => `${row.original.profit_margin.toFixed(1)}%`,
    },
  ]

  const tableTotals = totals ? [
    { label: "إجمالي المبيعات", value: `${totals.total_sales.toLocaleString()} ج.م` },
    { label: "إجمالي التكلفة", value: `${totals.total_cost.toLocaleString()} ج.م` },
    { label: "إجمالي الأرباح", value: `${totals.gross_profit.toLocaleString()} ج.م`, className: "text-green-600" },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">تقرير الأرباح</h1>
        <p className="text-muted-foreground font-bold">تحليل الربحية على مستوى الفواتير</p>
      </div>

      <ReportFilters 
        onFilter={setFilters} 
        onExport={() => exportToExcel(columns, "تقرير_الأرباح")}
        showBranchFilter
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
