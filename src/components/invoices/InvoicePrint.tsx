"use client"
import { useEffect, useState } from "react"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { cn } from "@/lib/utils"
import { usePrintSettings } from "@/hooks/use-print-settings"
import QRCode from "qrcode"

import { renderTemplate } from "@/lib/print-renderer"

interface InvoicePrintProps {
  invoice: any
  company: any
}

export function InvoicePrint({ invoice, company }: InvoicePrintProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null)
  const printCurrency = company?.currency as string | undefined
  const { setting, isLoading } = usePrintSettings(
    invoice.type === 'sale' ? 'invoice_sale' : 
    invoice.type === 'purchase' ? 'invoice_purchase' : 
    'invoice_sale'
  )

  const paperSize = setting?.paperSize || 'A4'
  const margins = typeof setting?.marginConfig === 'string' 
    ? JSON.parse(setting.marginConfig) 
    : (setting?.marginConfig || { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' })

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          seller: company?.name,
          vat: company?.taxNumber || company?.tax_number,
          date: invoice.date || invoice.created_at,
          total: invoice.total,
          tax: invoice.tax_amount
        })
        const url = await QRCode.toDataURL(qrData, { margin: 1, width: 128 })
        setQrCodeUrl(url)
      } catch (err) {
        console.error("Failed to generate QR code", err)
      }
    }
    generateQR()
  }, [invoice, company])

  useEffect(() => {
    if (setting?.templateCode && !isLoading) {
      const html = renderTemplate({
        invoice,
        company,
        qrCodeUrl,
        type: invoice.type
      }, setting.templateCode)
      setRenderedHtml(html)
    } else {
      setRenderedHtml(null)
    }
  }, [setting, invoice, company, qrCodeUrl, isLoading])

  if (isLoading) return <div className="p-8 text-center animate-pulse">جاري تحميل إعدادات الطباعة...</div>

  const isSale = invoice.type === 'sale' || invoice.type === 'quotation' || invoice.type === 'sale_return'

  // If we have custom rendered HTML, show it
  if (renderedHtml) {
    return (
      <div className="bg-white print:p-0 print:m-0" dir="rtl">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: white !important; }
            @page { 
              size: ${paperSize.includes('mm') ? `${paperSize} auto` : paperSize}; 
              margin: ${margins.top || '0'} ${margins.right || '0'} ${margins.bottom || '0'} ${margins.left || '0'}; 
            }
          }
        ` }} />
        <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      </div>
    )
  }

  // Default Professional UI Fallback
  return (
    <div className="bg-white p-2 sm:p-8 max-w-[850px] mx-auto print:p-0 print:m-0 font-sans text-slate-900" dir="rtl">
      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          @page { 
            size: ${paperSize}; 
            margin: ${margins.top || '1cm'} ${margins.right || '1cm'} ${margins.bottom || '1cm'} ${margins.left || '1cm'}; 
          }
        }
        .invoice-print-row {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      ` }} />

      {/* Modern Header Design */}
      <div className="mb-10 flex items-center justify-between border-b-[3px] border-primary pb-8">
        <div className="flex gap-6 items-center">
          {company?.logoUrl && (
            <img 
              src={company.logoUrl} 
              alt="Logo" 
              className="h-20 w-20 object-contain rounded-lg border border-gray-100 p-1" 
            />
          )}
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{company?.name || "اسم الشركة"}</h1>
            <div className="text-[13px] text-slate-500 font-medium space-y-0.5">
              <p>{company?.address || "العنوان غير مسجل"}</p>
              <p className="flex gap-4">
                <span>هاتف: {company?.phone || "---"}</span>
                {company?.email && <span>بريد: {company.email}</span>}
              </p>
              <p className="font-bold text-slate-700">
                الرقم الضريبي: {(company as any)?.taxNumber ?? (company as any)?.tax_number ?? "---"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-start space-y-3">
          <div className="flex flex-col items-start gap-1">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              {invoice.type === 'sale' ? 'فاتورة ضريبية' : 
               invoice.type === 'quotation' ? 'عرض سعر' :
               invoice.type === 'purchase' ? 'فاتورة مشتريات' : 'مستند مالي'}
            </span>
            <div className="text-4xl font-black text-slate-900 uppercase">
              {isSale ? 'SALE' : 'PURCHASE'}
            </div>
          </div>
          <div className="text-sm space-y-1">
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">الرقم:</span>
              <span className="font-bold text-slate-900 font-mono">#{invoice.invoice_number}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">التاريخ:</span>
              <span className="font-bold text-slate-900">{invoice.date}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="mb-10 grid grid-cols-5 gap-0 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
        <div className="col-span-3 p-5 border-e border-slate-100">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
            {isSale ? 'العميل المستفيد' : 'المورد المعتمد'}
          </h3>
          <div className="space-y-1">
            <p className="text-xl font-black text-primary">
              {isSale ? (invoice.customers?.name || "عميل نقدي") : (invoice.suppliers?.name || "مورد عام")}
            </p>
            <div className="text-sm text-slate-600 space-y-0.5">
              <p>{isSale ? invoice.customers?.phone : invoice.suppliers?.phone}</p>
              <p className="text-xs">{isSale ? invoice.customers?.address : invoice.suppliers?.address}</p>
            </div>
          </div>
        </div>
        
        <div className="col-span-2 p-5 bg-white space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <span className="text-xs text-slate-400 font-bold">حالة الدفع</span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-md font-black",
              invoice.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            )}>
              {invoice.status === 'paid' ? 'خالص السداد' : 'متبقي مستحقات'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold">الفرع</span>
            <span className="text-xs font-bold text-slate-700">{invoice.branches?.name || "الرئيسي"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold">المستودع</span>
            <span className="text-xs font-bold text-slate-700">{invoice.warehouses?.name || "الافتراضي"}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Table Design */}
      <div className="mb-10 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="w-12 p-4 text-center text-[10px] font-black uppercase">#</th>
              <th className="p-4 text-right text-[10px] font-black uppercase">الوصف والبيانات</th>
              <th className="w-20 p-4 text-center text-[10px] font-black uppercase">الكمية</th>
              <th className="w-32 p-4 text-right text-[10px] font-black uppercase">سعر الوحدة</th>
              <th className="w-32 p-4 text-right text-[10px] font-black uppercase border-s border-slate-700">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.invoice_items?.map((item: any, idx: number) => (
              <tr key={item.id} className="invoice-print-row hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-center text-slate-400 font-bold text-sm bg-slate-50/30">{idx + 1}</td>
                <td className="p-4">
                  <p className="font-bold text-slate-900">{item.products?.name}</p>
                  {item.notes && <p className="text-[10px] text-slate-400 mt-1 font-medium">{item.notes}</p>}
                </td>
                <td className="p-4 text-center font-bold tabular-nums text-slate-700">{item.qty}</td>
                <td className="p-4 text-right tabular-nums">
                  <CurrencyDisplay amount={item.unit_price} className="text-slate-600" currencyCode={printCurrency} />
                </td>
                <td className="p-4 text-right border-s border-slate-50 bg-slate-50/30">
                  <CurrencyDisplay amount={item.total_line} className="font-black text-slate-900" currencyCode={printCurrency} />
                </td>
              </tr>
            ))}
            {(!invoice.invoice_items || invoice.invoice_items.length === 0) && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 italic">لا توجد أصناف مسجلة</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Totals & QR */}
      <div className="flex items-start justify-between gap-12">
        <div className="flex-1 space-y-6">
          <div className="flex gap-6 items-start">
            {qrCodeUrl && (
              <div className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
                <img src={qrCodeUrl} alt="E-Invoice QR" className="w-24 h-24" />
                <p className="text-[9px] text-center mt-1 text-slate-400 font-bold uppercase tracking-tighter">التحقق الضريبي</p>
              </div>
            )}
            {invoice.notes && (
              <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">تعليمات وملاحظات</h4>
                <p className="text-sm text-slate-600 leading-relaxed italic">"{invoice.notes}"</p>
              </div>
            )}
          </div>
          
          <div className="pt-10 flex justify-between items-end border-t border-slate-100">
            <div className="text-center space-y-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">توقيع المستلم</p>
                <div className="w-32 h-0.5 bg-slate-100 mx-auto"></div>
            </div>
            <div className="text-center space-y-6 px-12">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">المسؤول</p>
                <p className="text-sm font-black text-slate-800">{invoice.profiles?.full_name || '---'}</p>
            </div>
            <div className="text-center space-y-2">
                <div className="w-24 h-24 border-2 border-dashed border-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-300 font-black uppercase rotate-12">
                   ختم المؤسسة
                </div>
            </div>
          </div>
        </div>
        
        <div className="w-[300px] rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-100">
          <div className="bg-slate-50 p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-bold">المجموع الفرعي</span>
              <CurrencyDisplay amount={invoice.subtotal} className="text-slate-700 font-bold" currencyCode={printCurrency} />
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">إجمالي الخصم</span>
                <div className="text-rose-500 font-bold">
                  - <CurrencyDisplay amount={invoice.discount_amount} currencyCode={printCurrency} />
                </div>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-bold">الضريبة المضافة</span>
              <CurrencyDisplay amount={Number(invoice.tax_amount ?? 0)} className="text-slate-700 font-bold" currencyCode={printCurrency} />
            </div>
          </div>
          
          <div className="p-5 bg-primary text-white space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">المبلغ الإجمالي النهائي</p>
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-black tabular-nums">{Number(invoice.total).toLocaleString()}</span>
              <span className="text-sm font-bold opacity-90">{printCurrency || 'جنية'}</span>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold italic">المدفوع نقداً</span>
              <CurrencyDisplay amount={invoice.paid} className="text-emerald-600 font-black" currencyCode={printCurrency} />
            </div>
            <div className="flex justify-between text-xs border-t border-slate-50 pt-3">
              <span className="text-slate-900 font-black uppercase tracking-tight">المتبقي بـالذمة</span>
              <CurrencyDisplay amount={invoice.remaining} className="text-rose-600 font-black bg-rose-50 px-2 py-0.5 rounded" currencyCode={printCurrency} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 border-t border-slate-100 pt-8 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
        <div>نظام POS-SAHL الذكي</div>
        <div>{new Date().toLocaleString("ar-EG", { dateStyle: "long", timeStyle: "short" })}</div>
        <div className="text-primary opacity-50 underline">WWW.POS-SAHL.COM</div>
      </div>
    </div>
  )
}

