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
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary">{company?.name || "CorePOS"}</h1>
          <p className="text-sm text-gray-500">{company?.address || "العنوان غير مسجل"}</p>
          <p className="text-sm text-gray-500">هاتف: {company?.phone || "---"}</p>
          <p className="text-sm text-gray-500">رقم ضريبي: {company?.tax_number || "---"}</p>
        </div>
        <div className="text-left space-y-1">
          <div className="bg-primary text-white px-4 py-2 rounded-lg inline-block text-xl font-bold mb-2">
            فاتورة {invoice.type === 'sale' ? 'مبيعات' : 'مشتريات'}
          </div>
          <p className="font-bold"># {invoice.invoice_number}</p>
          <p className="text-sm text-gray-500">التاريخ: {invoice.date}</p>
        </div>
      </div>

      {/* Party Info */}
      <div className="grid grid-cols-2 gap-12 mb-8">
        <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">جهة التعامل</h3>
          <p className="text-lg font-bold">{invoice.type === 'sale' ? invoice.customers?.name : invoice.suppliers?.name}</p>
          <p className="text-sm text-gray-600">{invoice.type === 'sale' ? invoice.customers?.phone : invoice.suppliers?.phone}</p>
          <p className="text-sm text-gray-600 shrink-0">{invoice.type === 'sale' ? invoice.customers?.address : invoice.suppliers?.address}</p>
        </div>
        <div className="flex flex-col justify-end text-left pr-4">
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
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100 text-right">
            <th className="p-3 border-b-2 border-gray-200 w-12 text-center">#</th>
            <th className="p-3 border-b-2 border-gray-200">الأصناف</th>
            <th className="p-3 border-b-2 border-gray-200 text-center w-20">الكمية</th>
            <th className="p-3 border-b-2 border-gray-200 text-left w-24">السعر</th>
            <th className="p-3 border-b-2 border-gray-200 text-left w-24">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {invoice.invoice_items?.map((item: any, idx: number) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="p-3 text-center text-gray-400">{idx + 1}</td>
              <td className="p-3 font-medium">
                {item.products?.name}
                {item.notes && <p className="text-[10px] text-gray-400 font-normal">{item.notes}</p>}
              </td>
              <td className="p-3 text-center">{item.qty}</td>
              <td className="p-3 text-left"><CurrencyDisplay amount={item.unit_price} className="text-sm font-normal" /></td>
              <td className="p-3 text-left font-bold"><CurrencyDisplay amount={item.total_line} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer / Totals */}
      <div className="flex justify-between items-start gap-12">
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
        
        <div className="w-[250px] space-y-2">
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

      <div className="mt-20 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
        تم إنشاء هذه الفاتورة برمجياً عبر نظام الأساس لتجارة التجزئة (CorePOS) التاريخ والوقت: {new Date().toLocaleString('ar-EG')}
      </div>
    </div>
  )
}
