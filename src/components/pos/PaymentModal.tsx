"use client"

import { useState, useEffect } from "react"
import { usePOSStore } from "@/stores/posStore"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Banknote, 
  CreditCard, 
  History, 
  CheckCircle2, 
  Printer,
  X,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createPOSInvoice } from "@/lib/actions/pos.actions"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/authStore"

interface POSPaymentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function POSPaymentModal({ isOpen, onClose }: POSPaymentModalProps) {
  const { cart, getSummary, customer, clearCart, isProcessing, setProcessing } = usePOSStore()
  const { profile } = useAuthStore()
  const summary = getSummary()
  
  const [receivedAmount, setReceivedAmount] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'deferred'>('cash')
  const [isSuccess, setIsSuccess] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState<string>("")

  const received = parseFloat(receivedAmount) || 0
  const change = received - summary.total

  useEffect(() => {
    if (isOpen) {
      setReceivedAmount(summary.total.toString())
      setIsSuccess(false)
    }
  }, [isOpen, summary.total])

  const handleCompletePayment = async () => {
    setProcessing(true)
    try {
      if (process.env.NEXT_PUBLIC_E2E_MOCK_POS_SALE === '1') {
        setIsSuccess(true)
        setInvoiceNumber('2604-001')
        toast.success('تم حفظ الفاتورة بنجاح')
        return
      }

      const result = await createPOSInvoice({
        customer_id: customer?.id || null,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.lineTotal
        })),
        total_amount: summary.total,
        tax_amount: summary.taxAmount,
        discount_amount: summary.discountAmount,
        payment_method: paymentMethod,
        company_id: profile?.company_id as any,
        branch_id: profile?.branch_id as any
      })

      if (result.success) {
        setIsSuccess(true)
        setInvoiceNumber(result.invoiceNumber || "")
        toast.success("تم حفظ الفاتورة بنجاح")
        
        // Auto-print after a short delay to let the success screen render
        setTimeout(() => {
          window.print()
        }, 500)
      } else {
        toast.error(result.error || "فشل حفظ الفاتورة")
      }
    } catch (error: any) {
       toast.error(error.message || "حدث خطأ غير متوقع")
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    if (isSuccess) clearCart()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        {!isSuccess ? (
          <>
            <DialogHeader className="p-6 bg-slate-50 dark:bg-slate-900 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-black">إتمام عملية الدفع</DialogTitle>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">الإجمالي المطلوب</p>
                  <p className="text-2xl font-black text-primary tabular-nums">{summary.total.toLocaleString()} ج</p>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-6">
              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                    paymentMethod === 'cash' ? "border-primary bg-primary/5 text-primary" : "hover:border-slate-300"
                  )}
                >
                  <Banknote className="h-6 w-6" />
                  <span className="text-xs font-bold">نقدي</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                    paymentMethod === 'card' ? "border-primary bg-primary/5 text-primary" : "hover:border-slate-300"
                  )}
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="text-xs font-bold">بطاقة</span>
                </button>
                <button
                  disabled={!customer}
                  onClick={() => setPaymentMethod('deferred')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                    paymentMethod === 'deferred' ? "border-primary bg-primary/5 text-primary" : "hover:border-slate-300",
                    !customer && "opacity-50 cursor-not-allowed border-dashed"
                  )}
                >
                  <History className="h-6 w-6" />
                  <span className="text-xs font-bold">آجـل</span>
                </button>
              </div>

              {/* Amount Inputs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">المبلغ المستلم</Label>
                  <div className="relative">
                    <Banknote className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      type="number"
                      className="text-2xl font-black tabular-nums h-14 pr-11 bg-slate-50 border-2 focus-visible:ring-primary"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl flex justify-between items-center border border-dashed">
                  <span className="text-sm font-bold text-muted-foreground">المبلغ المتبقي (الفكة)</span>
                  <span className={cn(
                    "text-2xl font-black tabular-nums",
                    change >= 0 ? "text-green-600" : "text-red-500"
                  )}>
                    {change.toLocaleString()} ج
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
              <Button variant="ghost" onClick={handleClose} disabled={isProcessing} className="flex-1 h-12">إلغاء</Button>
              <Button 
                onClick={handleCompletePayment} 
                disabled={isProcessing || change < 0 && paymentMethod !== 'deferred'} 
                className="flex-[2] h-12 text-lg font-bold gap-2"
              >
                {isProcessing ? "جاري الحفظ..." : "تأكيد الدفع وطباعة"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black">تم البيع بنجاح!</h2>
              {invoiceNumber && (
                <p className="text-muted-foreground">رقم الفاتورة: <span className="font-bold text-foreground">{invoiceNumber}</span></p>
              )}
            </div>
            
            {change > 0 && (
              <div className="bg-green-50 dark:bg-green-950/20 px-6 py-3 rounded-full border border-green-200 text-green-700 dark:text-green-400 font-bold">
                الباقي للعميل: {change.toLocaleString()} ج
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="outline" size="lg" className="h-14 gap-2" onClick={() => window.print()}>
                <Printer className="h-5 w-5" />
                إعادة طباعة
              </Button>
              <Button size="lg" className="h-14 gap-2" onClick={handleClose}>
                فاتورة جديدة
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
