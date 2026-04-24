import Link from "next/link"
import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { PageHeader } from "@/components/shared/PageHeader"

export default function NewPurchaseOrderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="أمر شراء جديد"
        subtitle="حدد المورد والأصناف المطلوبة. بعد التحويل إلى فاتورة مشتريات تُسجَّل القيم في المخزون والمحاسبة."
      />

      <p className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
        إن كنت تريد تسجيل توريد مباشر دون دورة أمر شراء، أنشئ{" "}
        <Link
          href="/dashboard/purchases/new"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          فاتورة مشتريات جديدة
        </Link>
        .
      </p>

      <InvoiceForm type="purchase_order" />
    </div>
  )
}
