import { getCompanyProfile } from "@/lib/actions/settings.actions"
import { CompanyRegionalForm } from "@/components/settings/CompanyRegionalForm"

export default async function CompanyRegionalSettingsPage() {
  const company = await getCompanyProfile()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">الشركة والمنطقة</h1>
        <p className="text-sm text-muted-foreground">
          العملة والبلد والمنطقة الزمنية كمرجع مركزي للنظام. بيانات الضريبة والشعار والفاتورة من صفحة «الفاتورة والشركة».
        </p>
      </div>

      <CompanyRegionalForm initialData={company as any} />
    </div>
  )
}
