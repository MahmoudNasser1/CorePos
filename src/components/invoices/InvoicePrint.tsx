"use client"

import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { cn } from "@/lib/utils"

interface InvoicePrintProps {
  invoice: any
  company: any
}

export function InvoicePrint({ invoice, company }: InvoicePrintProps) {
  return (
    <div className="bg-white p-8 max-w-[800px] mx-auto print:p-0 print:m-0" dir="rtl">
      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 1cm; }
        }
        .invoice-print-row {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      `}</style>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between border-b-2 border-primary pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary">{company?.name || "اسم الشركة"}</h1>
          <p className="text-sm text-gray-500">{company?.address || "العنوان غير مسجل"}</p>
          <p className="text-sm text-gray-500">هاتف: {company?.phone || "---"}</p>
          <p className="text-sm text-gray-500">رقم ضريبي: {company?.tax_number || "---"}</p>
        </div>
        <div className="space-y-1 text-start">
          <div className="bg-primary text-white px-4 py-2 rounded-lg inline-block text-xl font-bold mb-2">
            فاتورة {invoice.type === 'sale' ? 'مبيعات' : 'مشتريات'}
          </div>
          <p className="font-bold"># {invoice.invoice_number}</p>
          <p className="text-sm text-gray-500">التاريخ: {invoice.date}</p>
        </div>
      </div>

      {/* Party Info */}
      <div className="mb-8 grid grid-cols-2 gap-12 border-b border-gray-200 pb-8">
        <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <h3 className="mb-2 text-xs font-bold tracking-wide text-primary">جهة التعامل</h3>
          <p className="text-lg font-bold">{invoice.type === 'sale' ? invoice.customers?.name : invoice.suppliers?.name}</p>
          <p className="text-sm text-gray-600">{invoice.type === 'sale' ? invoice.customers?.phone : invoice.suppliers?.phone}</p>
          <p className="text-sm text-gray-600 shrink-0">{invoice.type === 'sale' ? invoice.customers?.address : invoice.suppliers?.address}</p>
        </div>
        <div className="flex flex-col justify-end border-e border-gray-100 pe-4 text-start">
          <div className="space-y-1">
             <p className="text-xs text-gray-400">حالة الدفع</p>
             <p className={cn(
               "font-bold",
               invoice.status === 'paid' ? "text-green-600" : "text-red-500"
             )}>
               {invoice.status === 'paid' ? 'مدفوعة بالكامل' : 'آجل / جزئي'}
             </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="mb-8 w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100 text-start">
            <th className="w-12 border-b-2 border-gray-200 p-3 text-center">#</th>
            <th className="border-b-2 border-gray-200 p-3">الأصناف</th>
            <th className="w-20 border-b-2 border-gray-200 p-3 text-center">الكمية</th>
            <th className="w-28 border-b-2 border-gray-200 p-3 text-start">السعر</th>
            <th className="w-28 border-b-2 border-gray-200 p-3 text-start">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {invoice.invoice_items?.map((item: any, idx: number) => (
            <tr key={item.id} className="invoice-print-row border-b border-gray-100">
              <td className="p-3 text-center text-gray-400">{idx + 1}</td>
              <td className="p-3 font-medium">
                {item.products?.name}
                {item.notes && <p className="text-[10px] font-normal text-gray-400">{item.notes}</p>}
              </td>
              <td className="p-3 text-center tabular-nums">{item.qty}</td>
              <td className="p-3 text-start">
                <CurrencyDisplay amount={item.unit_price} className="text-sm font-normal" />
              </td>
              <td className="p-3 text-start font-bold">
                <CurrencyDisplay amount={item.total_line} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer / Totals */}
      <div className="flex items-start justify-between gap-12 border-t border-gray-200 pt-8">
        <div className="flex-1 space-y-4">
           {invoice.notes && (
             <div className="p-4 border border-dashed rounded-lg">
                <p className="text-xs font-bold text-gray-400 mb-1">ملاحظات الفاتورة:</p>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
             </div>
           )}
           <div className="pt-8 text-center text-gray-300 italic text-sm border-t-2 border-gray-50 flex justify-around">
              <div>توقيع الكاشير: {invoice.profiles?.full_name}</div>
              <div>ختم الشركة</div>
           </div>
        </div>
        
        <div className="w-[250px] space-y-2 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
          <div className="flex justify-between p-2">
            <span className="text-gray-500">المجموع الفرعي</span>
            <CurrencyDisplay amount={invoice.subtotal} className="font-normal" />
          </div>
          {invoice.discount_amount > 0 && (
            <div className="flex justify-between p-2 text-red-500">
              <span>الخصم</span>
              <CurrencyDisplay amount={invoice.discount_amount} />
            </div>
          )}
          {invoice.tax_amount > 0 && (
            <div className="flex justify-between p-2">
              <span>الضريبة ({invoice.tax_rate}%)</span>
              <CurrencyDisplay amount={invoice.tax_amount} className="font-normal" />
            </div>
          )}
          <div className="flex justify-between p-3 bg-primary text-white rounded-xl font-bold text-xl">
            <span>الإجمالي</span>
            <CurrencyDisplay amount={invoice.total} />
          </div>
          
          <div className="flex justify-between p-2 pt-4 border-t border-dashed">
            <span className="text-sm text-gray-500">المدفوع</span>
            <CurrencyDisplay amount={invoice.paid} className="text-green-600" />
          </div>
          <div className="flex justify-between p-2">
            <span className="text-sm text-gray-500 font-bold">المتبقي</span>
            <CurrencyDisplay amount={invoice.remaining} className="text-red-500" />
          </div>
        </div>
      </div>

      <div className="mt-20 border-t border-gray-100 pt-8 text-center text-xs text-gray-400">
        وثيقة مُنشأة آلياً — {new Date().toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}
      </div>
    </div>
  )
}
