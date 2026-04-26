"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ReasonDialog } from "@/components/shared/ReasonDialog"
import { resetPlatformAdminUserPassword, updatePlatformAdminUser } from "@/lib/actions/platform-admin.actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function UsersTableActions({
  user,
}: {
  user: {
    id: string
    fullName: string
    email: string
    role: string
    isActive: boolean
    companyId: string | null
    orgUnitId?: string | null
  }
}) {
  const [openDisable, setOpenDisable] = useState(false)
  const [openReset, setOpenReset] = useState(false)
  const [openOrg, setOpenOrg] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [orgUnitId, setOrgUnitId] = useState(user.orgUnitId ?? "")
  const [orgReason, setOrgReason] = useState("")

  const toggleActive = (reason: string) => {
    startTransition(() => {
      updatePlatformAdminUser(user.id, { reason, isActive: !user.isActive }).then((res) => {
        if (res.ok) {
          toast.success(user.isActive ? "تم إيقاف المستخدم" : "تم تفعيل المستخدم")
        } else {
          toast.error("تعذّر تنفيذ العملية")
        }
      })
    })
  }

  const resetPassword = (reason: string) => {
    startTransition(() => {
      resetPlatformAdminUserPassword(user.id, { reason }).then((res) => {
        if (!res.ok || !res.data?.tempPassword) {
          toast.error("تعذّر إعادة تعيين كلمة المرور")
          return
        }
        toast.success(`كلمة مؤقتة: ${res.data.tempPassword}`)
      })
    })
  }

  return (
    <div className="flex justify-end gap-2">
      <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => setOpenDisable(true)}>
        {user.isActive ? "إيقاف" : "تفعيل"}
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => setOpenOrg(true)}>
        الإدارة
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={() => setOpenReset(true)}>
        Reset password
      </Button>

      <ReasonDialog
        isOpen={openDisable}
        onClose={() => setOpenDisable(false)}
        title={user.isActive ? "إيقاف المستخدم" : "تفعيل المستخدم"}
        description="أدخل سبب واضح. سيتم تسجيل العملية في سجل التدقيق."
        confirmText="تأكيد"
        onConfirm={(reason) => {
          setOpenDisable(false)
          toggleActive(reason)
        }}
      />

      <ReasonDialog
        isOpen={openReset}
        onClose={() => setOpenReset(false)}
        title="إعادة تعيين كلمة المرور"
        description="سيتم إنشاء كلمة مرور مؤقتة للمستخدم وتسجيل العملية في سجل التدقيق."
        confirmText="تأكيد"
        onConfirm={(reason) => {
          setOpenReset(false)
          resetPassword(reason)
        }}
      />

      <AlertDialog
        open={openOrg}
        onOpenChange={(open) => {
          if (!open) setOpenOrg(false)
        }}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle>تعيين الإدارة</AlertDialogTitle>
            <AlertDialogDescription>أدخل orgUnitId (أو اتركها فارغة لإزالة الربط) مع سبب واضح.</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="orgunit-id">orgUnitId</Label>
              <Input
                id="orgunit-id"
                value={orgUnitId}
                onChange={(e) => setOrgUnitId(e.target.value)}
                placeholder="uuid"
                dir="ltr"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="orgunit-reason">السبب (Reason) *</Label>
              <Input
                id="orgunit-reason"
                value={orgReason}
                onChange={(e) => setOrgReason(e.target.value)}
                placeholder="اكتب سبب مختصر…"
              />
            </div>
          </div>

          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel
              onClick={() => {
                setOpenOrg(false)
                setOrgReason("")
                setOrgUnitId(user.orgUnitId ?? "")
              }}
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={orgReason.trim().length < 3 || isPending}
              onClick={() => {
                const reason = orgReason.trim()
                const next = orgUnitId.trim() || null
                setOpenOrg(false)
                setOrgReason("")
                startTransition(() => {
                  updatePlatformAdminUser(user.id, { reason, orgUnitId: next }).then((res) => {
                    if (res.ok) {
                      toast.success("تم تحديث الإدارة للمستخدم")
                    } else {
                      toast.error("تعذّر تحديث الإدارة")
                    }
                  })
                })
              }}
            >
              حفظ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

