"use client"

import { useReport } from "@/hooks/use-report"
import { getCustomerBalances } from "@/lib/actions/reports.actions"
import { ReportFilters } from "@/components/reports/ReportFilters"
import { ReportTable } from "@/components/reports/ReportTable"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export default function CustomerBalancesPage() {
  const { data, isLoading, totals, setFilters, exportToExcel } = useReport({
    queryKey: ["customer-balances"],
    queryFn: () => getCustomerBalances(),
  })

  const columns = [
    {
      header: "اسم العميل",
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
            {isDebt ? " (عليه)" : " (له)"}
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
      label: "إجمالي الأرصدة المستحقة", 
      value: `${Math.abs(totals.balance).toLocaleString()} ج.م`,
      className: totals.balance < 0 ? "text-destructive" : "text-green-600"
    },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">أرصدة العملاء</h1>
        <p className="text-muted-foreground font-bold">كشف بمديونيات وأرصدة العملاء الحالية</p>
      </div>

      <ReportFilters 
        onFilter={setFilters} 
        onExport={() => exportToExcel(columns, "أرصدة_العملاء")}
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
