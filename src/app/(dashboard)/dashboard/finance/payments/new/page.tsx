import { PageHeader } from "@/components/shared/PageHeader"
import { VoucherForm } from "@/components/finance/VoucherForm"

export default function NewPaymentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="سند صرف جديد"
        subtitle="تسجيل صرف نقدية لمورد وتحديث رصيده"
      />
      <VoucherForm type="payment" />
    </div>
  )
}
