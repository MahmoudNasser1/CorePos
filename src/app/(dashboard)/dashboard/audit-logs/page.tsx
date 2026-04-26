import { getAuditLogs } from "@/lib/actions/settings.actions"
import { AuditLogsPanel, type AuditLogRow } from "@/components/audit/AuditLogsPanel"

export default async function AuditLogsPage() {
  const logs = (await getAuditLogs({ limit: 100 })) as AuditLogRow[]

  return <AuditLogsPanel initialLogs={logs} />
}
