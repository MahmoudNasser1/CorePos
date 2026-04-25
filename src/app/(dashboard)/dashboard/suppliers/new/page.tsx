import { PageHeader } from "@/components/shared/PageHeader"
import { PartnerContactForm } from "@/components/partners/PartnerContactForm"

export default function NewSupplierPage() {
  return (
    <div className="space-y-6 p-1">
      <PageHeader title="مورد جديد" subtitle="أدخل بيانات المورد — تُستخدم في فواتير المشتريات." />
      <PartnerContactForm kind="supplier" title="بيانات المورد" />
    </div>
  )
}
