import { PageHeader } from "@/components/layout/PageHeader"
import { VoucherForm } from "@/components/finance/VoucherForm"

export default function NewReceiptPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="سند قبض جديد"
        description="تسجيل استلام نقدية من عميل وتحديث رصيده"
      />
      <VoucherForm type="receipt" />
    </div>
  )
}
