"use client"

import { usePOSStore } from "@/stores/posStore"
import { POSHeader } from "@/components/pos/Header"
import { POSProductGrid } from "@/components/pos/POSProductGrid"
import { POSCart } from "@/components/pos/POSCart"
import { POSReceipt } from "@/components/pos/POSReceipt"
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner"
import { getProductByBarcode } from "@/lib/actions/pos.actions"
import { toast } from "sonner"
import { audioService } from "@/lib/audio"
import type { Product } from "@/types/pos.types"

export default function POSPage() {
  const { addItem, isProcessing } = usePOSStore()
  // Handle barcode scanning globally on this page
  useBarcodeScanner({
    onScan: async (barcode) => {
      try {
        const product = await getProductByBarcode(barcode)
        if (product) {
          addItem(product as unknown as Product)
          audioService.playSuccess()
          toast.success(`تمت إضافة: ${product.name}`)
        } else {
          audioService.playError()
          toast.error("لم يُعثر على المنتج — جرّب البحث بالاسم")
        }
      } catch {
        audioService.playError()
        toast.error("تعذّر الاتصال. جرّب مرة أخرى.")
      }
    },
    enabled: !isProcessing
  })

  return (
    <>
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-slate-100 print:hidden dark:bg-slate-950">
      {/* Header Area */}
      <POSHeader />

      {/* Main Content Area */}
      <main className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 lg:flex-row">
        {/* المنتجات: تأخذ الارتفاع المتبقي على الموبايل؛ بجانب السلة على الشاشات الواسعة */}
        <div className="flex min-h-[45vh] flex-1 flex-col overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-900 lg:min-h-0">
          <POSProductGrid />
        </div>

        <div className="flex h-[min(42vh,420px)] min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-900 lg:h-auto lg:w-[min(100%,450px)] lg:shrink-0">
          <POSCart />
        </div>
      </main>
    </div>
      {/* إيصال الطباعة: يظهر في معاينة الطباعة فقط (T4.21) */}
      <POSReceipt />
    </>
  )
}
