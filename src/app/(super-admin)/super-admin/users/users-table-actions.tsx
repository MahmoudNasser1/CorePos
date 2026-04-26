"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ReasonDialog } from "@/components/shared/ReasonDialog"
import { resetPlatformAdminUserPassword, updatePlatformAdminUser } from "@/lib/actions/platform-admin.actions"

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
  }
}) {
  const [openDisable, setOpenDisable] = useState(false)
  const [openReset, setOpenReset] = useState(false)
  const [isPending, startTransition] = useTransition()

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
    </div>
  )
}

