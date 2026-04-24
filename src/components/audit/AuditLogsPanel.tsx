"use client"

import { useDeferredValue, useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format, parseISO, isValid } from "date-fns"
import { ar } from "date-fns/locale"
import { Activity, Clock, Copy, Database, Globe, Search, User } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export type AuditLogRow = {
  id: string
  action: string
  entity: string
  ip_address?: string | null
  created_at: string
  profiles?: { full_name?: string | null } | null
}

function actionLabel(action: string) {
  switch (action.toLowerCase()) {
    case "create":
      return "إضافة"
    case "update":
      return "تعديل"
    case "delete":
      return "حذف"
    default:
      return action
  }
}

function actionClass(action: string) {
  switch (action.toLowerCase()) {
    case "create":
      return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
    case "update":
      return "border-sky-200 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100"
    case "delete":
      return "border-red-200 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100"
    default:
      return "border-border bg-muted text-foreground"
  }
}

function entityLabel(entity: string) {
  const map: Record<string, string> = {
    sale_invoices: "فاتورة مبيعات",
    purchase_invoices: "فاتورة مشتريات",
    products: "منتج",
    customers: "عميل",
    suppliers: "مورد",
    treasuries: "خزينة",
    expenses: "مصروف",
    inventory_transactions: "حركة مخزون",
  }
  return map[entity] || entity
}

export function AuditLogsPanel({ initialLogs }: { initialLogs: AuditLogRow[] }) {
  const [query, setQuery] = useState("")
  const deferred = useDeferredValue(query.trim().toLowerCase())

  const rows = useMemo(() => {
    if (!deferred) return initialLogs
    return initialLogs.filter((log) => {
      const blob = [
        log.id,
        log.action,
        log.entity,
        log.profiles?.full_name,
        log.ip_address,
        entityLabel(log.entity),
        actionLabel(log.action),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return blob.includes(deferred)
    })
  }, [initialLogs, deferred])

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      toast.success("تم نسخ المعرف")
    } catch {
      toast.error("تعذّر النسخ من المتصفح")
    }
  }

  const formatTime = (iso: string) => {
    const d = parseISO(iso)
    if (!isValid(d)) return "—"
    return format(d, "d MMM yyyy — HH:mm", { locale: ar })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-2 sm:px-0">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
          <Activity className="h-8 w-8 text-primary" aria-hidden />
          سجل التدقيق
        </h1>
        <p className="text-sm text-muted-foreground">
          سجل التدقيق يساعدك على تتبع التغييرات والعمليات الحساسة. يمكنك البحث في الجدول أدناه.
        </p>
      </div>

      <Card className="border bg-card shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-base font-semibold">تصفية سريعة</CardTitle>
          <CardDescription>بحث في النصوص المعروضة (المستخدم، الفعل، الكيان، المعرف، عنوان IP).</CardDescription>
          <div className="pt-2">
            <Label htmlFor="audit-search" className="sr-only">
              بحث في السجلات
            </Label>
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="audit-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث في السجلات…"
                className="ps-10 pe-4"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto" dir="rtl">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px] text-sm font-semibold">الوقت</TableHead>
                  <TableHead className="text-sm font-semibold">المستخدم</TableHead>
                  <TableHead className="text-sm font-semibold">الفعل</TableHead>
                  <TableHead className="text-sm font-semibold">الكيان</TableHead>
                  <TableHead className="text-sm font-semibold">عنوان IP</TableHead>
                  <TableHead className="text-sm font-semibold">المعرف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center align-middle">
                      <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Activity className="h-10 w-10 opacity-25" aria-hidden />
                        <p className="font-medium text-foreground">
                          {initialLogs.length === 0 ? "لا سجلات في الفترة" : "لا نتائج للبحث الحالي"}
                        </p>
                        <p>
                          {initialLogs.length === 0
                            ? "عند تفعيل واجهة السجلات في الخادم ستظهر العمليات هنا."
                            : "جرّب كلمات أخرى أو امسح حقل البحث."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((log) => (
                    <TableRow key={log.id} className="text-sm">
                      <TableCell className="whitespace-nowrap align-middle tabular-nums text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {formatTime(log.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" aria-hidden />
                          </div>
                          <span className="font-medium">{log.profiles?.full_name || "نظام"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <Badge variant="outline" className={cn("font-normal", actionClass(log.action))}>
                          {actionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-middle text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 shrink-0" aria-hidden />
                          {entityLabel(log.entity)}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle font-mono text-xs text-muted-foreground" dir="ltr">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {log.ip_address || "غير متاح"}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-center gap-2">
                          <code className="max-w-[140px] truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]" dir="ltr">
                            {log.id}
                          </code>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => void copyId(log.id)} aria-label="نسخ المعرف">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
