import { PageHeader } from "@/components/shared/PageHeader"
import { PartnerContactForm } from "@/components/partners/PartnerContactForm"

export default function NewCustomerPage() {
  return (
    <div className="space-y-6 p-1">
      <PageHeader title="عميل جديد" subtitle="أدخل بيانات التواصل — يُربط لاحقاً بالفواتير والتحصيل." />
      <PartnerContactForm kind="customer" title="بيانات العميل" />
    </div>
  )
}
