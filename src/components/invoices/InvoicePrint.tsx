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
    : (setting?.marginConfig || { top: '0.5cm', right: '0.5cm', bottom: '0.5cm', left: '0.5cm' })

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
  const invoiceOptions = {
    showLogo: margins.showLogo ?? true,
    showQR: margins.showQR ?? true,
    showNotes: margins.showNotes ?? true,
    showHeaderDetails: margins.showHeaderDetails ?? true,
    showFooter: margins.showFooter ?? true,
    showTaxes: margins.showTaxes ?? true,
    accentColor: margins.accentColor ?? '#0f172a',
  }

  const isA4 = paperSize === 'A4' || paperSize.toLowerCase().includes('a4')
  const isA5 = paperSize === 'A5' || paperSize.toLowerCase().includes('a5')

  return (
    <div className="flex justify-center print:block overflow-x-auto overflow-y-hidden py-4 print:py-0" dir="rtl">
      <div 
        className={cn(
          "bg-white font-sans text-slate-900 shrink-0 invoice-container",
          isA4 && "w-[210mm] min-h-[297mm] shadow-lg border border-slate-200",
          isA5 && "w-[148mm] min-h-[210mm] shadow-lg border border-slate-200",
          !isA4 && !isA5 && "w-full max-w-[900px] shadow-lg border border-slate-200"
        )}
        style={{
           // Apply padding in screen mode to simulate margins. In print, @page margin applies to paper.
           padding: `var(--preview-pt) var(--preview-pl) var(--preview-pb) var(--preview-pr)`,
           borderTop: `6px solid ${invoiceOptions.accentColor}`,
           '--preview-pt': margins.top || '0.5cm',
           '--preview-pb': margins.bottom || '0.5cm',
           '--preview-pr': margins.right || '0.5cm',
           '--preview-pl': margins.left || '0.5cm',
        } as React.CSSProperties}
      >
        {/* Print Specific CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            html, body {
              height: auto !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              font-size: 12px;
            }
            .min-h-screen {
              min-height: 0 !important;
            }
            .no-print { display: none !important; }
            @page { 
              size: ${paperSize}; 
              margin: ${margins.top || '0.5cm'} ${margins.left || '0.5cm'} ${margins.bottom || '0.5cm'} ${margins.right || '0.5cm'}; 
            }
            .print-no-break {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .invoice-container {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              /* Remove only the side/bottom borders, keep the top one from the style attribute */
              border-left: none !important;
              border-right: none !important;
              border-bottom: none !important;
              height: auto !important;
              min-height: 0 !important;
            }
          }
          .invoice-print-row {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        ` }} />

        {/* Modern Header Design */}
        <div className="mb-4 flex items-start justify-between border-b-[2px] pb-4 print:mb-2 print:pb-2" style={{ borderColor: invoiceOptions.accentColor }}>
          <div className="flex gap-4 items-center">
            {invoiceOptions.showLogo && company?.logoUrl && (
              <img 
                src={company.logoUrl} 
                alt="Logo" 
                className="h-16 w-16 object-contain rounded-lg border border-slate-100 p-1" 
              />
            )}
            <div className="space-y-1">
              <h1 className="text-xl font-black tracking-tight" style={{ color: invoiceOptions.accentColor }}>{company?.name || "اسم الشركة"}</h1>
              {invoiceOptions.showHeaderDetails && (
                <div className="text-[11px] text-slate-500 font-medium space-y-0.5">
                  <p>{company?.address || "العنوان غير مسجل"}</p>
                  <p className="flex gap-3">
                    <span>هاتف: {company?.phone || "---"}</span>
                    {company?.email && <span>بريد: {company.email}</span>}
                  </p>
                  {invoiceOptions.showTaxes && (
                    <p className="font-bold text-slate-700">
                      الرقم الضريبي: {(company as any)?.taxNumber ?? (company as any)?.tax_number ?? "---"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-start space-y-3">
            <div className="flex flex-col items-start gap-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: invoiceOptions.accentColor }}>
                {invoice.type === 'sale' ? (invoiceOptions.showTaxes ? 'فاتورة ضريبية' : 'فاتورة مبيعات') : 
                 invoice.type === 'quotation' ? 'عرض سعر' :
                 invoice.type === 'purchase' ? (invoiceOptions.showTaxes ? 'فاتورة مشتريات ضريبية' : 'فاتورة مشتريات') : 'مستند مالي'}
              </span>
            </div>
            <div className="text-sm space-y-1.5 pt-2">
              <p className="flex justify-between gap-6">
                <span className="text-slate-400">الرقم:</span>
                <span className="font-bold text-slate-900 font-mono">#{invoice.invoice_number}</span>
              </p>
              <p className="flex justify-between gap-6">
                <span className="text-slate-400">التاريخ:</span>
                <span className="font-bold text-slate-900">{invoice.date}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Info Sections */}
        <div className="mb-3 grid grid-cols-5 gap-0 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50 print:mb-2">
          <div className="col-span-3 p-3 border-e border-slate-100">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
              {isSale ? 'العميل المستفيد' : 'المورد المعتمد'}
            </h3>
            <div className="space-y-1">
              <p className="text-xl font-black" style={{ color: invoiceOptions.accentColor }}>
                {isSale ? (invoice.customers?.name || "عميل نقدي") : (invoice.suppliers?.name || "مورد عام")}
              </p>
              <div className="text-sm text-slate-600 space-y-0.5">
                <p>{isSale ? invoice.customers?.phone : invoice.suppliers?.phone}</p>
                <p className="text-xs">{isSale ? invoice.customers?.address : invoice.suppliers?.address}</p>
              </div>
            </div>
          </div>
          
          <div className="col-span-2 p-3 bg-white space-y-2">
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
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 print:mb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-white" style={{ backgroundColor: invoiceOptions.accentColor }}>
                <th className="w-10 p-2.5 text-center text-[10px] font-black uppercase tracking-wider">#</th>
                <th className="p-2.5 text-right text-[10px] font-black uppercase tracking-wider">الوصف والبيانات</th>
                <th className="w-16 p-2.5 text-center text-[10px] font-black uppercase tracking-wider">الكمية</th>
                <th className="w-24 p-2.5 text-right text-[10px] font-black uppercase tracking-wider">سعر الوحدة</th>
                <th className="w-24 p-2.5 text-right text-[10px] font-black uppercase tracking-wider border-s border-white/10">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.invoice_items?.map((item: any, idx: number) => (
                <tr key={item.id} className="invoice-print-row hover:bg-slate-50/50 transition-colors">
                  <td className="p-2.5 text-center text-slate-400 font-bold text-xs bg-slate-50/30">{idx + 1}</td>
                  <td className="p-2.5">
                    <p className="font-bold text-slate-900 text-sm">{item.products?.name}</p>
                    {item.notes && <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{item.notes}</p>}
                  </td>
                  <td className="p-2.5 text-center font-bold tabular-nums text-slate-700 text-sm">{item.qty}</td>
                  <td className="p-2.5 text-right tabular-nums text-sm">
                    <CurrencyDisplay amount={item.unit_price} className="text-slate-600" currencyCode={printCurrency} />
                  </td>
                  <td className="p-2.5 text-right border-s border-slate-50 bg-slate-50/30">
                    <CurrencyDisplay amount={item.total_line} className="font-black text-slate-900 text-sm" currencyCode={printCurrency} />
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
        <div className="mt-2 grid grid-cols-12 gap-6 print-no-break items-start">
          <div className="col-span-7 space-y-4">
            <div className="flex gap-4 items-start">
              {invoiceOptions.showQR && qrCodeUrl && (
                <div className="p-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                  <img src={qrCodeUrl} alt="Invoice QR" className="w-20 h-20" />
                  <p className="text-[8px] text-center mt-0.5 text-slate-400 font-bold uppercase tracking-tighter">
                    {invoiceOptions.showTaxes ? "التحقق الضريبي" : "معلومات الفاتورة"}
                  </p>
                </div>
              )}
              {invoiceOptions.showNotes && invoice.notes && (
                <div className="flex-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">تعليمات وملاحظات</h4>
                  <p className="text-xs text-slate-600 leading-relaxed italic">"{invoice.notes}"</p>
                </div>
              )}
            </div>
            
            <div className="pt-6 flex justify-between items-end border-t border-slate-100 mt-4">
              <div className="text-center space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">توقيع المستلم</p>
                  <div className="w-24 h-0.5 bg-slate-100 mx-auto"></div>
              </div>
              <div className="text-center space-y-3 px-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">المسؤول</p>
                  <p className="text-xs font-black text-slate-800">{invoice.profiles?.full_name || '---'}</p>
              </div>
              <div className="text-center space-y-1">
                  <div className="w-16 h-16 border-2 border-dashed border-slate-100 rounded-full flex items-center justify-center text-[8px] text-slate-300 font-black uppercase rotate-12">
                     ختم المؤسسة
                  </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-5 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-100 print:shadow-none print:border-slate-300">
            <div className="bg-slate-50 p-3 space-y-2">
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
              {invoiceOptions.showTaxes && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold">الضريبة المضافة</span>
                  <CurrencyDisplay amount={Number(invoice.tax_amount ?? 0)} className="text-slate-700 font-bold" currencyCode={printCurrency} />
                </div>
              )}
            </div>
            
            <div className="p-3 text-white space-y-0.5" style={{ backgroundColor: invoiceOptions.accentColor }}>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-80">المبلغ الإجمالي النهائي</p>
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-black tabular-nums">{Number(invoice.total).toLocaleString()}</span>
                <span className="text-xs font-bold opacity-90">{printCurrency || 'جنية'}</span>
              </div>
            </div>

            <div className="p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold italic">المدفوع نقداً</span>
                <CurrencyDisplay amount={invoice.paid} className="text-emerald-600 font-black" currencyCode={printCurrency} />
              </div>
              <div className="flex justify-between text-xs border-t border-slate-50 pt-2">
                <span className="text-slate-900 font-black uppercase tracking-tight">المتبقي بـالذمة</span>
                <CurrencyDisplay amount={invoice.remaining} className="text-rose-600 font-black bg-rose-50 px-2 py-0.5 rounded" currencyCode={printCurrency} />
              </div>
            </div>
          </div>
        </div>

        {invoiceOptions.showFooter && (
          <div className="mt-8 border-t-[2px] pt-6 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] print-no-break" style={{ borderColor: `${invoiceOptions.accentColor}20` }}>
            <div>نظام POS-SAHL الذكي</div>
            <div>{new Date().toLocaleString("ar-EG", { dateStyle: "long", timeStyle: "short" })}</div>
            <div className="opacity-80" style={{ color: invoiceOptions.accentColor }}>
              {company?.receiptFooter || company?.receipt_footer || "WWW.POS-SAHL.COM"}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

