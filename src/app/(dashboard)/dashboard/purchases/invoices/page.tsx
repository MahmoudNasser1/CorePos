import { getInvoices } from "@/lib/actions/invoices"
import { InvoiceTable } from "@/components/invoices/InvoiceTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingCart, Truck, Wallet, ClipboardList } from "lucide-react"
import Link from "next/link"
import { StatCard } from "@/components/shared/StatCard"

type PurchaseInvoiceRow = {
  id: string
  total?: number | null
  paid?: number | null
  remaining?: number | null
}

export default async function PurchaseInvoicesPage() {
  const invoices = (await getInvoices({ type: 'purchase' })) as unknown as PurchaseInvoiceRow[]

  // Calculate quick stats
  const totalAmount = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0)
  const paidAmount = invoices.reduce((acc, inv) => acc + (inv.paid || 0), 0)
  const remainingAmount = invoices.reduce((acc, inv) => acc + (inv.remaining || 0), 0)

  return (
    <div className="space-y-6 rounded-2xl border border-amber-500/15 border-s-4 border-s-amber-500/45 bg-amber-50/15 p-4 md:p-6 dark:bg-amber-950/10">
      <PageHeader
        title="فواتير المشتريات"
        subtitle="إدارة فواتير التوريد والموردين — نفس تجربة قائمة المبيعات مع تمييز واضح للمشتريات."
      >
        <Button asChild className="gap-2">
          <Link href="/dashboard/purchases/new" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            فاتورة توريد جديدة
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي المشتريات"
          value={totalAmount}
          isCurrency
          icon={ShoppingCart}
          trend={{ value: 5, isPositive: true }}
          subtitle="إجمالي قيمة التوريدات للمخزن"
        />
        <StatCard
          title="المدفوع للموردين"
          value={paidAmount}
          isCurrency
          icon={Wallet}
          className="border-border"
          subtitle="المبالغ المسددة من الخزينة"
        />
        <StatCard
          title="مستحقات للموردين"
          value={remainingAmount}
          isCurrency
          icon={Truck}
          className="border-border"
          subtitle="مبالغ آجلة مستحقة للموردين"
        />
        <StatCard
          title="عدد الفواتير"
          value={invoices.length}
          icon={ClipboardList}
          isCurrency={false}
          subtitle="إجمالي فواتير التوريد"
        />
      </div>

      <InvoiceTable data={invoices} type="purchase" />
    </div>
  )
}
