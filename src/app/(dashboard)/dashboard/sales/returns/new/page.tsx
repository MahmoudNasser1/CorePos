import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { PageHeader } from "@/components/shared/PageHeader"

export default function NewSaleReturnPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="مرتجع مبيعات جديد"
        subtitle="إرجاع أصناف للمخزن وضبط المبالغ مع العميل وفق سياسة المرتجعات."
      />
      <InvoiceForm type="sale_return" />
    </div>
  )
}
