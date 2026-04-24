import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { PageHeader } from "@/components/shared/PageHeader"

export default function NewPurchaseOrderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="أمر شراء جديد"
        subtitle="حدد المورد والأصناف المطلوبة. بعد التحويل إلى فاتورة مشتريات تُسجَّل القيم في المخزون والمحاسبة."
      />
      <InvoiceForm type="purchase_order" />
    </div>
  )
}
