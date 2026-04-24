import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { PageHeader } from "@/components/shared/PageHeader"

export default async function NewPurchaseInvoicePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="فاتورة مشتريات جديدة"
        subtitle="اختر المورد ثم أضف البنود — يُحدَّث المخزون عند الترحيل حسب إعدادات النظام."
      />

      <p className="text-sm text-muted-foreground">
        لأمر شراء أو طلب توريد قبل الفاتورة النهائية استخدم «أوامر الشراء» من قائمة المشتريات.
      </p>

      <InvoiceForm type="purchase" />
    </div>
  )
}
