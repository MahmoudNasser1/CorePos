import Link from "next/link"
import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { PageHeader } from "@/components/shared/PageHeader"

export default async function NewSaleInvoicePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="إنشاء فاتورة مبيعات"
        subtitle="أضف البنود والعميل ثم راجع المجاميع قبل الترحيل أو الطباعة."
      />

      <p className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
        للفواتير المفصّلة وإدارة الائتمان والآجل — للبيع السريع استخدم{" "}
        <Link
          href="/dashboard/pos"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          شاشة نقطة البيع
        </Link>
        .
      </p>

      <InvoiceForm type="sale" />
    </div>
  )
}
