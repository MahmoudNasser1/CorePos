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

      <TreasuryList initialData={treasuries} />
    </div>
  )
}
