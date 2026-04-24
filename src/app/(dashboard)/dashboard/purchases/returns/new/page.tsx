import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { PageHeader } from "@/components/shared/PageHeader"

export default function NewPurchaseReturnPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="مرتجع مشتريات جديد"
        subtitle="إرجاع أصناف للمورد وضبط المدفوعات — سيُطلب منك تأكيد قبل التسجيل النهائي."
      />
      <InvoiceForm type="purchase_return" />
    </div>
  )
}
