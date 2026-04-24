import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { PageHeader } from "@/components/shared/PageHeader"

export default function NewPurchaseReturnPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="مرتجع مشتريات جديد"
        subtitle="إرجاع أصناف للمورد وضبط المدفوعات — سيُطلب منك تأكيد قبل التسجيل النهائي."
      />

      <p className="rounded-md border border-amber-500/25 bg-amber-50/40 p-3 text-sm leading-relaxed text-muted-foreground dark:bg-amber-950/20">
        بعد التأكيد يتوقّع النظام تعديل كميات المخزون (خروج من المخزن باتجاه المورد) وتسوية المبالغ مع المورد
        وفق سياسة المرتجعات لديكم.
      </p>

      <InvoiceForm type="purchase_return" />
    </div>
  )
}
