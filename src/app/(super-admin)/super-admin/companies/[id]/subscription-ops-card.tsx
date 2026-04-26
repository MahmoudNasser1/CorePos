"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { updatePlatformAdminCompanySubscription } from "@/lib/actions/platform-admin.actions"

export function SubscriptionOpsCard({
  companyId,
  current,
}: {
  companyId: string
  current: { id: string; status: string; planId: string; currentPeriodEnd: string | null } | null
}) {
  const [reason, setReason] = useState("")
  const [planId, setPlanId] = useState(current?.planId ?? "")
  const [status, setStatus] = useState(current?.status ?? "")
  const [extendDays, setExtendDays] = useState<string>("")

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const extendNum = extendDays.trim() ? Number(extendDays) : undefined

  const canSubmit = reason.trim().length >= 3 && (planId.trim() || status.trim() || (extendNum && extendNum > 0))

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-sm font-semibold mb-3">إجراءات الاشتراك (Ops)</div>
      <div className="text-xs text-muted-foreground mb-4">
        أي تعديل هنا يتطلب سبب (Reason) وسيتم تسجيله في سجل التدقيق (Audit).
      </div>

      {!current && (
        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          لا يوجد اشتراك لهذه الشركة في قاعدة البيانات (قد تكون migrations غير مفعلة).
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="pa-plan">الخطة (planId)</Label>
          <Input id="pa-plan" value={planId} onChange={(e) => setPlanId(e.target.value)} placeholder="free / starter / pro" dir="ltr" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pa-status">الحالة (status)</Label>
          <Input id="pa-status" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="active / trialing / expired / cancelled / past_due" dir="ltr" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pa-extend">تمديد (بالأيام)</Label>
          <Input
            id="pa-extend"
            value={extendDays}
            onChange={(e) => setExtendDays(e.target.value)}
            placeholder="مثال: 14"
            inputMode="numeric"
            dir="ltr"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="pa-reason">السبب (Reason) *</Label>
          <Input
            id="pa-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اكتب سبب مختصر للتعديل…"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="default"
          disabled={!canSubmit || isPending}
          onClick={() => setConfirmOpen(true)}
        >
          {isPending ? "جارٍ التنفيذ…" : "تطبيق التعديل"}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="تأكيد تعديل الاشتراك"
        description="تأكد أن السبب صحيح. سيتم تسجيل العملية في سجل التدقيق."
        confirmText="تأكيد"
        cancelText="إلغاء"
        onConfirm={() => {
          setConfirmOpen(false)
          startTransition(() => {
            updatePlatformAdminCompanySubscription(companyId, {
              reason: reason.trim(),
              planId: planId.trim() || undefined,
              status: status.trim() || undefined,
              extendDays: extendNum && extendNum > 0 ? extendNum : undefined,
            }).then((res) => {
              if (res.ok) {
                toast.success("تم تحديث الاشتراك بنجاح")
              } else {
                toast.error("تعذّر تحديث الاشتراك (تحقق من migrations والصلاحيات)")
              }
            })
          })
        }}
      />
    </div>
  )
}

