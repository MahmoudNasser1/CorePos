"use client"

import { useReport } from "@/hooks/use-report"
import { getStockReport } from "@/lib/actions/reports.actions"
import { ReportFilters } from "@/components/reports/ReportFilters"
import { ReportTable } from "@/components/reports/ReportTable"
import { Badge } from "@/components/ui/badge"

export default function StockReportPage() {
  const { data, isLoading, totals, setFilters, exportToExcel } = useReport({
    queryKey: ["stock-report"],
    queryFn: (filters) => getStockReport(filters),
  })

  const columns = [
    {
      header: "اسم الصنف",
      accessorKey: "name",
      cell: ({ row }: any) => <span className="font-black">{row.original.name}</span>,
    },
    {
      header: "الباركود",
      accessorKey: "barcode",
    },
    {
      header: "المخزن",
      accessorKey: "warehouse_name",
    },
    {
      header: "الكمية الحالية",
      accessorKey: "qty",
      cell: ({ row }: any) => (
        <span className={row.original.low_stock ? "text-destructive font-black" : "font-black"}>
          {row.original.qty} {row.original.unit_name}
        </span>
      ),
    },
    {
      header: "قيمة المخزون",
      accessorKey: "stock_value",
      cell: ({ row }: any) => `${row.original.stock_value.toLocaleString()} ج.م`,
    },
    {
      header: "الحالة",
      accessorKey: "low_stock",
      cell: ({ row }: any) => (
        <Badge variant={row.original.low_stock ? "destructive" : "secondary"}>
          {row.original.low_stock ? "نقص مخزون" : "متوفر"}
        </Badge>
      ),
    },
  ]

  const tableTotals = totals ? [
    { label: "إجمالي الكمية", value: totals.qty },
    { label: "إجمالي قيمة المخزون", value: `${totals.stock_value.toLocaleString()} ج.م` },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">تقرير المخزون</h1>
        <p className="text-muted-foreground font-bold">جرد ومتابعة كميات وأصناف المستودعات</p>
      </div>

      <ReportFilters 
        onFilter={setFilters} 
        onExport={() => exportToExcel(columns, "تقرير_المخزون")}
        showWarehouseFilter
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
