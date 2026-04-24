import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { VoucherForm } from "@/components/finance/VoucherForm"

export default function NewPaymentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="سند صرف جديد"
        subtitle="تسجيل صرف نقدية لمورد وتحديث رصيده"
      />

      <p className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
        راجع أرصدة الخزائن من{" "}
        <Link href="/dashboard/finance/treasuries" className="font-semibold text-primary underline-offset-4 hover:underline">
          الخزائن والحسابات
        </Link>
        . لاستلام نقدية من عميل استخدم{" "}
        <Link href="/dashboard/finance/receipts/new" className="font-semibold text-primary underline-offset-4 hover:underline">
          سند قبض جديد
        </Link>
        .
      </p>

      <VoucherForm type="payment" />
    </div>
  )
}
