"use client"

import { usePOSStore } from "@/stores/posStore"
import { useAuthStore } from "@/stores/authStore"
import { forwardRef } from "react"
import { formatCurrency } from "@/lib/utils"

export const POSReceipt = forwardRef<HTMLDivElement>((props, ref) => {
  const { cart, customer, getSummary } = usePOSStore()
  const { company, profile } = useAuthStore()
  const summary = getSummary()
  const now = new Date().toLocaleString('ar-EG')

  return (
    <div
      ref={ref}
      className="hidden w-[80mm] max-w-[80mm] bg-white p-4 font-sans text-[12px] leading-relaxed text-black print:block rtl"
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
            <th className="pb-1 text-start">الإجمالي</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-black/10">
          {cart.map((item) => (
            <tr key={item.id}>
              <td className="py-2">
                <div className="font-bold">{item.name}</div>
                <div className="text-[9px] text-zinc-500 tabular-nums">
                  {formatCurrency(Number(item.unit_price ?? 0))}
                </div>
              </td>
              <td className="py-2 text-center font-bold tabular-nums">{item.quantity}</td>
              <td className="py-2 text-start font-bold tabular-nums">
                {formatCurrency(Number(item.lineTotal ?? 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="space-y-1 mb-6">
        <div className="flex justify-between text-[11px]">
          <span>المجموع الفرعي:</span>
          <span className="font-bold tabular-nums">{formatCurrency(summary.subtotal)}</span>
        </div>
        {summary.discountAmount > 0 && (
          <div className="flex justify-between text-[11px]">
            <span>الخصم:</span>
            <span className="font-bold text-red-600 tabular-nums">-{formatCurrency(summary.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-[11px]">
          <span>الضريبة:</span>
          <span className="font-bold tabular-nums">{formatCurrency(summary.taxAmount)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-black pt-2 text-base font-black">
          <span>الإجمالي النهائي:</span>
          <span className="tabular-nums">{formatCurrency(summary.total)}</span>
        </div>
      </div>

      {/* Footer / QR */}
      <div className="text-center space-y-4 pt-4 border-t border-dashed border-black/20">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded border bg-zinc-100">
          <span className="text-[10px] text-zinc-500">رمز الاستجابة</span>
        </div>
        <p className="text-[10px] font-bold">شكراً لزيارتكم</p>
        <p className="text-[8px] text-zinc-500">CorePOS</p>
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
