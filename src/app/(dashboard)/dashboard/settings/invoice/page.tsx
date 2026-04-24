import { getCompanyProfile } from "@/lib/actions/settings.actions"
import { InvoiceSettingsForm } from "@/components/settings/InvoiceSettingsForm"

export default async function InvoiceSettingsPage() {
  const company = await getCompanyProfile()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">الفاتورة والشركة</h1>
        <p className="text-sm text-muted-foreground">
          الشعار وبيانات الضريبة والتذييل كما تظهر للعميل في الفاتورة.
        </p>
      </div>

      <InvoiceSettingsForm initialData={company} />
    </div>
  )
}
