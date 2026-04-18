"use client"

import { useReport } from "@/hooks/use-report"
import { createClient } from "@/lib/supabase/client"
import { ReportFilters } from "@/components/reports/ReportFilters"
import { ReportTable } from "@/components/reports/ReportTable"
import { useQuery } from "@tanstack/react-query"

export default function SalesByCategoryPage() {
  const { filters, setFilters, exportToExcel } = useReport({
    queryKey: ["sales-by-category"],
    queryFn: async (filters) => {
      const supabase = createClient()
      let query = supabase
        .from('v_invoice_items')
        .select('category_name, sum(total):total_sales, count(id):items_sold')
        .group('category_name')

      if (filters.fromDate) query = query.gte('created_at', filters.fromDate.toISOString())
      if (filters.toDate) query = query.lte('created_at', filters.toDate.toISOString())

      const { data, error } = await query
      if (error) throw error
      return { data, totals: { total_sales: data.reduce((acc, r) => acc + (r.total_sales || 0), 0) } }
    },
  })

  // Since I don't have a specific view for category sales, I'll use raw query or a flexible approach
  // Re-implementing with useReport correctly
  const { data, isLoading, totals, exportToExcel: doExport } = useReport({
    queryKey: ["sales-by-category"],
    queryFn: async (f) => {
       const supabase = createClient()
       const { data, error } = await supabase.rpc('get_sales_by_category', {
          p_from_date: f.fromDate?.toISOString(),
          p_to_date: f.toDate?.toISOString()
       })
       if (error) throw error
       return { 
         data, 
         totals: { 
           total_sales: data?.reduce((acc: any, r: any) => acc + r.total_sales, 0) || 0 
         } 
       }
    }
  })

  const columns = [
    {
      header: "الفئة",
      accessorKey: "category_name",
      cell: ({ row }: any) => <span className="font-black">{row.original.category_name || "بدون فئة"}</span>,
    },
    {
      header: "عدد القطع المباعة",
      accessorKey: "items_sold",
    },
    {
      header: "إجمالي المبيعات",
      accessorKey: "total_sales",
      cell: ({ row }: any) => `${row.original.total_sales.toLocaleString()} ج.م`,
    },
    {
      header: "نسبة من المبيعات",
      accessorKey: "sales_percentage",
      cell: ({ row }: any) => `${row.original.sales_percentage?.toFixed(1) || 0}%`,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">المبيعات حسب الفئات</h1>
        <p className="text-muted-foreground font-bold">تحليل الأصناف الأكثر مبيعاً حسب الفئة</p>
      </div>

      <ReportFilters 
        onFilter={setFilters} 
        onExport={() => exportToExcel(columns, "مبيعات_الفئات")}
      />

      <ReportTable 
        columns={columns} 
        data={data || []} 
        isLoading={isLoading}
        totals={totals ? [{ label: "إجمالي المبيعات", value: `${totals.total_sales.toLocaleString()} ج.م` }] : []}
      />
    </div>
  )
}
