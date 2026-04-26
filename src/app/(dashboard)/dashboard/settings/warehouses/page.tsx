"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin"
import { fetchBackendSessionAction } from "@/lib/actions/auth-session.actions"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Plus, Power, Star, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function WarehousesPage() {
  const queryClient = useQueryClient()
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [form, setForm] = useState<{ name: string; branchId: string; isDefault: boolean; isActive: boolean }>({
    name: "",
    branchId: "",
    isDefault: false,
    isActive: true,
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const session = await fetchBackendSessionAction()
      if (mounted) setReady(!!session?.user?.id)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["warehouses"],
    enabled: ready,
    queryFn: async () => {
      return await adminApi.listWarehouses()
    },
  })

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    enabled: ready && open,
    queryFn: async () => {
      return await adminApi.listBranches()
    },
  })

  const branchesList = Array.isArray(branches) ? branches : []
  const hasBranches = branchesList.length > 0

  const createWarehouse = useMutation({
    mutationFn: async () => {
      const name = form.name.trim()
      const branchId = form.branchId
      if (!name) throw new Error("اسم المستودع مطلوب")
      if (!branchId) throw new Error("اختر الفرع أولًا")
      await adminApi.createWarehouse({
        name,
        branchId,
        isDefault: form.isDefault,
        isActive: form.isActive,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["warehouses"] })
      setOpen(false)
      setForm({ name: "", branchId: "", isDefault: false, isActive: true })
      toast.success("تم إنشاء المستودع")
    },
    onError: (err: any) => {
      toast.error(err?.message || "تعذّر إنشاء المستودع")
    },
  })

  const updateWarehouse = useMutation({
    mutationFn: async (payload: { id: string; name: string }) => {
      await adminApi.updateWarehouse(payload.id, { name: payload.name })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["warehouses"] })
      setEditOpen(false)
      toast.success("تم حفظ التغييرات")
    },
    onError: (err: any) => {
      toast.error(err?.message || "تعذّر الحفظ")
    },
  })

  const setDefaultWarehouse = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.updateWarehouse(id, { isDefault: true })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["warehouses"] })
      toast.success("تم تعيين المستودع كافتراضي")
    },
    onError: () => toast.error("تعذّر تعيين الافتراضي"),
  })

  const deactivateWarehouse = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.updateWarehouse(id, { isActive: false, isDefault: false })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["warehouses"] })
      setConfirmOpen(false)
      toast.success("تم تعطيل المستودع")
    },
    onError: () => toast.error("تعذّر التعطيل"),
  })

  useEffect(() => {
    if (!open) return
    const first = branchesList[0]
    if (first?.id && !form.branchId) {
      setForm((s) => ({ ...s, branchId: String(first.id) }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync default branch when dialog opens
  }, [open, branchesList])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">المخازن</h1>
          <p className="text-sm text-muted-foreground">المستودعات المرتبطة بكل فرع.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v)
            if (!v) setForm({ name: "", branchId: "", isDefault: false, isActive: true })
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2 self-start sm:self-auto" disabled={!ready}>
              <Plus className="h-4 w-4" />
              إضافة مستودع
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة مستودع جديد</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                createWarehouse.mutate()
              }}
              className="space-y-4 pt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="wh-name">اسم المستودع</Label>
                <Input
                  id="wh-name"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="مثال: المخزن الرئيسي"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh-branch">الفرع</Label>
                {hasBranches ? (
                  <select
                    id="wh-branch"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.branchId}
                    onChange={(e) => setForm((s) => ({ ...s, branchId: e.target.value }))}
                    required
                  >
                    <option value="" disabled>
                      اختر الفرع…
                    </option>
                    {branchesList.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
                    لا يوجد فروع بعد. أضف فرعًا أولًا ثم ارجع لإنشاء المستودع.
                    <div className="mt-2">
                      <Button asChild variant="secondary" size="sm">
                        <Link href="/dashboard/settings/branches">إضافة فرع</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((s) => ({ ...s, isDefault: e.target.checked }))}
                />
                تعيينه كافتراضي لهذا الفرع
              </label>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createWarehouse.isPending}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createWarehouse.isPending || !hasBranches}>
                  {createWarehouse.isPending ? "جاري الحفظ…" : "حفظ"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={editOpen}
          onOpenChange={(v) => {
            setEditOpen(v)
            if (!v) setSelected(null)
          }}
        >
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل المستودع</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                if (!selected?.id) return
                updateWarehouse.mutate({
                  id: String(selected.id),
                  name: String(fd.get("name") || "").trim(),
                })
              }}
              className="space-y-4 pt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-wh-name">اسم المستودع</Label>
                <Input id="edit-wh-name" name="name" defaultValue={selected?.name || ""} required />
              </div>
              <div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
                الفرع: <span className="font-semibold text-foreground">{selected?.branchName || "—"}</span>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={updateWarehouse.isPending}>
                  {updateWarehouse.isPending ? "جاري الحفظ…" : "حفظ"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {!ready || isLoading ? (
          <>
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </>
        ) : warehouses?.length === 0 ? (
          <div className="col-span-full flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground">
            لا توجد مستودعات مسجّلة حاليًا
          </div>
        ) : (
          warehouses?.map((warehouse) => (
            <Card key={warehouse.id} className="flex h-full flex-col border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-semibold">{warehouse.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={warehouse.isDefault ? "default" : "outline"}
                      className="shrink-0 text-xs font-normal"
                    >
                      {warehouse.isDefault ? "افتراضي" : "فرعي"}
                    </Badge>
                    <DropdownMenu dir="rtl">
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="فتح عمليات المستودع">
                          <MoreHorizontal className="h-4 w-4" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>العمليات</DropdownMenuLabel>
                        <DropdownMenuItem
                          disabled={warehouse.isDefault}
                          onSelect={(e) => {
                            e.preventDefault()
                            setDefaultWarehouse.mutate(String(warehouse.id))
                          }}
                        >
                          <Star className="h-4 w-4" aria-hidden />
                          تعيين كافتراضي
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault()
                            setSelected(warehouse)
                            setEditOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={warehouse.isActive === false}
                          onSelect={(e) => {
                            e.preventDefault()
                            setSelected(warehouse)
                            setConfirmOpen(true)
                          }}
                        >
                          <Power className="h-4 w-4" aria-hidden />
                          تعطيل
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription className="flex items-start gap-2 pt-1 text-sm">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{warehouse.branchName || "—"}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto border-t border-border/60 pt-4">
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  مرجع داخلي: {warehouse.id.slice(0, 8)}…
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => selected?.id && deactivateWarehouse.mutate(String(selected.id))}
        title="تعطيل المستودع"
        description="سيتم تعطيل المستودع ولن يظهر في الاختيارات الجديدة. المتابعة؟"
        confirmText={deactivateWarehouse.isPending ? "جاري التعطيل..." : "تعطيل"}
        cancelText="إلغاء"
        variant="destructive"
      />
    </div>
  )
}
