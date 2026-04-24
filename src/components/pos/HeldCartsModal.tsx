"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePOSStore } from "@/stores/posStore"
import { useAuthStore } from "@/stores/authStore"
import { getHeldCarts, deleteRemoteHeldCart } from "@/lib/actions/pos.actions"
import { ShoppingBag, Trash2, Calendar, User, ArrowRightLeft } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

interface HeldCartsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HeldCartsModal({ isOpen, onClose }: HeldCartsModalProps) {
  const [carts, setCarts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { setHeldCarts: setLocalHeldCarts, resumeCart } = usePOSStore()

  const fetchCarts = async () => {
    if (!(user as any)?.company_id || !(user as any)?.branch_id) return
    setLoading(true)
    try {
      const data = await getHeldCarts((user as any).company_id, (user as any).branch_id)
      setCarts(data)
      setLocalHeldCarts(
        data.map((c: any) => ({
          id: c.id,
          items: c.items,
          customer: c.customers,
          createdAt: c.created_at,
          notes: c.notes,
        })),
      )
    } catch {
      toast.error("فشل تحميل السلال المعلقة")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      void fetchCarts()
    }
  }, [isOpen])

  const handleResume = async (cartId: string) => {
    resumeCart(cartId)
    try {
      await deleteRemoteHeldCart(cartId)
      toast.success("تم استعادة الطلب")
      onClose()
    } catch {
      toast.error("فشل حذف الطلب المعلق من السحابة")
    }
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    try {
      await deleteRemoteHeldCart(deleteTargetId)
      setCarts((prev) => prev.filter((c) => c.id !== deleteTargetId))
      toast.success("تم حذف السلة المعلقة")
    } catch {
      toast.error("فشل حذف الطلب المعلق")
    } finally {
      setDeleteTargetId(null)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col overflow-hidden p-0 font-cairo" dir="rtl">
          <DialogHeader className="border-b p-4">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 shrink-0 text-orange-600" aria-hidden />
              السلال المعلقة
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : carts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-60">
                <ShoppingBag className="mb-4 h-16 w-16" aria-hidden />
                <p className="text-lg font-medium">لا توجد سلال معلقة حالياً</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {carts.map((cart) => (
                  <div
                    key={cart.id}
                    className="group flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <User className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                          {cart.customers?.name || "عميل نقدي"}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground tabular-nums">
                          <Calendar className="h-3 w-3 shrink-0" aria-hidden />
                          {format(new Date(cart.created_at), "eeee, dd MMMM yyyy HH:mm", { locale: ar })}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="text-lg font-black text-primary tabular-nums">
                          {formatCurrency(Number(cart.total ?? 0))}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{cart.items.length} أصناف</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" className="flex-1 gap-2 font-bold" onClick={() => handleResume(cart.id)}>
                        <ArrowRightLeft className="h-4 w-4 shrink-0" aria-hidden />
                        استئناف
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="border-destructive/20 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTargetId(cart.id)}
                        aria-label="حذف السلة المعلقة"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف السلة المعلقة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف السلة نهائيًا ولن تظهر في القائمة. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel type="button">إلغاء</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDelete()}
            >
              حذف نهائي
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
