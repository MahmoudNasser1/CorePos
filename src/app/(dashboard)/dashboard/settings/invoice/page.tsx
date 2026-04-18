"use server"

import { getCompanyProfile } from "@/lib/actions/settings.actions"
import { InvoiceSettingsForm } from "@/components/settings/InvoiceSettingsForm"

export default async function InvoiceSettingsPage() {
  const company = await getCompanyProfile()

  return (
    <div className="space-y-6 pt-2 font-cairo">
      <div>
        <h1 className="text-3xl font-black">إعدادات الفاتورة والشركة</h1>
        <p className="text-muted-foreground font-bold">تحكم في هوية شركتك وبيانات الضرائب التي تظهر لعملائك</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <InvoiceSettingsForm initialData={company} />
      </div>
    </div>
  )
}
