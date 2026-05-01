"use client"

import { usePOSStore } from "@/stores/posStore"
import { useAuthStore } from "@/stores/authStore"
import { forwardRef, useMemo, useState, useEffect } from "react"
import { formatCurrency } from "@/lib/utils"
import { usePrintSettings } from "@/hooks/use-print-settings"

export const POSReceipt = forwardRef<HTMLDivElement>((props, ref) => {
  const { cart, customer, getSummary, lastInvoiceNumber } = usePOSStore()
  const { company, profile } = useAuthStore()
  const summary = getSummary()
  const { setting } = usePrintSettings('pos_receipt')

  const paperSize = setting?.paperSize || '80mm'
  const margins = typeof setting?.marginConfig === 'string'
    ? JSON.parse(setting.marginConfig)
    : (setting?.marginConfig || { top: '0', right: '0', bottom: '0', left: '0' })
  const [now, setNow] = useState("")
  
  useEffect(() => {
    setNow(new Date().toLocaleString('ar-EG'))
  }, [])

  const widthStr = paperSize === 'custom' && margins?.customWidth
    ? `${margins.customWidth}mm`
    : (paperSize.includes('mm') ? paperSize.split(' ')[0] : '80mm')

  const cssSize = paperSize === 'custom' && margins?.customWidth && margins?.customHeight
    ? `${margins.customWidth}mm ${margins.customHeight}mm`
    : (paperSize.includes('80mm') ? '80mm auto' : paperSize)

  return (
    <div
      ref={ref}
      className="hidden bg-white px-1 py-2 font-sans text-[12px] leading-relaxed text-black print:block rtl"
      style={{ width: widthStr, margin: '0 auto' }}
      dir="rtl"
    >
      {/* Header */}
      <div className="text-center space-y-2 mb-4 border-b pb-4 border-dashed border-black">
        <h1 className="text-lg font-black tracking-tight">{company?.name || "CorePOS"}</h1>
        <p className="text-[10px] text-black">{company?.phone || ""} {company?.tax_number ? `- س.ت: ${company.tax_number}` : ""}</p>
        <div className="flex justify-between items-center text-[10px] font-bold mt-2">
          <span>فاتورة ضريبية مبسطة</span>
          <span>#{lastInvoiceNumber || "جديدة"}</span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 mb-4 text-[10px]">
        <div className="flex justify-between">
          <span className="font-normal">التاريخ:</span>
          <span className="font-bold">{now}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-normal">العميل:</span>
          <span className="font-bold">{customer?.name || "عميل نقدي"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-normal">الكاشير:</span>
          <span className="font-bold">{profile?.full_name || "موظف مبيعات"}</span>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-4 border-b border-dashed border-black">
        <thead>
          <tr className="text-right border-b border-black">
            <th className="pb-1">الصنف</th>
            <th className="pb-1 text-center">الكمية</th>
            <th className="pb-1 text-end">الإجمالي</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-black">
          {cart.map((item) => (
            <tr key={item.id}>
              <td className="py-2">
                <div className="font-bold">{item.name}</div>
                <div className="text-[9px] font-normal tabular-nums">
                  {formatCurrency(Number(item.unit_price ?? 0))}
                </div>
              </td>
              <td className="py-2 text-center font-bold tabular-nums">{item.quantity}</td>
              <td className="py-2 text-end font-bold tabular-nums">
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
            <span className="font-bold tabular-nums">-{formatCurrency(summary.discountAmount)}</span>
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
      <div className="text-center space-y-4 pt-4 border-t border-dashed border-black">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded border border-black bg-white">
          <span className="text-[10px] text-black font-bold">رمز الاستجابة</span>
        </div>
        {company?.receiptFooter || company?.receipt_footer ? (
          <p className="text-[10px] font-bold whitespace-pre-wrap">{company.receiptFooter || company.receipt_footer}</p>
        ) : (
          <p className="text-[10px] font-bold">شكراً لزيارتكم</p>
        )}
        <p className="text-[8px] font-normal pb-4">نظام POS-SAHL الذكي</p>
      </div>

      {/* Special styles for Printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            margin: ${margins.top || '0'} ${margins.right || '0'} ${margins.bottom || '0'} ${margins.left || '0'};
            size: ${cssSize};
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: ${widthStr} !important;
          }
          .no-print {
            display: none !important;
          }
        }
      ` }} />
    </div>
  )
})


POSReceipt.displayName = "POSReceipt"
