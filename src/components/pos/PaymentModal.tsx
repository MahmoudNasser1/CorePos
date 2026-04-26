"use client"

import { useState, useEffect } from "react"
import { usePOSStore } from "@/stores/posStore"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Banknote, CreditCard, History, CheckCircle2, Printer, ArrowRight, Loader2, Landmark, ReceiptText } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { createPOSInvoice } from "@/lib/actions/pos.actions"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/authStore"
import { getPaymentMethods, type PaymentMethodRow } from "@/lib/actions/finance-variables.actions"

interface POSPaymentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function POSPaymentModal({ isOpen, onClose }: POSPaymentModalProps) {
  const { cart, getSummary, customer, clearCart, isProcessing, setProcessing, setLastInvoiceNumber } = usePOSStore()
  const { profile } = useAuthStore()
  const summary = getSummary()

  const [receivedAmount, setReceivedAmount] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "check" | "deferred">("cash")
  const [isSuccess, setIsSuccess] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState<string>("")
  const [methods, setMethods] = useState<PaymentMethodRow[]>([])

  const received = parseFloat(receivedAmount) || 0
  const change = received - summary.total

  useEffect(() => {
    if (isOpen) {
      setReceivedAmount(summary.total.toString())
      setIsSuccess(false)
      setInvoiceNumber("")
      setLastInvoiceNumber(null)

      const load = async () => {
        try {
          const list = await getPaymentMethods()
          setMethods(Array.isArray(list) ? list : [])
        } catch {
          setMethods([])
        }
      }
      void load()
    }
  }, [isOpen, summary.total, setLastInvoiceNumber])

  const visibleMethods = methods
    .filter((m) => (m as any)?.is_active !== false && String((m as any)?.code ?? "") !== "deferred")
    .sort((a, b) => Number((a as any).sort_order ?? 0) - Number((b as any).sort_order ?? 0))

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isSuccess) clearCart()
      onClose()
    }
  }

  const handleCompletePayment = async () => {
    const busy = usePOSStore.getState().isProcessing
    if (busy) return

    setProcessing(true)
    try {
      if (process.env.NEXT_PUBLIC_E2E_MOCK_POS_SALE === "1") {
        setIsSuccess(true)
        setInvoiceNumber("2604-001")
        setLastInvoiceNumber("2604-001")
        toast.success("تمت عملية البيع بنجاح")
        return
      }

      const result = await createPOSInvoice({
        customer_id: customer?.id || null,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.lineTotal,
        })),
        total_amount: summary.total,
        tax_amount: summary.taxAmount,
        discount_amount: summary.discountAmount,
        payment_method: paymentMethod,
        company_id: profile?.company_id as any,
        branch_id: profile?.branch_id as any,
      })

      if (result.success) {
        setIsSuccess(true)
        const num = result.invoiceNumber || ""
        setInvoiceNumber(num)
        setLastInvoiceNumber(num)
        toast.success("تمت عملية البيع بنجاح")
      } else {
        toast.error(result.error || "تعذّر تسجيل البيع. تحقق من الاتصال")
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : ""
      if (msg && /fetch|network/i.test(msg)) {
        toast.error("تعذّر الاتصال. جرّب مرة أخرى.")
      } else {
        toast.error("تعذّر تسجيل البيع. تحقق من الاتصال")
      }
    } finally {
      setProcessing(false)
    }
  }

  const confirmDisabled =
    isProcessing || (change < 0 && paymentMethod !== "deferred")

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden border-none p-0 shadow-2xl max-h-[100dvh] sm:max-h-[90vh] sm:max-w-[500px] flex flex-col" dir="rtl">
        {!isSuccess ? (
          <>
            <DialogHeader className="border-b bg-slate-50 p-6 dark:bg-slate-900 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-2xl font-black">دفع الفاتورة</DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">اختر طريقة الدفع ثم أكّد المبلغ</p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-muted-foreground">المبلغ المستحق</p>
                  <p className="text-2xl font-black tabular-nums text-primary">
                    {formatCurrency(summary.total)}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {visibleMethods.map((m) => {
                  const code = String((m as any)?.code ?? "")
                  const label = String((m as any)?.name ?? code)
                  const icon =
                    code === "cash" ? (
                      <Banknote className="h-6 w-6 shrink-0" aria-hidden />
                    ) : code === "card" ? (
                      <CreditCard className="h-6 w-6 shrink-0" aria-hidden />
                    ) : code === "transfer" ? (
                      <Landmark className="h-6 w-6 shrink-0" aria-hidden />
                    ) : code === "check" ? (
                      <ReceiptText className="h-6 w-6 shrink-0" aria-hidden />
                    ) : (
                      <Banknote className="h-6 w-6 shrink-0" aria-hidden />
                    )

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(code as any)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all",
                        paymentMethod === code ? "border-primary bg-primary/5 text-primary" : "hover:border-slate-300",
                      )}
                    >
                      {icon}
                      <span className="text-xs font-bold">{label}</span>
                    </button>
                  )
                })}

                <button
                  type="button"
                  disabled={!customer}
                  title={!customer ? "اختر عميلاً لاستخدام البيع الآجل" : undefined}
                  onClick={() => customer && setPaymentMethod("deferred")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all",
                    paymentMethod === "deferred" ? "border-primary bg-primary/5 text-primary" : "hover:border-slate-300",
                    !customer && "cursor-not-allowed border-dashed opacity-50",
                  )}
                >
                  <History className="h-6 w-6 shrink-0" aria-hidden />
                  <span className="text-xs font-bold">آجل</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">المبلغ المستلم</Label>
                  <div className="relative">
                    <Banknote
                      className="pointer-events-none absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      type="number"
                      className="h-14 border-2 bg-slate-50 pe-11 text-2xl font-black tabular-nums focus-visible:ring-primary dark:bg-slate-900"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-dashed bg-slate-50 p-4 dark:bg-slate-900">
                  <span className="text-sm font-bold text-muted-foreground">الباقي (فكة)</span>
                  <span
                    className={cn(
                      "text-2xl font-black tabular-nums",
                      change >= 0 ? "text-green-600" : "text-red-500",
                    )}
                  >
                    {formatCurrency(change)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-3 p-6 pt-0 sm:flex-row shrink-0 mt-4 sm:mt-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isProcessing}
                className="h-12 flex-1"
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={handleCompletePayment}
                disabled={confirmDisabled}
                aria-busy={isProcessing}
                className="h-12 flex-[2] gap-2 text-lg font-bold disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
                    جاري تسجيل البيع…
                  </>
                ) : (
                  <>تأكيد الدفع</>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6 p-10 duration-300 animate-in zoom-in-95">
            <div className="mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-16 w-16 text-green-600" aria-hidden />
            </div>
            <div className="space-y-3 text-center">
              <h2 className="text-2xl font-black">تمت عملية البيع بنجاح</h2>
              {invoiceNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">رقم الفاتورة</p>
                  <p className="text-2xl font-black tabular-nums tracking-tight">{invoiceNumber}</p>
                </div>
              )}
            </div>

            {change > 0 && paymentMethod === "cash" && (
              <div className="rounded-full border border-green-200 bg-green-50 px-6 py-3 font-bold text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400">
                الباقي للعميل: {formatCurrency(change)}
              </div>
            )}

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" size="lg" className="h-14 gap-2" onClick={() => window.print()}>
                <Printer className="h-5 w-5 shrink-0" aria-hidden />
                طباعة
              </Button>
              <Button type="button" size="lg" className="h-14 gap-2" onClick={() => handleOpenChange(false)}>
                فاتورة جديدة
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
