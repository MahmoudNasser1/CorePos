import { getInvoices } from "@/lib/actions/invoices"
import { InvoiceTable } from "@/components/invoices/InvoiceTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingBag, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { StatCard } from "@/components/shared/StatCard"

export default async function SalesInvoicesPage() {
  const invoices = (await getInvoices({ type: 'sale' }).catch((e) => {
    console.error('Failed to fetch invoices:', e)
    return []
  })) as any[]


  // Calculate quick stats
  const totalAmount = invoices.reduce((acc: number, inv: any) => acc + (inv.total || 0), 0)
  const paidAmount = invoices.reduce((acc: number, inv: any) => acc + (inv.paid || 0), 0)
  const remainingAmount = invoices.reduce((acc: number, inv: any) => acc + (inv.remaining || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader 
        title="فواتير المبيعات" 
        subtitle="إدارة جميع فواتير المبيعات الصادرة من النظام."
      >
        <Button asChild className="gap-2">
          <Link href="/dashboard/sales/new" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            فاتورة جديدة
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="إجمالي المبيعات" 
          value={totalAmount} 
          icon={ShoppingBag} 
          trend={{ value: 12, isPositive: true }}
          subtitle="إجمالي فواتير الفترة الحالية"
        />
        <StatCard 
          title="المحصل نقداً" 
          value={paidAmount} 
          icon={CheckCircle} 
          className="text-green-600"
          subtitle="المبالغ التي دخلت الخزينة"
        />
        <StatCard 
          title="مبيعات آجلة" 
          value={remainingAmount} 
          icon={Clock} 
          className="text-amber-500"
          subtitle="مبالغ متبقية على العملاء"
        />
         <StatCard 
          title="عدد الفواتير" 
          value={invoices.length} 
          icon={CheckCircle} 
          isCurrency={false}
          subtitle="إجمالي الفواتير المصدرة"
        />
      </div>

      <InvoiceTable data={invoices} type="sale" />
    </div>
  )
}
