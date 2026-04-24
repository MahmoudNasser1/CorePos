import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { PageHeader } from "@/components/shared/PageHeader"

export default function NewQuotationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="عرض سعر جديد"
        subtitle="عرض للعميل دون خصم من المخزون أو تسجيل إيراد؛ يمكن تحويله لاحقاً إلى فاتورة مبيعات."
      />
      <InvoiceForm type="quotation" />
    </div>
  )
}
