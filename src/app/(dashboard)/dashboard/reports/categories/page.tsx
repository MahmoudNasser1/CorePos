"use client"

import { useState } from "react"
import { useReport } from "@/hooks/use-report"
import { ReportFilters } from "@/components/reports/ReportFilters"
import { ReportTable } from "@/components/reports/ReportTable"
import { reportsApi } from "@/lib/api/reports"

export default function SalesByCategoryPage() {
  const [filters, setFilters] = useState<any>({
      fromDate: null,
      toDate: null,
  })

  const columns = [
    {
      header: "الفئة",
      key: "category_name",
      accessorKey: "category_name",
      cell: ({ row }: any) => <span className="font-black">{row.original.category_name || "بدون فئة"}</span>,
    },
    {
      header: "عدد القطع المباعة",
      key: "items_sold",
      accessorKey: "items_sold",
    },
    {
      header: "إجمالي المبيعات",
      key: "total_sales",
      accessorKey: "total_sales",
      cell: ({ row }: any) => `${row.original.total_sales?.toLocaleString() || 0} ج.م`,
    },
    {
      header: "نسبة من المبيعات",
      key: "sales_percentage",
      accessorKey: "sales_percentage",
      cell: ({ row }: any) => `${row.original.sales_percentage?.toFixed(1) || 0}%`,
    },
  ]

  const { data, isLoading, exportData } = useReport({
    reportType: "sales-by-category",
    filters,
    fetchFn: async (f: any) => {
       const res: any = await reportsApi.getSalesByCategory({
         from: f.fromDate?.toISOString(),
         to: f.toDate?.toISOString(),
       })
       return (res as any) || []
    },
    columns: columns.map(col => ({ key: col.key || (col.accessorKey as string), label: col.header })),
    exportFileName: "مبيعات_الفئات"
  })

  // Calculate totals locally after fetching
  const totals = { total_sales: data.reduce((acc: any, r: any) => acc + (r.total_sales || 0), 0) }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">المبيعات حسب الفئات</h1>
        <p className="text-muted-foreground font-bold">تحليل الأصناف الأكثر مبيعاً حسب الفئة</p>
      </div>

      <ReportFilters 
        onFilter={setFilters} 
        onExport={exportData}
      />

      <ReportTable 
        columns={columns} 
        data={data || []} 
        isLoading={isLoading}
        totals={[{ label: "إجمالي المبيعات", value: `${totals.total_sales.toLocaleString()} ج.م` }]}
      />
    </div>
  )
}
