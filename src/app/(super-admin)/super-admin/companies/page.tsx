import { listPlatformAdminCompanies } from "@/lib/actions/platform-admin.actions"
import { PageHeader } from "@/components/shared/PageHeader"
import { CompaniesTable } from "./CompaniesTable"

export const dynamic = "force-dynamic"

export default async function PlatformCompaniesPage() {
  const data = await listPlatformAdminCompanies()

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="الشركات"
        subtitle="قائمة الشركات على مستوى المنصة (بحث + فلترة حسب الخطة في المرحلة التالية)."
      />

      <CompaniesTable data={data} />
    </div>
  )
}

