"use client"

import { useReport } from "@/hooks/use-report"
import { getDailyReport } from "@/lib/actions/reports.actions"
import { ReportFilters } from "@/components/reports/ReportFilters"
import { ReportTable } from "@/components/reports/ReportTable"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export default function DailyReportPage() {
  const { data, isLoading, totals, setFilters, exportToExcel } = useReport({
    queryKey: ["daily-report"],
    queryFn: (filters) => getDailyReport(filters),
  })

  const columns = [
    {
      header: "التاريخ",
      accessorKey: "date",
      cell: ({ row }: any) => format(new Date(row.original.date), "PPP", { locale: ar }),
    },
    {
      header: "إجمالي المبيعات",
      accessorKey: "total_sales",
      cell: ({ row }: any) => `${row.original.total_sales.toLocaleString()} ج.م`,
    },
    {
      header: "إجمالي المشتريات",
      accessorKey: "total_purchases",
      cell: ({ row }: any) => `${row.original.total_purchases.toLocaleString()} ج.م`,
    },
    {
      header: "عدد الفواتير",
      accessorKey: "sales_count",
    },
    {
      header: "صافي المبيعات",
      accessorKey: "net_sales",
      cell: ({ row }: any) => `${row.original.net_sales.toLocaleString()} ج.م`,
    },
  ]

  const tableTotals = totals ? [
    { label: "إجمالي المبيعات", value: `${totals.total_sales.toLocaleString()} ج.م` },
    { label: "إجمالي المشتريات", value: `${totals.total_purchases.toLocaleString()} ج.م` },
    { label: "إجمالي الفواتير", value: totals.sales_count },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">التقرير اليومي</h1>
          <p className="text-muted-foreground font-bold">ملخص حركة المبيعات والمشتريات يوم بيوم</p>
        </div>
      </div>

      <ReportFilters 
        onFilter={setFilters} 
        onExport={() => exportToExcel(columns, "التقرير_اليومي")}
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
