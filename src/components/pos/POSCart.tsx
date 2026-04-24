"use client"

import { useState } from "react"
import { usePOSStore } from "@/stores/posStore"
import { POSPaymentModal } from "./PaymentModal"
import { CustomerSelect } from "./CustomerSelect"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Minus, 
  Trash2, 
  UserPlus, 
  Tag, 
  Receipt,
  CreditCard,
  Banknote,
  History
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { saveHeldCart, getHeldCarts, deleteRemoteHeldCart } from "@/lib/actions/pos.actions"
import { useAuthStore } from "@/stores/authStore"
import { toast } from "sonner"
import { HeldCartsModal } from "./HeldCartsModal"

export function POSCart() {
  const { 
    cart, 
    customer, 
    removeItem, 
    updateQty, 
    getSummary,
    discountType,
    discountValue,
    setDiscount,
    updateItemPrice,
    updateItemDiscount,
    holdCart: localHoldCart,
    notes
  } = usePOSStore()

  const { profile } = useAuthStore()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isHeldCartsModalOpen, setIsHeldCartsModalOpen] = useState(false)
  const summary = getSummary()

  const handleHoldCart = async () => {
    if (cart.length === 0) return
    
    try {
      if (profile?.company_id && profile?.branch_id) {
        await saveHeldCart({
          company_id: profile.company_id,
          branch_id: profile.branch_id,
          customer_id: customer?.id || null,
          items: cart,
          total: summary.total,
          notes: notes,
        })
      }
      localHoldCart()
      toast.success("تم تعليق الطلب بنجاح")
    } catch (error) {
      console.error(error)
      toast.error("فشل تعليق الطلب")
    }
  }

  return (
    <>
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950/20">
      {/* Customer Area */}
      <div className="p-3 border-b bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold">{customer?.name || "عميل نقدي"}</span>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              رصيد: {customer?.balance?.toLocaleString() || "0.00"} ج
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 relative"
            onClick={() => setIsHeldCartsModalOpen(true)}
          >
            <History className="h-5 w-5" />
          </Button>
          <CustomerSelect />
        </div>
      </div>

      {/* Cart Items Area */}
      <ScrollArea className="flex-1 px-3 py-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50">
            <Receipt className="h-12 w-12 mb-3" />
            <p className="text-sm font-medium">السلة فارغة. ابدأ بإضافة أصناف</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className="bg-white dark:bg-slate-900 border rounded-lg p-2 flex flex-col gap-2 shadow-sm animate-in fade-in slide-in-from-right-2 duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold line-clamp-1">{item.name}</h4>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-[10px] text-primary font-medium hover:underline tabular-nums">
                          {item.unit_price?.toLocaleString()} ج
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold">تعديل السعر</label>
                          <Input 
                            type="number" 
                            defaultValue={item.unit_price} 
                            className="h-8 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateItemPrice(item.id, parseFloat((e.target as HTMLInputElement).value) || 0)
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <span className="text-sm font-black tabular-nums">
                    {item.lineTotal.toLocaleString()} ج
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums">
                      {item.quantity}
                    </span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                          <Tag className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold">خصم الصنف</label>
                            <Badge variant={"secondary"} className="text-[8px]">{item.discountType === 'percent' ? '%' : 'مبلغ'}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Input 
                              type="number" 
                              placeholder="0.00"
                              className="h-8 text-xs"
                              defaultValue={item.discountType === 'percent' ? (item.discountAmount / (item.unit_price * item.quantity) * 100) : item.discountAmount}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = parseFloat((e.target as HTMLInputElement).value) || 0
                                  updateItemDiscount(item.id, val, item.discountType)
                                }
                              }}
                            />
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 text-[10px]"
                              onClick={() => updateItemDiscount(item.id, 0, item.discountType === 'percent' ? 'amount' : 'percent')}
                            >
                              تبديل
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Summary Area */}
      <div className="bg-white dark:bg-slate-900 border-t p-4 space-y-3 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span className="font-medium tabular-nums">{summary.subtotal.toLocaleString()} ج</span>
          </div>
          
          <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded text-orange-700 dark:text-orange-400">
            <div className="flex items-center gap-2">
              <Tag className="h-3 w-3" />
              <button 
                className="text-xs font-bold underline"
                onClick={() => setDiscount(discountType === 'amount' ? 'percent' : 'amount', discountValue)}
              >
                خصم ({discountType === 'amount' ? 'مبلغ' : '%'})
              </button>
            </div>
            <div className="flex items-center gap-2">
               <Input 
                type="number" 
                className="h-6 w-16 text-[10px] p-1 text-center bg-white dark:bg-slate-800"
                value={discountValue}
                onChange={(e) => setDiscount(discountType, parseFloat(e.target.value) || 0)}
               />
               <span className="font-bold tabular-nums">-{summary.discountAmount.toLocaleString()} ج</span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">ضريبة القيمة المضافة (14%)</span>
            <span className="font-medium tabular-nums text-xs">{summary.taxAmount.toLocaleString()} ج</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center py-1">
          <span className="text-lg font-black italic">الإجمالي</span>
          <div className="text-right">
            <p className="text-2xl font-black text-primary tabular-nums tracking-tight">
              {summary.total.toLocaleString()} <span className="text-sm font-bold">ج</span>
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">شامل الضريبة</p>
          </div>
        </div>

        {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline"
              disabled={cart.length === 0}
              onClick={handleHoldCart}
              className="flex-1 h-16 text-orange-600 border-orange-200 hover:bg-orange-50 font-bold gap-2"
            >
              <History className="h-5 w-5" />
              تعليق
            </Button>
            <Button 
              disabled={cart.length === 0}
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex-[2] h-16 text-lg font-black shadow-lg shadow-primary/20 gap-3 group"
            >
              <Banknote className="h-6 w-6 group-hover:scale-110 transition-transform" />
              إتمام البيع
            </Button>
          </div>
        </div>
      </div>

      <POSPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      <HeldCartsModal 
        isOpen={isHeldCartsModalOpen}
        onClose={() => setIsHeldCartsModalOpen(false)}
      />
    </>
  )
}
