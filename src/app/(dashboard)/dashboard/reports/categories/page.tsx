"use client"

import { useState } from "react"
import { useReport } from "@/hooks/use-report"
import { createClient } from "@/lib/supabase/client"
import { ReportFilters } from "@/components/reports/ReportFilters"
import { ReportTable } from "@/components/reports/ReportTable"

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
       const supabase = createClient()
       // Fallback logic inside fetch since RPC might fail if missing logic in backend
       const { data, error } = await (supabase as any).rpc('get_sales_by_category', {
          p_from_date: f.fromDate?.toISOString(),
          p_to_date: f.toDate?.toISOString()
       })
       if (!error && data) {
          return data
       } 
       
       // Fallback to raw query if RPC not present
       let query = supabase
        .from('v_invoice_items')
        .select('category_name, total')

       if (f.fromDate) query = query.gte('created_at', f.fromDate.toISOString())
       if (f.toDate) query = query.lte('created_at', f.toDate.toISOString())

       const res = await query
       const items = res.data || []
       
       // Group locally
       const grouped = items.reduce((acc: any, item: any) => {
           const cat = item.category_name || "بدون فئة"
           if (!acc[cat]) acc[cat] = { category_name: cat, total_sales: 0, items_sold: 0 }
           acc[cat].total_sales += Number(item.total || 0)
           acc[cat].items_sold += 1
           return acc
       }, {})

       return Object.values(grouped)
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
