"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/shared/DataTable"
import { ReasonDialog } from "@/components/shared/ReasonDialog"
import {
  createPlatformAdminOrgUnit,
  deletePlatformAdminOrgUnit,
  listPlatformAdminOrgUnits,
  updatePlatformAdminOrgUnit,
} from "@/lib/actions/platform-admin.actions"

type OrgUnitRow = Awaited<ReturnType<typeof listPlatformAdminOrgUnits>>[number]

export function OrgUnitsClient() {
  const [companyId, setCompanyId] = useState("")
  const [rows, setRows] = useState<OrgUnitRow[]>([])
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState("")
  const [parentId, setParentId] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<OrgUnitRow | null>(null)

  const canLoad = companyId.trim().length > 0

  const load = () => {
    const cid = companyId.trim()
    if (!cid) {
      setRows([])
      return
    }
    startTransition(() => {
      listPlatformAdminOrgUnits(cid).then((data) => setRows(data))
    })
  }

  const columns: ColumnDef<OrgUnitRow>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "الإدارة",
        cell: ({ row }) => (
          <div className="min-w-[220px]">
            <div className="font-semibold">{String((row.original as any).name ?? "")}</div>
            <div className="text-xs text-muted-foreground" dir="ltr">
              {String((row.original as any).id ?? "")}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "parentId",
        header: "Parent",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground" dir="ltr">
            {String((row.original as any).parentId ?? "—")}
          </span>
        ),
      },
      {
        accessorKey: "companyId",
        header: "companyId",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal text-xs" dir="ltr">
            {String((row.original as any).companyId ?? "")}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                const r = row.original as any
                setSelected(r)
                setName(String(r.name ?? ""))
                setParentId(String(r.parentId ?? ""))
                setEditOpen(true)
              }}
            >
              تعديل
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                setSelected(row.original as any)
                setDeleteOpen(true)
              }}
            >
              حذف
            </Button>
          </div>
        ),
      },
    ],
    [isPending],
  )

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="org-company">companyId *</Label>
            <Input
              id="org-company"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="الصق companyId هنا ثم اضغط تحميل"
              dir="ltr"
            />
          </div>
          <div className="flex items-end justify-end gap-2">
            <Button type="button" variant="outline" disabled={!canLoad || isPending} onClick={load}>
              {isPending ? "جارٍ التحميل…" : "تحميل"}
            </Button>
            <Button
              type="button"
              disabled={!canLoad || isPending}
              onClick={() => {
                setSelected(null)
                setName("")
                setParentId("")
                setCreateOpen(true)
              }}
            >
              إضافة إدارة
            </Button>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          أي إنشاء/تعديل/حذف يتطلب سبب (Reason) وسيتم تسجيله في سجل التدقيق (Audit Logs).
        </div>
      </div>

      <div className="rounded-lg border bg-card p-2">
        <DataTable columns={columns as any} data={rows as any} />
      </div>

      {(createOpen || editOpen) && (
        <div className="rounded-lg border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="org-name">اسم الإدارة</Label>
              <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: المبيعات" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="org-parent">parentId (اختياري)</Label>
              <Input
                id="org-parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                placeholder="uuid"
                dir="ltr"
              />
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            ملحوظة: حاليًا الربط بـ parentId يتم عبر UUID مباشرة (هنحسّنها لاحقًا لاختيار من القائمة).
          </div>
        </div>
      )}

      <ReasonDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="إضافة إدارة"
        description="اكتب سببًا واضحًا. سيتم تسجيل العملية في سجل التدقيق."
        confirmText="إنشاء"
        onConfirm={(reason) => {
          const cid = companyId.trim()
          const nm = name.trim()
          if (!cid || !nm) {
            toast.error("companyId واسم الإدارة مطلوبان")
            return
          }
          startTransition(() => {
            createPlatformAdminOrgUnit({
              companyId: cid,
              name: nm,
              parentId: parentId.trim() || undefined,
              reason,
            }).then((res) => {
              if (res.ok) {
                toast.success("تم إنشاء الإدارة")
                setCreateOpen(false)
                load()
              } else {
                toast.error("تعذّر إنشاء الإدارة")
              }
            })
          })
        }}
      />

      <ReasonDialog
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="تعديل الإدارة"
        description="اكتب سببًا واضحًا. سيتم تسجيل العملية في سجل التدقيق."
        confirmText="حفظ"
        onConfirm={(reason) => {
          const cid = companyId.trim()
          const id = String((selected as any)?.id ?? "")
          const nm = name.trim()
          if (!cid || !id || !nm) {
            toast.error("بيانات غير مكتملة")
            return
          }
          startTransition(() => {
            updatePlatformAdminOrgUnit(id, {
              companyId: cid,
              name: nm,
              parentId: parentId.trim() || undefined,
              reason,
            }).then((res) => {
              if (res.ok) {
                toast.success("تم تحديث الإدارة")
                setEditOpen(false)
                load()
              } else {
                toast.error("تعذّر تحديث الإدارة")
              }
            })
          })
        }}
      />

      <ReasonDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="حذف الإدارة"
        description="لن يمكن التراجع. سيتم تسجيل العملية في سجل التدقيق."
        confirmText="حذف"
        onConfirm={(reason) => {
          const id = String((selected as any)?.id ?? "")
          if (!id) return
          startTransition(() => {
            deletePlatformAdminOrgUnit(id, { reason }).then((res) => {
              if (res.ok) {
                toast.success("تم حذف الإدارة")
                setDeleteOpen(false)
                load()
              } else {
                toast.error("تعذّر حذف الإدارة")
              }
            })
          })
        }}
      />
    </div>
  )
}


