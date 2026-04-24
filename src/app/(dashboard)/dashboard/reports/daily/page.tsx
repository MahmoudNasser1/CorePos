"use client"

import { useReportLegacy as useReport } from "@/hooks/use-report-legacy"
import { getDailyReport } from "@/lib/actions/reports.actions"
import { ReportFilters } from "@/components/reports/ReportFilters"
import { ReportTable } from "@/components/reports/ReportTable"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, ShoppingCart, FileSpreadsheet } from "lucide-react"

export default function DailyReportPage() {
  const { data, isLoading, totals, setFilters, exportToExcel, isExporting } = useReport({
    queryKey: ["daily-report"],
    queryFn: (filters) => getDailyReport(filters),
  })

  const columns = [
    {
      header: "التاريخ",
      accessorKey: "date",
      align: "right" as const,
      cell: ({ row }: any) => format(new Date(row.original.date), "PPP", { locale: ar }),
    },
    {
      header: "إجمالي المبيعات",
      accessorKey: "total_sales",
      align: "right" as const,
      cell: ({ row }: any) => `${row.original.total_sales.toLocaleString()} ج.م`,
    },
    {
      header: "إجمالي المشتريات",
      accessorKey: "total_purchases",
      align: "right" as const,
      cell: ({ row }: any) => `${row.original.total_purchases.toLocaleString()} ج.م`,
    },
    {
      header: "عدد الفواتير",
      accessorKey: "sales_count",
      align: "right" as const,
    },
    {
      header: "صافي المبيعات",
      accessorKey: "net_sales",
      align: "right" as const,
      cell: ({ row }: any) => `${row.original.net_sales.toLocaleString()} ج.م`,
    },
  ]

  const tableTotals = totals
    ? [
        { label: "إجمالي المبيعات", value: `${totals.total_sales.toLocaleString()} ج.م` },
        { label: "إجمالي المشتريات", value: `${totals.total_purchases.toLocaleString()} ج.م` },
        { label: "إجمالي الفواتير", value: totals.sales_count },
      ]
    : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">التقرير اليومي</h1>

      <ReportFilters
        onFilter={setFilters}
        onExport={() => exportToExcel(columns, "التقرير_اليومي")}
        showBranch
        exportLoading={isExporting}
      />

      {!isLoading && totals && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="rounded-xl border bg-card/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{totals.total_sales.toLocaleString()} ج.م</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border bg-card/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المشتريات</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{totals.total_purchases.toLocaleString()} ج.م</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border bg-card/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">عدد فواتير المبيعات</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{totals.sales_count}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <ReportTable columns={columns} data={data || []} isLoading={isLoading} totals={tableTotals} />
    </div>
  )
}
