import { getInvoices } from "@/lib/actions/invoices"
import { InvoiceTable } from "@/components/invoices/InvoiceTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingCart, Truck, Wallet } from "lucide-react"
import Link from "next/link"
import { StatCard } from "@/components/shared/StatCard"

export default async function PurchaseInvoicesPage() {
  const invoices = await getInvoices({ type: 'purchase' })

  // Calculate quick stats
  const totalAmount = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0)
  const paidAmount = invoices.reduce((acc, inv) => acc + (inv.paid || 0), 0)
  const remainingAmount = invoices.reduce((acc, inv) => acc + (inv.remaining || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader 
        title="فواتير المشتريات" 
        description="إدارة جميع فواتير المشتريات وتوريدات المخزون."
      >
        <Button asChild>
          <Link href="/dashboard/purchases/new">
            <Plus className="ml-2 h-4 w-4" /> فاتورة توريد جديدة
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="إجمالي المشتريات" 
          value={totalAmount} 
          icon={ShoppingCart} 
          trend="+5%" 
          description="إجمالي قيمة التوريدات للمخزن"
        />
        <StatCard 
          title="المدفوع للموردين" 
          value={paidAmount} 
          icon={Wallet} 
          className="text-green-600"
          description="المبالغ المسددة من الخزينة"
        />
        <StatCard 
          title="مستحقات للموردين" 
          value={remainingAmount} 
          icon={Truck} 
          className="text-red-500"
          description="مبالغ آجلة مستحقة للموردين"
        />
         <StatCard 
          title="عدد الفواتير" 
          value={invoices.length} 
          icon={Plus} 
          isCurrency={false}
          description="إجمالي فواتير التوريد"
        />
      </div>

      <InvoiceTable data={invoices} type="purchase" />
    </div>
  )
}
