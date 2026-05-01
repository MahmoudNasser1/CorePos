"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/shared/DataTable"
import { Card, CardContent } from "@/components/ui/card"
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
    window.location.href = url
  }

  const columns: ColumnDef<Row>[] = useMemo(
    () => [
      {
        accessorKey: "created_at",
        header: "الوقت",
        cell: ({ row }) => {
          const date = new Date(row.original.created_at)
          return (
            <div className="flex flex-col text-[11px]" dir="ltr">
              <span className="font-bold text-foreground">{date.toLocaleDateString()}</span>
              <span className="text-muted-foreground/70">{date.toLocaleTimeString()}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "action",
        header: "الإجراء",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-mono text-[10px] bg-indigo-500/5 text-indigo-600 border-indigo-500/10" dir="ltr">
            {row.original.action}
          </Badge>
        ),
      },
      {
        accessorKey: "actor",
        header: "القائم بالعمل",
        cell: ({ row }) => (
          <div className="flex flex-col text-[11px]" dir="ltr">
            <span className="font-medium text-foreground truncate max-w-[120px]">{row.original.actor_user_id}</span>
            <span className="text-muted-foreground/50 italic">User ID</span>
          </div>
        ),
      },
      {
        accessorKey: "company_id",
        header: "الشركة",
        cell: ({ row }) => (
          <div className="text-[11px] font-mono text-muted-foreground" dir="ltr">
            {row.original.company_id || "—"}
          </div>
        ),
      },
      {
        accessorKey: "reason",
        header: "السبب / الملاحظات",
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground italic max-w-[200px] truncate">
            {row.original.reason || "—"}
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-muted/20">
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground">نوع الإجراء</Label>
              <Input 
                value={action} 
                onChange={(e) => setAction(e.target.value)} 
                placeholder="مثال: user.update" 
                className="bg-background"
                dir="ltr" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground">معرف الشركة</Label>
              <Input 
                value={companyId} 
                onChange={(e) => setCompanyId(e.target.value)} 
                placeholder="UUID" 
                className="bg-background"
                dir="ltr" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground">من تاريخ</Label>
              <Input 
                type="date"
                value={from} 
                onChange={(e) => setFrom(e.target.value)} 
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground">إلى تاريخ</Label>
              <Input 
                type="date"
                value={to} 
                onChange={(e) => setTo(e.target.value)} 
                className="bg-background"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-muted">
            <Button variant="ghost" onClick={() => { setAction(""); setCompanyId(""); setFrom(""); setTo(""); }} disabled={isPending}>
              إعادة تعيين
            </Button>
            <Button variant="outline" onClick={exportCsv} disabled={isPending}>
              تصدير CSV
            </Button>
            <Button onClick={load} disabled={isPending} className="min-w-[100px] font-bold">
              {isPending ? "جارٍ البحث..." : "بحث"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border shadow-sm bg-background overflow-hidden">
        <DataTable columns={columns as any} data={rows as any} />
      </div>
    </div>
  )
}

