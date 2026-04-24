import { PageHeader } from "@/components/shared/PageHeader"
import { VoucherForm } from "@/components/finance/VoucherForm"

export default function NewReceiptPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="سند قبض جديد"
        subtitle="تسجيل استلام نقدية من عميل وتحديث رصيده"
      />
      <VoucherForm type="receipt" />
    </div>
  )
}
