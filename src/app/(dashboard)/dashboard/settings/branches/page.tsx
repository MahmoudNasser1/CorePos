"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin"
import { fetchBackendSessionAction } from "@/lib/actions/auth-session.actions"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Plus, Power, Star, MapPin, Phone } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function BranchesPage() {
  const queryClient = useQueryClient()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      if (!isMounted) return
      const session = await fetchBackendSessionAction()
      setReady(!!session?.user?.id)
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches"],
    enabled: ready,
    queryFn: async () => {
      return await adminApi.listBranches()
    },
  })

  const { data: company } = useQuery({
    queryKey: ["company-profile"],
    enabled: ready,
    queryFn: async () => {
      return await adminApi.getCompany()
    },
  })

  const addBranch = useMutation({
    mutationFn: async (formData: Record<string, string>) => {
      await adminApi.createBranch({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
      setIsAddOpen(false)
      toast.success("تم حفظ التغييرات")
    },
    onError: (err: Error) => {
      toast.error("تعذّر الحفظ. أعد المحاولة.")
      console.error(err)
    },
  })

  const setDefaultBranch = useMutation({
    mutationFn: async (branchId: string) => {
      await adminApi.updateCompany({ defaultBranchId: branchId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-profile"] })
      toast.success("تم تعيين الفرع كافتراضي للشركة")
    },
    onError: () => toast.error("تعذّر تعيين الفرع كافتراضي"),
  })

  const updateBranch = useMutation({
    mutationFn: async (payload: { id: string; name: string; address: string; phone: string }) => {
      await adminApi.updateBranch(payload.id, {
        name: payload.name,
        address: payload.address,
        phone: payload.phone,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
      setEditOpen(false)
      toast.success("تم حفظ التغييرات")
    },
    onError: (err: Error) => {
      toast.error("تعذّر الحفظ. أعد المحاولة.")
      console.error(err)
    },
  })

  const deactivateBranch = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.updateBranch(id, { isActive: false })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
      setConfirmOpen(false)
      toast.success("تم تعطيل الفرع")
    },
    onError: () => {
      toast.error("تعذّر التعطيل. أعد المحاولة.")
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">الفروع</h1>
          <p className="text-sm text-muted-foreground">إضافة فروع البيع وتعديل بيانات التواصل لكل فرع.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 self-start sm:self-auto">
              <Plus className="h-4 w-4" />
              إضافة فرع
            </Button>
          </DialogTrigger>
          <DialogContent className="font-cairo sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-semibold">إضافة فرع جديد</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                addBranch.mutate({
                  name: String(fd.get("name") || ""),
                  address: String(fd.get("address") || ""),
                  phone: String(fd.get("phone") || ""),
                })
              }}
              className="space-y-4 pt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="branch-name">اسم الفرع</Label>
                <Input id="branch-name" name="name" placeholder="مثال: فرع وسط البلد" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-address">العنوان</Label>
                <Input id="branch-address" name="address" placeholder="العنوان بالتفصيل" required />
                <p className="text-xs text-muted-foreground">يظهر في التقارير وعند الطباعة حسب الإعدادات.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-phone">رقم الهاتف</Label>
                <Input id="branch-phone" name="phone" placeholder="01xxxxxxxxx" required dir="ltr" className="text-end" />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="submit" disabled={addBranch.isPending} className="w-full sm:w-auto">
                  {addBranch.isPending ? "جاري الحفظ…" : "حفظ"}
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
          <DialogContent className="font-cairo sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-semibold">تعديل بيانات الفرع</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                if (!selected?.id) return
                updateBranch.mutate({
                  id: String(selected.id),
                  name: String(fd.get("name") || ""),
                  address: String(fd.get("address") || ""),
                  phone: String(fd.get("phone") || ""),
                })
              }}
              className="space-y-4 pt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="edit-branch-name">اسم الفرع</Label>
                <Input
                  id="edit-branch-name"
                  name="name"
                  defaultValue={selected?.name || ""}
                  placeholder="اسم الفرع"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-branch-address">العنوان</Label>
                <Input
                  id="edit-branch-address"
                  name="address"
                  defaultValue={selected?.address || ""}
                  placeholder="العنوان بالتفصيل"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-branch-phone">رقم الهاتف</Label>
                <Input
                  id="edit-branch-phone"
                  name="phone"
                  defaultValue={selected?.phone || ""}
                  placeholder="01xxxxxxxxx"
                  required
                  dir="ltr"
                  className="text-end"
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={updateBranch.isPending} className="w-full sm:w-auto">
                  {updateBranch.isPending ? "جاري الحفظ…" : "حفظ"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isLoading ? (
          <>
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </>
        ) : !branches?.length ? (
          <div className="col-span-full flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground">
            <p>لا توجد فروع مسجّلة بعد.</p>
            <p className="text-xs">أنشئ فرعًا من الزر أعلاه لربط المخازن والخزائن.</p>
          </div>
        ) : (
          branches?.map((branch) => (
            <Card key={branch.id} className="flex h-full flex-col border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-semibold">{branch.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {company?.id && company?.defaultBranchId === branch.id ? (
                      <Badge className="shrink-0 text-xs font-normal">افتراضي للشركة</Badge>
                    ) : null}
                    <Badge
                      variant={branch.isActive === false ? "outline" : "secondary"}
                      className="shrink-0 text-xs font-normal"
                    >
                      {branch.isActive === false ? "معطّل" : "نشط"}
                    </Badge>
                    <DropdownMenu dir="rtl">
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="فتح عمليات الفرع">
                          <MoreHorizontal className="h-4 w-4" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>العمليات</DropdownMenuLabel>
                        <DropdownMenuItem
                          disabled={branch.isActive === false || company?.defaultBranchId === branch.id}
                          onSelect={(e) => {
                            e.preventDefault()
                            setDefaultBranch.mutate(String(branch.id))
                          }}
                        >
                          <Star className="h-4 w-4" aria-hidden />
                          تعيين كافتراضي للشركة
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault()
                            setSelected(branch)
                            setEditOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={branch.isActive === false}
                          onSelect={(e) => {
                            e.preventDefault()
                            setSelected(branch)
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
                  <span>{branch.address || "—"}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-3 border-t border-border/60 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span dir="ltr" className="tabular-nums">
                    {branch.phone || "—"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  مرجع داخلي: {branch.id.slice(0, 8)}…
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => selected?.id && deactivateBranch.mutate(String(selected.id))}
        title="تعطيل الفرع"
        description="سيتم تعطيل الفرع ولن يظهر في الاختيارات الجديدة (الفواتير/المخازن). المتابعة؟"
        confirmText={deactivateBranch.isPending ? "جاري التعطيل..." : "تعطيل"}
        cancelText="إلغاء"
        variant="destructive"
      />
    </div>
  )
}
