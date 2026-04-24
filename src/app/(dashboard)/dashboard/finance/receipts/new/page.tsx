import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { VoucherForm } from "@/components/finance/VoucherForm"

export default function NewReceiptPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="سند قبض جديد"
        subtitle="تسجيل استلام نقدية من عميل وتحديث رصيده"
      />

      <p className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
        راجع أرصدة الخزائن من{" "}
        <Link href="/dashboard/finance/treasuries" className="font-semibold text-primary underline-offset-4 hover:underline">
          الخزائن والحسابات
        </Link>
        . لصرف لمورد استخدم{" "}
        <Link href="/dashboard/finance/payments/new" className="font-semibold text-primary underline-offset-4 hover:underline">
          سند صرف جديد
        </Link>
        .
      </p>

      <VoucherForm type="receipt" />
    </div>
  )
}
