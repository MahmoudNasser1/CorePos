"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ReasonDialog } from "@/components/shared/ReasonDialog"
import { backendFetch } from "@/lib/api/backend-client"

type Snapshot = {
  roles: Array<{ id: string; name: string; isSystem: boolean; createdAt: string | null }>
  rolePermissions: Record<string, string[]>
  overrides: Array<{
    id: string
    userId: string
    permissionKey: string
    effect: string
    reason: string | null
    createdAt: string | null
  }>
  permissionKeys: string[]
}

export function RbacClient() {
  const [companyId, setCompanyId] = useState("")
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [isPending, startTransition] = useTransition()

  const [roleId, setRoleId] = useState("")
  const [rolePerms, setRolePerms] = useState("")
  const [roleOpen, setRoleOpen] = useState(false)

  const [userId, setUserId] = useState("")
  const [permissionKey, setPermissionKey] = useState("")
  const [effect, setEffect] = useState<"allow" | "deny">("allow")
  const [overrideOpen, setOverrideOpen] = useState(false)

  const canLoad = companyId.trim().length > 0

  const load = () => {
    const cid = companyId.trim()
    if (!cid) return
    startTransition(() => {
      backendFetch<{ success: true; data: Snapshot }>(`/platform-admin/rbac?companyId=${encodeURIComponent(cid)}`)
        .then((res) => {
          setSnapshot(res.data)
          const first = res.data.roles[0]?.id ?? ""
          setRoleId(first)
          setRolePerms((res.data.rolePermissions[first] ?? []).join("\n"))
        })
        .catch(() => toast.error("تعذّر تحميل RBAC"))
    })
  }

  const roleOptions = useMemo(() => snapshot?.roles ?? [], [snapshot])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="rbac-company">companyId *</Label>
            <Input
              id="rbac-company"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="الصق companyId ثم اضغط تحميل"
              dir="ltr"
            />
          </div>
          <div className="flex items-end justify-end gap-2">
            <Button type="button" variant="outline" disabled={!canLoad || isPending} onClick={load}>
              {isPending ? "جارٍ التحميل…" : "تحميل"}
            </Button>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          أي تعديل RBAC يتطلب سبب (Reason) وسيتم تسجيله في سجل التدقيق (Audit).
        </div>
      </div>

      {snapshot ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold">صلاحيات Role</div>
              <Button type="button" size="sm" disabled={!roleId || isPending} onClick={() => setRoleOpen(true)}>
                حفظ الصلاحيات
              </Button>
            </div>

            <div className="space-y-1">
              <Label>roleId</Label>
              <div className="flex flex-wrap gap-2">
                {roleOptions.map((r) => (
                  <Button
                    key={r.id}
                    type="button"
                    size="sm"
                    variant={r.id === roleId ? "default" : "outline"}
                    onClick={() => {
                      setRoleId(r.id)
                      setRolePerms((snapshot.rolePermissions[r.id] ?? []).join("\n"))
                    }}
                  >
                    {r.name}
                  </Button>
                ))}
              </div>
              {roleId ? (
                <div className="text-xs text-muted-foreground mt-2" dir="ltr">
                  {roleId}
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <Label>permission keys (سطر لكل key)</Label>
              <Textarea
                value={rolePerms}
                onChange={(e) => setRolePerms(e.target.value)}
                placeholder="inventory.read\nsales.write\n..."
                className="min-h-[220px]"
                dir="ltr"
              />
              <div className="text-xs text-muted-foreground">
                المفاتيح المتاحة:{" "}
                {(snapshot.permissionKeys ?? []).slice(0, 6).map((k) => (
                  <Badge key={k} variant="outline" className="mx-1 font-normal" dir="ltr">
                    {k}
                  </Badge>
                ))}
                {snapshot.permissionKeys.length > 6 ? "…" : null}
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold">User override</div>
              <Button type="button" size="sm" disabled={isPending} onClick={() => setOverrideOpen(true)}>
                تطبيق override
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="rbac-user">userId</Label>
                <Input id="rbac-user" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="uuid" dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="rbac-key">permissionKey</Label>
                <Input
                  id="rbac-key"
                  value={permissionKey}
                  onChange={(e) => setPermissionKey(e.target.value)}
                  placeholder="inventory.write"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="rbac-effect">effect</Label>
                <Input id="rbac-effect" value={effect} readOnly dir="ltr" />
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant={effect === "allow" ? "default" : "outline"} onClick={() => setEffect("allow")}>
                    allow
                  </Button>
                  <Button type="button" size="sm" variant={effect === "deny" ? "default" : "outline"} onClick={() => setEffect("deny")}>
                    deny
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="text-sm font-semibold mb-2">Overrides الحالية</div>
              <div className="space-y-2">
                {snapshot.overrides.slice(0, 20).map((o) => (
                  <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                    <div className="text-xs" dir="ltr">
                      <Badge variant="outline" className="font-normal">
                        {o.effect}
                      </Badge>{" "}
                      {o.permissionKey} — {o.userId}
                    </div>
                    <div className="text-xs text-muted-foreground">{o.reason ?? "—"}</div>
                  </div>
                ))}
                {snapshot.overrides.length === 0 ? (
                  <div className="text-sm text-muted-foreground">لا يوجد overrides</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ReasonDialog
        isOpen={roleOpen}
        onClose={() => setRoleOpen(false)}
        title="حفظ صلاحيات Role"
        description="سيتم استبدال صلاحيات الـ Role بالكامل وتسجيل العملية في Audit."
        confirmText="حفظ"
        onConfirm={(reason) => {
          const cid = companyId.trim()
          if (!cid || !roleId) return
          const permissions = rolePerms
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
          setRoleOpen(false)
          startTransition(() => {
            backendFetch(`/platform-admin/rbac`, {
              method: "PATCH",
              body: { companyId: cid, kind: "role_permissions", roleId, permissions, reason },
            })
              .then(() => {
                toast.success("تم حفظ الصلاحيات")
                load()
              })
              .catch(() => toast.error("تعذّر حفظ الصلاحيات"))
          })
        }}
      />

      <ReasonDialog
        isOpen={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        title="تطبيق User override"
        description="سيتم تسجيل العملية في Audit."
        confirmText="تطبيق"
        onConfirm={(reason) => {
          const cid = companyId.trim()
          const uid = userId.trim()
          const key = permissionKey.trim()
          if (!cid || !uid || !key) {
            toast.error("companyId + userId + permissionKey مطلوبين")
            return
          }
          setOverrideOpen(false)
          startTransition(() => {
            backendFetch(`/platform-admin/rbac`, {
              method: "PATCH",
              body: { companyId: cid, kind: "user_override", userId: uid, permissionKey: key, effect, reason },
            })
              .then(() => {
                toast.success("تم تطبيق override")
                load()
              })
              .catch(() => toast.error("تعذّر تطبيق override"))
          })
        }}
      />
    </div>
  )
}

