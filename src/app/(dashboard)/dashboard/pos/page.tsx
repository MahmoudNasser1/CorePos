"use client"

import { usePOSStore } from "@/stores/posStore"
import { POSHeader } from "@/components/pos/Header"
import { POSProductGrid } from "@/components/pos/POSProductGrid"
import { POSCart } from "@/components/pos/POSCart"
import { POSReceipt } from "@/components/pos/POSReceipt"
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner"
import { getProductByBarcode } from "@/lib/actions/pos.actions"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { audioService } from "@/lib/audio"

export default function POSPage() {
  const { addItem, isProcessing } = usePOSStore()
  const receiptRef = useRef<HTMLDivElement>(null)

  // Handle barcode scanning globally on this page
  useBarcodeScanner({
    onScan: async (barcode) => {
      try {
        const product = await getProductByBarcode(barcode)
        if (product) {
          addItem(product)
          audioService.playSuccess()
          toast.success(`تمت إضافة: ${product.name}`)
        } else {
          audioService.playError()
          toast.error("المنتج غير موجود أو غير مفعل")
        }
      } catch (error) {
        audioService.playError()
        toast.error("خطأ أثناء البحث عن المنتج")
      }
    },
    enabled: !isProcessing
  })

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Header Area */}
      <POSHeader />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* Right side: Products (RTL) */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden">
          <POSProductGrid />
        </div>

        {/* Left side: Cart (RTL) */}
        <div className="w-[450px] flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden">
          <POSCart />
        </div>
      </main>

      {/* Hidden Receipt Component for Printing */}
      <POSReceipt ref={receiptRef} />
    </div>
  )
}
