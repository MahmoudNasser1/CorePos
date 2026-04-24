import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { PageHeader } from "@/components/shared/PageHeader"

export default async function NewSaleInvoicePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="إنشاء فاتورة مبيعات"
        subtitle="قم بإضافة المنتجات واختيار العميل لإصدار فاتورة جديدة."
      />

      <p className="text-sm text-muted-foreground">
        للفواتير المفصّلة وإدارة الائتمان والآجل — للبيع السريع من الكاشير استخدم شاشة نقطة البيع.
      </p>

      <InvoiceForm type="sale" />
    </div>
  )
}
