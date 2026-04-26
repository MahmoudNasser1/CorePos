import { getPrintSettings, getPrintTemplates } from "@/lib/actions/settings.actions"
import { PrintSettingsClient } from "./PrintSettingsClient"

export const metadata = {
  title: "إعدادات الطباعة والقوالب - Pos-Sahl",
}

export default async function PrintingSettingsPage() {
  const [settingsRes, templatesRes] = await Promise.all([
    getPrintSettings(),
    getPrintTemplates(),
  ])

  const settings = Array.isArray(settingsRes) ? settingsRes : []
  const templates = Array.isArray(templatesRes) ? templatesRes : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">الطباعة والقوالب</h2>
        <p className="text-sm text-muted-foreground mt-2">
          إدارة قوالب الطباعة (الفواتير، المرتجعات، ملصقات الباركود) وتخصيص مقاسات الورق لكل مستند.
        </p>
      </div>
      
      <div className="h-px bg-border" />

      <PrintSettingsClient initialSettings={settings} initialTemplates={templates} />
    </div>
  )
}
