"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

interface HeldCartsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HeldCartsModal({ isOpen, onClose }: HeldCartsModalProps) {
  const [carts, setCarts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const { setHeldCarts: setLocalHeldCarts, resumeCart } = usePOSStore()

  const fetchCarts = async () => {
    if (!(user as any)?.company_id || !(user as any)?.branch_id) return
    setLoading(true)
    try {
      const data = await getHeldCarts((user as any).company_id, (user as any).branch_id)
      setCarts(data)
      setLocalHeldCarts(data.map((c: any) => ({
        id: c.id,
        items: c.items,
        customer: c.customers,
        createdAt: c.created_at,
        notes: c.notes
      })))
    } catch (error) {
      toast.error("فشل تحميل السلال المعلقة")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchCarts()
    }
  }, [isOpen])

  const handleResume = async (cartId: string) => {
    resumeCart(cartId)
    try {
      await deleteRemoteHeldCart(cartId)
      toast.success("تم استعادة الطلب")
      onClose()
    } catch (error) {
      toast.error("فشل حذف الطلب المعلق من السحابة")
    }
  }

  const handleDelete = async (cartId: string) => {
    try {
      await deleteRemoteHeldCart(cartId)
      setCarts(carts.filter(c => c.id !== cartId))
      toast.success("تم حذف الطلب المعلق")
    } catch (error) {
      toast.error("فشل حذف الطلب المعلق")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sm:max-h-[80vh] flex flex-col p-0 overflow-hidden font-cairo" dir="rtl">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-orange-600" />
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
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
              <ShoppingBag className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">لا توجد سلال معلقة حالياً</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {carts.map((cart) => (
                <div 
                  key={cart.id}
                  className="bg-white dark:bg-slate-900 border rounded-xl p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <User className="h-4 w-4 text-primary" />
                        {cart.customers?.name || "عميل نقدي"}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground tabular-nums">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(cart.created_at), "eeee, dd MMMM yyyy HH:mm", { locale: ar })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-primary tabular-nums">
                        {cart.total.toLocaleString()} <span className="text-xs">ج</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {cart.items.length} أصناف
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 gap-2 font-bold"
                      onClick={() => handleResume(cart.id)}
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      استعادة الطلب
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="text-destructive border-destructive/20 hover:bg-destructive/10"
                      onClick={() => handleDelete(cart.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
