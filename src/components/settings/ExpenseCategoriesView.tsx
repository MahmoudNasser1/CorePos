"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import type { ExpenseCategoryRow } from "@/lib/actions/finance-variables.actions"
import { createExpenseCategory, deleteExpenseCategory } from "@/lib/actions/finance-variables.actions"

export function ExpenseCategoriesView({ initialItems }: { initialItems: ExpenseCategoryRow[] }) {
  const [items, setItems] = useState<ExpenseCategoryRow[]>(initialItems)
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")

  const canAdd = name.trim().length >= 2

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => String(a.name).localeCompare(String(b.name), "ar"))
  }, [items])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">فئات المصروفات</CardTitle>
        <p className="text-sm text-muted-foreground">تظهر داخل “المصروفات” وتقارير الربح والخسارة.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: إيجار" />
          <Button
            type="button"
            className="gap-2"
            disabled={!canAdd || isPending}
            onClick={() => {
              const n = name.trim()
              startTransition(async () => {
                try {
                  const created = await createExpenseCategory(n)
                  setItems((prev) => [created, ...prev])
                  setName("")
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

        <div className="divide-y rounded-lg border">
          {sorted.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0 truncate font-medium">{c.name}</div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isPending}
                aria-label="حذف"
                onClick={() => {
                  startTransition(async () => {
                    try {
                      await deleteExpenseCategory(c.id)
                      setItems((prev) => prev.filter((x) => x.id !== c.id))
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
          {sorted.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">لا توجد فئات بعد.</div>}
        </div>
      </CardContent>
    </Card>
  )
}

