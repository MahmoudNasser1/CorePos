import { getInvoices } from "@/lib/actions/invoices"
import { InvoiceTable } from "@/components/invoices/InvoiceTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Plus, FileText, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { StatCard } from "@/components/shared/StatCard"

export default async function QuotationsPage() {
  const quotations = (await getInvoices({ type: 'quotation' })) as any[]

  // Calculate quick stats
  const totalAmount = quotations.reduce((acc, q) => acc + (q.total || 0), 0)
  const acceptedCount = quotations.filter(q => q.status === 'converted').length

  return (
    <div className="space-y-6">
      <PageHeader 
        title="عروض الأسعار" 
        subtitle="إصدار عروض أسعار للعملاء ومتابعة حالة القبول."
      >
        <Button asChild>
          <Link href="/dashboard/sales/quotations/new">
            <Plus className="ml-2 h-4 w-4" /> عرض سعر جديد
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="إجمالي العروض" 
          value={totalAmount} 
          icon={FileText} 
          subtitle="قيمة كافة العروض المصدرة"
        />
        <StatCard 
          title="عروض محولة" 
          value={acceptedCount} 
          isCurrency={false}
          icon={CheckCircle} 
          className="text-green-600"
          subtitle="عروض تم تحويلها لفواتير مبيعات"
        />
        <StatCard 
          title="بانتظار الرد" 
          value={quotations.length - acceptedCount} 
          isCurrency={false}
          icon={Clock} 
          className="text-amber-500"
          subtitle="عروض أسعار قيد المراجعة ملدي العملاء"
        />
         <StatCard 
          title="عدد الكل" 
          value={quotations.length} 
          icon={FileText} 
          isCurrency={false}
          subtitle="إجمالي عدد المستندات"
        />
      </div>

      <InvoiceTable data={quotations} type="quotation" />
    </div>
  )
}
