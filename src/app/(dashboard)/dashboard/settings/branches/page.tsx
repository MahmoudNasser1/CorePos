"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin"
import { fetchBackendSessionAction } from "@/lib/actions/auth-session.actions"
import { Button } from "@/components/ui/button"
import { Plus, MapPin, Phone } from "lucide-react"
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

export default function BranchesPage() {
  const queryClient = useQueryClient()
  const [isAddOpen, setIsAddOpen] = useState(false)
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
                  <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                    نشط
                  </Badge>
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
    </div>
  )
}
