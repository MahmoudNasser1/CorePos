"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/shared/DataTable"
import { BACKEND_BASE_URL, backendFetch } from "@/lib/api/backend-client"

type Row = {
  id: string
  actor_user_id: string
  company_id: string | null
  action: string
  target_type: string
  target_id: string | null
  reason: string | null
  ip: string | null
  request_id: string | null
  created_at: string
}

export function PlatformAuditLogsClient() {
  const [action, setAction] = useState("")
  const [companyId, setCompanyId] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [rows, setRows] = useState<Row[]>([])
  const [isPending, startTransition] = useTransition()

  const load = () => {
    const qs = new URLSearchParams()
    if (action.trim()) qs.set("action", action.trim())
    if (companyId.trim()) qs.set("companyId", companyId.trim())
    if (from.trim()) qs.set("from", from.trim())
    if (to.trim()) qs.set("to", to.trim())
    const s = qs.toString()
    startTransition(() => {
      backendFetch<Row[]>(`/platform-admin/audit-logs${s ? `?${s}` : ""}`)
        .then((data) => setRows(data))
        .catch(() => toast.error("تعذّر تحميل سجل التدقيق"))
    })
  }

  const exportCsv = () => {
    const qs = new URLSearchParams()
    if (action.trim()) qs.set("action", action.trim())
    if (companyId.trim()) qs.set("companyId", companyId.trim())
    if (from.trim()) qs.set("from", from.trim())
    if (to.trim()) qs.set("to", to.trim())
    const s = qs.toString()
    const url = `${BACKEND_BASE_URL}/v1/platform-admin/audit-logs/export${s ? `?${s}` : ""}`
    // Use full page navigation so cookies are sent and browser downloads attachment.
    window.location.href = url
  }

  const columns: ColumnDef<Row>[] = useMemo(
    () => [
      {
        accessorKey: "created_at",
        header: "الوقت",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground" dir="ltr">
            {String((row.original as any).created_at ?? "")}
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal" dir="ltr">
            {String((row.original as any).action ?? "")}
          </Badge>
        ),
      },
      {
        accessorKey: "company_id",
        header: "companyId",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground" dir="ltr">
            {String((row.original as any).company_id ?? "—")}
          </div>
        ),
      },
      {
        accessorKey: "actor_user_id",
        header: "actorUserId",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground" dir="ltr">
            {String((row.original as any).actor_user_id ?? "")}
          </div>
        ),
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => <div className="text-sm">{String((row.original as any).reason ?? "—")}</div>,
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label htmlFor="al-action">action</Label>
            <Input id="al-action" value={action} onChange={(e) => setAction(e.target.value)} placeholder="platform.user.update" dir="ltr" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="al-company">companyId</Label>
            <Input id="al-company" value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="uuid" dir="ltr" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="al-from">from</Label>
            <Input id="al-from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="2026-01-01" dir="ltr" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="al-to">to</Label>
            <Input id="al-to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="2026-01-31" dir="ltr" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" disabled={isPending} onClick={load}>
            {isPending ? "جارٍ التحميل…" : "تحميل"}
          </Button>
          <Button type="button" disabled={isPending} onClick={exportCsv}>
            تصدير CSV
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-2">
        <DataTable columns={columns as any} data={rows as any} />
      </div>
    </div>
  )
}

