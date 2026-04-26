import Link from "next/link"
import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { PageHeader } from "@/components/shared/PageHeader"

export default async function NewPurchaseInvoicePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="فاتورة مشتريات جديدة"
        subtitle="اختر المورد ثم أضف البنود — يُحدَّث المخزون عند الترحيل حسب إعدادات النظام."
      />

      <p className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
        لطلب توريد قبل الفاتورة النهائية استخدم{" "}
        <Link
          href="/dashboard/purchases/orders"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          أوامر الشراء
        </Link>
        ، أو أنشئ{" "}
        <Link
          href="/dashboard/purchases/orders/new"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          أمر شراء جديد
        </Link>{" "}
        مباشرة.
      </p>

      <InvoiceForm type="purchase" />
    </div>
  )
}
