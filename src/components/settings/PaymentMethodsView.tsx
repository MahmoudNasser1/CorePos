"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus } from "lucide-react"
import type { PaymentMethodRow } from "@/lib/actions/finance-variables.actions"
import { createPaymentMethod, deletePaymentMethod } from "@/lib/actions/finance-variables.actions"

export function PaymentMethodsView({ initialItems }: { initialItems: PaymentMethodRow[] }) {
  const [items, setItems] = useState<PaymentMethodRow[]>(initialItems)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")

  const canAdd = name.trim().length >= 2 && code.trim().length >= 2

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const ao = Number(a.sort_order ?? 0)
      const bo = Number(b.sort_order ?? 0)
      if (ao !== bo) return ao - bo
      return String(a.name).localeCompare(String(b.name), "ar")
    })
  }, [items])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">طرق الدفع</CardTitle>
        <p className="text-sm text-muted-foreground">
          تظهر في نقاط البيع والفواتير والخزينة. الكود يُستخدم داخليًا (مثال: cash / card / transfer / check / deferred).
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-muted-foreground">الاسم</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: كاش" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-muted-foreground">الكود</div>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="cash" dir="ltr" />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              className="w-full gap-2"
              disabled={!canAdd || isPending}
              onClick={() => {
                const payload = { name: name.trim(), code: code.trim() }
                startTransition(async () => {
                  try {
                    const created = await createPaymentMethod(payload)
                    setItems((prev) => [created, ...prev])
                    setName("")
                    setCode("")
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

        <div className="divide-y rounded-lg border">
          {sorted.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="truncate font-bold">{m.name}</div>
                  <Badge variant="secondary" className="font-mono text-[11px]" dir="ltr">
                    {m.code}
                  </Badge>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isPending}
                aria-label="حذف"
                onClick={() => {
                  startTransition(async () => {
                    try {
                      await deletePaymentMethod(m.id)
                      setItems((prev) => prev.filter((x) => x.id !== m.id))
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
          {sorted.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">لا توجد طرق دفع بعد.</div>}
        </div>
      </CardContent>
    </Card>
  )
}