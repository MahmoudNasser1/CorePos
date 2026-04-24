"use client"

import { usePOSStore } from "@/stores/posStore"
import { useAuthStore } from "@/stores/authStore"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

export const POSReceipt = forwardRef<HTMLDivElement>((props, ref) => {
  const { cart, customer, getSummary } = usePOSStore()
  const { company, profile } = useAuthStore()
  const summary = getSummary()
  const now = new Date().toLocaleString('ar-EG')

  return (
    <div 
      ref={ref} 
      className="hidden print:block w-[80mm] p-4 text-black bg-white font-sans text-[12px] leading-relaxed rtl"
      dir="rtl"
    >
      {/* Header */}
      <div className="text-center space-y-2 mb-4 border-b pb-4 border-dashed border-black/20">
        <h1 className="text-lg font-black tracking-tight">{company?.name || "CorePOS"}</h1>
        <p className="text-[10px] text-zinc-600">{company?.phone || ""} {company?.tax_number ? `- س.ت: ${company.tax_number}` : ""}</p>
        <div className="flex justify-between items-center text-[10px] font-bold mt-2">
          <span>فاتورة ضريبية مبسطة</span>
          <span>#2604-0025</span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 mb-4 text-[10px]">
        <div className="flex justify-between">
          <span className="text-zinc-500">التاريخ:</span>
          <span className="font-bold">{now}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">العميل:</span>
          <span className="font-bold">{customer?.name || "عميل نقدي"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">الكاشير:</span>
          <span className="font-bold">{profile?.full_name || "موظف مبيعات"}</span>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-4 border-b border-dashed border-black/20">
        <thead>
          <tr className="text-right border-b border-black">
            <th className="pb-1">الصنف</th>
            <th className="pb-1 text-center">الكمية</th>
            <th className="pb-1 text-left">الإجمالي</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-black/10">
          {cart.map((item) => (
            <tr key={item.id}>
              <td className="py-2">
                <div className="font-bold">{item.name}</div>
                <div className="text-[9px] text-zinc-500">{item.unit_price?.toLocaleString()} ج</div>
              </td>
              <td className="py-2 text-center font-bold">{item.quantity}</td>
              <td className="py-2 text-left font-bold">{item.lineTotal.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="space-y-1 mb-6">
        <div className="flex justify-between text-[11px]">
          <span>المجموع الفرعي:</span>
          <span className="font-bold">{summary.subtotal.toLocaleString()} ج</span>
        </div>
        {summary.discountAmount > 0 && (
          <div className="flex justify-between text-[11px]">
            <span>الخصم:</span>
            <span className="font-bold text-red-600">-{summary.discountAmount.toLocaleString()} ج</span>
          </div>
        )}
        <div className="flex justify-between text-[11px]">
          <span>الضريبة (14%):</span>
          <span className="font-bold">{summary.taxAmount.toLocaleString()} ج</span>
        </div>
        <div className="flex justify-between text-base font-black border-t border-black pt-2 mt-2">
          <span>الإجمالي النهائي:</span>
          <span>{summary.total.toLocaleString()} ج</span>
        </div>
      </div>

      {/* Footer / QR */}
      <div className="text-center space-y-4 pt-4 border-t border-dashed border-black/20">
        <div className="bg-zinc-100 h-24 w-24 mx-auto rounded flex items-center justify-center border">
           <span className="text-[10px] text-zinc-400">QR Code</span>
        </div>
        <p className="text-[10px] font-bold">شكراً لزيارتكم!</p>
        <p className="text-[8px] text-zinc-400 italic">Powerd by CorePOS</p>
      </div>

      {/* Special styles for Printing */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
})

POSReceipt.displayName = "POSReceipt"
