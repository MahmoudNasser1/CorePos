import Link from "next/link"
import { getTreasuries } from "@/lib/actions/payments"
import { TreasuryList } from "@/components/finance/TreasuryList"
import { PageHeader } from "@/components/shared/PageHeader"

export default async function TreasuriesPage() {
  const treasuries = await getTreasuries()

  return (
    <div className="space-y-6">
      <PageHeader
        title="الخزائن والحسابات"
        subtitle="عرض الرصيد لكل خزينة أو حساب، وإضافة أو تعديل بيانات الخزينة."
        className="mb-0"
      />

      <p className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
        لتسجيل حركة نقدية مرتبطة بالعميل أو المورد:{" "}
        <Link href="/dashboard/finance/receipts/new" className="font-semibold text-primary underline-offset-4 hover:underline">
          سند قبض جديد
        </Link>
        {" "}أو{" "}
        <Link href="/dashboard/finance/payments/new" className="font-semibold text-primary underline-offset-4 hover:underline">
          سند صرف جديد
        </Link>
        .
      </p>

      <TreasuryList initialData={treasuries} />
    </div>
  )
}
