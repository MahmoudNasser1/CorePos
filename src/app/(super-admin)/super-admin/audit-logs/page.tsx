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

import { PageHeader } from "@/components/shared/PageHeader"
import { DataTable } from "@/components/shared/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { listPlatformAdminAuditLogs } from "@/lib/actions/platform-admin.actions"

export const dynamic = "force-dynamic"

type Row = Awaited<ReturnType<typeof listPlatformAdminAuditLogs>>[number]

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "created_at",
    header: "الوقت",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums" dir="ltr">
        {String((row.original as any).created_at ?? "—")}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: "الإجراء",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal" dir="ltr">
        {String((row.original as any).action ?? "—")}
      </Badge>
    ),
  },
  {
    accessorKey: "company_id",
    header: "companyId",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground" dir="ltr">
        {String((row.original as any).company_id ?? "—")}
      </span>
    ),
  },
  {
    accessorKey: "actor_user_id",
    header: "actorUserId",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground" dir="ltr">
        {String((row.original as any).actor_user_id ?? "—")}
      </span>
    ),
  },
  {
    accessorKey: "reason",
    header: "السبب",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {String((row.original as any).reason ?? "—")}
      </span>
    ),
  },
]

export default async function PlatformAuditLogsPage() {
  const data = await listPlatformAdminAuditLogs()

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="سجل التدقيق (Platform)" subtitle="يعرض آخر العمليات الحساسة على مستوى المنصة." />

      <DataTable
        columns={columns}
        data={data}
        searchKey="action"
        placeholder="ابحث بالإجراء…"
        emptyState={{
          title: "لا توجد سجلات تدقيق",
          description: "عند تنفيذ أي Ops action (مثل تعديل الاشتراك) ستظهر السجلات هنا.",
        }}
      />
    </div>
  )
}

