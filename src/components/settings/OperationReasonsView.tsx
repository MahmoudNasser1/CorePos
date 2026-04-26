"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus } from "lucide-react"
import type { OperationReasonRow } from "@/lib/actions/finance-variables.actions"
import { createOperationReason, deleteOperationReason } from "@/lib/actions/finance-variables.actions"

const SCOPE_LABELS: Record<string, string> = {
  sale_return: "مرتجع مبيعات",
  purchase_return: "مرتجع مشتريات",
  void: "إلغاء فاتورة",
  discount: "خصم/تعويض",
}

export function OperationReasonsView({ initialItems }: { initialItems: OperationReasonRow[] }) {
  const [items, setItems] = useState<OperationReasonRow[]>(initialItems)
  const [isPending, startTransition] = useTransition()
  const [scope, setScope] = useState<keyof typeof SCOPE_LABELS>("sale_return")
  const [label, setLabel] = useState("")

  const canAdd = label.trim().length >= 3
  const scopes = Object.keys(SCOPE_LABELS)

  const grouped = useMemo(() => {
    const out: Record<string, OperationReasonRow[]> = {}
    for (const r of items) {
      const s = r.scope || "other"
      if (!out[s]) out[s] = []
      out[s].push(r)
    }
    for (const k of Object.keys(out)) {
      out[k] = out[k].sort((a, b) => {
        const ao = Number(a.sort_order ?? 0)
        const bo = Number(b.sort_order ?? 0)
        if (ao !== bo) return ao - bo
        return String(a.label).localeCompare(String(b.label), "ar")
      })
    }
    return out
  }, [items])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">أسباب الإرجاع / الإلغاء</CardTitle>
        <p className="text-sm text-muted-foreground">تساعد في توحيد التقارير وسجل النشاطات.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-muted-foreground">النوع</div>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
            >
              {scopes.map((s) => (
                <option key={s} value={s}>
                  {SCOPE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-xs font-bold text-muted-foreground">السبب</div>
            <div className="flex gap-2">
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="مثال: خطأ في الفاتورة" />
              <Button
                type="button"
                className="gap-2"
                disabled={!canAdd || isPending}
                onClick={() => {
                  const payload = { scope, label: label.trim() }
                  startTransition(async () => {
                    try {
                      const created = await createOperationReason(payload)
                      setItems((prev) => [created, ...prev])
                      setLabel("")
                      toast.success("تمت الإضافة")
                    } catch (e: any) {
                      toast.error(e?.message || "تعذّرت الإضافة")
                    }
                  })
                }}
              >
                <Plus className="h-4 w-4" aria-hidden />
                إضافة
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {scopes.map((s) => {
            const list = grouped[s] || []
            return (
              <div key={s} className="rounded-lg border">
                <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
                  <div className="font-bold">{SCOPE_LABELS[s]}</div>
                  <Badge variant="secondary">{list.length}</Badge>
                </div>
                <div className="divide-y">
                  {list.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0 truncate font-medium">{r.label}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        aria-label="حذف"
                        onClick={() => {
                          startTransition(async () => {
                            try {
                              await deleteOperationReason(r.id)
                              setItems((prev) => prev.filter((x) => x.id !== r.id))
                              toast.success("تم الحذف")
                            } catch (e: any) {
                              toast.error(e?.message || "تعذّر الحذف")
                            }
                          })
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  ))}
                  {list.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">لا أسباب هنا بعد.</div>}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

