import { PageHeader } from "@/components/shared/PageHeader"
import { PlatformAuditLogsClient } from "./platform-audit-logs-client"

export const dynamic = "force-dynamic"

export default function PlatformAuditLogsPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="سجل التدقيق (Platform)" subtitle="عرض وتصفية وتصدير عمليات المنصة (CSV)." />
      <PlatformAuditLogsClient />
    </div>
  )
}


