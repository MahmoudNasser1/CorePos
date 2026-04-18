import { PageHeader } from "@/components/layout/PageHeader"
import { VoucherForm } from "@/components/finance/VoucherForm"

export default function NewPaymentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="سند صرف جديد"
        description="تسجيل صرف نقدية لمورد وتحديث رصيده"
      />
      <VoucherForm type="payment" />
    </div>
  )
}
