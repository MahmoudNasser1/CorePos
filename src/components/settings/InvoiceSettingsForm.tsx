"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Building2, Percent, FileText, MapPin, Phone, Link as LinkIcon, Save, Printer, ChevronDown, ChevronUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAPER_SIZES, DEFAULT_MARGINS } from "@/lib/constants/printing"
import { getPrintSettings, upsertPrintSettings, updateCompanyProfile } from "@/lib/actions/settings.actions"
import { useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const settingsSchema = z.object({
  name: z.string().min(2, "اسم الشركة مطلوب"),
  name_en: z.string().optional(),
  logo_url: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  tax_number: z.string().optional(),
  vat_rate: z.number().default(0),
  receipt_footer: z.string().optional(),
})

export function InvoiceSettingsForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [paperSize, setPaperSize] = useState("A4")
  const [margins, setMargins] = useState<any>(DEFAULT_MARGINS['A4'])
  const [expandedMargins, setExpandedMargins] = useState(false)
  const [invoiceOptions, setInvoiceOptions] = useState({
    showLogo: true,
    showQR: true,
    showNotes: true,
    showHeaderDetails: true,
    showFooter: true,
    showTaxes: true,
    accentColor: '#0f172a',
  })

  useEffect(() => {
    async function fetchPrintSettings() {
      try {
        const res: any = await getPrintSettings()
        const list: any[] = Array.isArray(res) ? res : (res?.success && Array.isArray(res?.data)) ? res.data : []
        const found = list.find((s: any) => s.documentType === 'invoice_sale' || s.document_type === 'invoice_sale')
        if (found) {
          setPaperSize(found.paperSize || found.paper_size || 'A4')
          const m = typeof found.marginConfig === 'string' ? JSON.parse(found.marginConfig) : (found.marginConfig || (typeof found.margin_config === 'string' ? JSON.parse(found.margin_config) : found.margin_config) || DEFAULT_MARGINS[found.paperSize || found.paper_size || 'A4'])
          setMargins({ top: m.top || '1cm', bottom: m.bottom || '1cm', right: m.right || '1cm', left: m.left || '1cm' })
          setInvoiceOptions({
            showLogo: m.showLogo ?? true,
            showQR: m.showQR ?? true,
            showNotes: m.showNotes ?? true,
            showHeaderDetails: m.showHeaderDetails ?? true,
            showFooter: m.showFooter ?? true,
            showTaxes: m.showTaxes ?? true,
            accentColor: m.accentColor ?? '#0f172a'
          })
        }
      } catch (err) {
        console.error("Failed to fetch print settings", err)
      }
    }
    fetchPrintSettings()
  }, [])

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialData?.name || "",
      name_en: initialData?.name_en || "",
      logo_url: initialData?.logo_url || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      tax_number: initialData?.tax_number || "",
      vat_rate: Number(initialData?.vat_rate) || 0,
      receipt_footer: initialData?.receipt_footer || "",
    },
  })

  const watchName = form.watch("name")
  const watchTax = form.watch("tax_number")
  const watchVat = form.watch("vat_rate")
  const watchFooter = form.watch("receipt_footer")
  const watchLogo = form.watch("logo_url")

  const runSave = form.handleSubmit(async (values) => {
    setLoading(true)
    try {
      await updateCompanyProfile(values)
      // Save print settings for invoice_sale
      await upsertPrintSettings({
        documentType: 'invoice_sale',
        paperSize,
        marginConfig: JSON.stringify({ ...margins, ...invoiceOptions })
      })
      toast.success("تم حفظ التغييرات")
      setConfirmOpen(false)
    } catch {
      toast.error("تعذّر الحفظ. أعد المحاولة.")
    } finally {
      setLoading(false)
    }
  })

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Building2 className="h-5 w-5 text-primary" aria-hidden />
                المعلومات الأساسية
              </CardTitle>
              <CardDescription>بيانات تظهر في رأس الفاتورة والتقارير.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="co-name">اسم الشركة (عربي)</Label>
                  <Input id="co-name" {...form.register("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-name-en">الاسم بالإنجليزية (اختياري)</Label>
                  <Input id="co-name-en" {...form.register("name_en")} dir="ltr" className="text-end font-sans" />
                  <p className="text-xs text-muted-foreground">للطباعة أو التكامل مع أنظمة خارجية عند الحاجة.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="co-phone">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="co-phone" {...form.register("phone")} className="pe-10 tabular-nums" dir="ltr" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="co-tax">الرقم الضريبي</Label>
                  <div className="relative">
                    <FileText className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="co-tax" {...form.register("tax_number")} className="pe-10 tabular-nums" dir="ltr" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="co-address">العنوان التفصيلي</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="co-address" {...form.register("address")} className="pe-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Printer className="h-5 w-5 text-primary" aria-hidden />
                إعدادات الطباعة وتصميم الفاتورة
              </CardTitle>
              <CardDescription>تحكم في مقاس الورق، الهوامش، والعناصر الظاهرة في الفاتورة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>مقاس الورق الافتراضي</Label>
                  <Select 
                    value={paperSize} 
                    onValueChange={(val) => {
                      setPaperSize(val)
                      setMargins(DEFAULT_MARGINS[val] || DEFAULT_MARGINS['A4'])
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر المقاس" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAPER_SIZES.map(sz => (
                        <SelectItem key={sz.value} value={sz.value}>{sz.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground italic">سيتم تطبيق هذا المقاس تلقائياً عند طلب الطباعة.</p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    الهوامش (مم)
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => setExpandedMargins(!expandedMargins)}
                    >
                      {expandedMargins ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 text-center bg-muted/30 p-2 rounded text-[10px]">
                      <span className="block text-muted-foreground">أعلى</span>
                      <span className="font-bold">{margins.top}</span>
                    </div>
                    <div className="flex-1 text-center bg-muted/30 p-2 rounded text-[10px]">
                      <span className="block text-muted-foreground">أسفل</span>
                      <span className="font-bold">{margins.bottom}</span>
                    </div>
                    <div className="flex-1 text-center bg-muted/30 p-2 rounded text-[10px]">
                      <span className="block text-muted-foreground">يمين</span>
                      <span className="font-bold">{margins.right}</span>
                    </div>
                    <div className="flex-1 text-center bg-muted/30 p-2 rounded text-[10px]">
                      <span className="block text-muted-foreground">يسار</span>
                      <span className="font-bold">{margins.left}</span>
                    </div>
                  </div>
                </div>
              </div>

              {expandedMargins && (
                <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg bg-slate-50/50">
                  {(['top', 'bottom', 'right', 'left'] as const).map(side => (
                    <div key={side} className="space-y-1.5">
                      <Label className="text-[10px]">{side === 'top' ? 'أعلى' : side === 'bottom' ? 'أسفل' : side === 'right' ? 'يمين' : 'يسار'}</Label>
                      <Input 
                        className="h-8 text-xs" 
                        value={margins[side]}
                        onChange={(e) => setMargins({ ...margins, [side]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-6 space-y-4">
                <Label className="text-sm font-semibold">تخصيص محتوى الفاتورة</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <input type="checkbox" checked={invoiceOptions.showLogo} onChange={e => setInvoiceOptions({...invoiceOptions, showLogo: e.target.checked})} className="rounded border-slate-300 w-4 h-4 text-primary" />
                    <span>إظهار شعار الشركة</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <input type="checkbox" checked={invoiceOptions.showHeaderDetails} onChange={e => setInvoiceOptions({...invoiceOptions, showHeaderDetails: e.target.checked})} className="rounded border-slate-300 w-4 h-4 text-primary" />
                    <span>إظهار بيانات الاتصال (العنوان والهاتف)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <input type="checkbox" checked={invoiceOptions.showQR} onChange={e => setInvoiceOptions({...invoiceOptions, showQR: e.target.checked})} className="rounded border-slate-300 w-4 h-4 text-primary" />
                    <span>إظهار رمز QR</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <input type="checkbox" checked={invoiceOptions.showNotes} onChange={e => setInvoiceOptions({...invoiceOptions, showNotes: e.target.checked})} className="rounded border-slate-300 w-4 h-4 text-primary" />
                    <span>إظهار الملاحظات والتعليمات</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <input type="checkbox" checked={invoiceOptions.showTaxes} onChange={e => setInvoiceOptions({...invoiceOptions, showTaxes: e.target.checked})} className="rounded border-slate-300 w-4 h-4 text-primary" />
                    <span>إظهار البيانات الضريبية</span>
                  </label>
                </div>

                <div className="space-y-2 mt-4 max-w-xs">
                  <Label>اللون المميز للفاتورة</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={invoiceOptions.accentColor} onChange={e => setInvoiceOptions({...invoiceOptions, accentColor: e.target.value})} className="w-12 h-10 p-1 cursor-pointer" />
                    <Input type="text" value={invoiceOptions.accentColor} onChange={e => setInvoiceOptions({...invoiceOptions, accentColor: e.target.value})} className="flex-1 font-mono text-sm" dir="ltr" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">يستخدم في العناوين والحدود داخل الفاتورة المطبوعة.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Percent className="h-5 w-5 text-primary" aria-hidden />
                الضريبة والتذييل
              </CardTitle>
              <CardDescription>نسبة ضريبة القيمة المضافة الافتراضية ونص التذييل في الفاتورة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vat-rate">نسبة ضريبة القيمة المضافة الافتراضية (%)</Label>
                  <Input
                    id="vat-rate"
                    type="number"
                    {...form.register("vat_rate", { valueAsNumber: true })}
                    className="max-w-[8rem] tabular-nums"
                  />
                  <p className="text-xs text-muted-foreground">تُطبَّق على الفواتير الجديدة حسب إعدادات الصنف.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt-footer">تذييل الفاتورة</Label>
                <Textarea
                  id="receipt-footer"
                  {...form.register("receipt_footer")}
                  placeholder="شروط الاسترجاع أو عبارة شكر…"
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-3 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                disabled={loading}
                className="gap-2"
                onClick={async () => {
                  const ok = await form.trigger()
                  if (ok) setConfirmOpen(true)
                }}
              >
                <Save className="h-4 w-4" aria-hidden />
                {loading ? "جاري الحفظ…" : "حفظ التغييرات"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border bg-card shadow-sm">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-sm font-semibold">شعار الشركة</CardTitle>
              <CardDescription>معاينة بحد أقصى للارتفاع؛ يُفضّل شعار بخلفية شفافة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex max-h-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 p-4">
                {watchLogo && invoiceOptions.showLogo ? (
                  <img
                    src={watchLogo}
                    alt="معاينة الشعار"
                    className="max-h-36 w-auto max-w-full object-contain"
                  />
                ) : (
                  <div className="py-6 text-center opacity-50">
                    <Building2 className="mx-auto mb-2 h-10 w-10" aria-hidden />
                    <p className="text-xs">الشعار مخفي أو غير متوفر</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-url">رابط ملف الشعار</Label>
                <div className="relative">
                  <LinkIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="logo-url" {...form.register("logo_url")} className="pe-10 font-mono text-xs" dir="ltr" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card shadow-sm sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">معاينة الهيكل ({paperSize})</CardTitle>
              <CardDescription>معاينة مصغرة تقريبية للأبعاد المحددة.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center bg-slate-50/50 py-6 overflow-hidden">
              <div
                className="flex flex-col bg-white text-[8px] leading-tight text-slate-800 shadow-md ring-1 ring-slate-200"
                style={{
                  width: paperSize === 'A4' ? '210px' : paperSize === 'A5' ? '148px' : '200px',
                  aspectRatio: paperSize === 'A4' || paperSize === 'A5' ? '1 / 1.414' : 'auto',
                  minHeight: paperSize === '80mm' ? '250px' : 'auto',
                  borderTop: `4px solid ${invoiceOptions.accentColor}`,
                  padding: '12px'
                }}
                dir="rtl"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-[10px]" style={{ color: invoiceOptions.accentColor }}>{watchName || "اسم الشركة"}</p>
                    {invoiceOptions.showHeaderDetails && (
                      <div className="text-[7px] text-slate-500 space-y-0.5">
                        <p>{watchTax ? `الرقم الضريبي: ${watchTax}` : 'الرقم الضريبي: ---'}</p>
                        <p>هاتف: {form.watch("phone") || '---'}</p>
                      </div>
                    )}
                  </div>
                  {invoiceOptions.showLogo && watchLogo ? (
                    <img src={watchLogo} alt="" className="h-8 w-8 shrink-0 object-contain" />
                  ) : invoiceOptions.showLogo ? (
                    <div className="h-8 w-8 shrink-0 rounded border border-dashed bg-slate-50" />
                  ) : null}
                </div>
                
                {/* Body Fake Content */}
                <div className="flex-1 space-y-2">
                  <div className="w-16 h-3 rounded-sm opacity-20" style={{ backgroundColor: invoiceOptions.accentColor }} />
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-slate-100 rounded-sm" />
                    <div className="w-full h-2 bg-slate-100 rounded-sm" />
                    <div className="w-3/4 h-2 bg-slate-100 rounded-sm" />
                  </div>
                  
                  <div className="mt-4 border border-slate-100 rounded">
                    <div className="w-full h-4 opacity-10" style={{ backgroundColor: invoiceOptions.accentColor }} />
                    <div className="w-full h-3 border-t border-slate-50" />
                    <div className="w-full h-3 border-t border-slate-50" />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-end">
                  <div className="space-y-1">
                    {invoiceOptions.showNotes && <div className="w-12 h-2 bg-slate-100 rounded-sm" />}
                    {watchFooter && <p className="text-[6px] text-slate-400 mt-1">{watchFooter.length > 50 ? `${watchFooter.slice(0, 50)}…` : watchFooter}</p>}
                  </div>
                  {invoiceOptions.showQR && (
                    <div className="w-8 h-8 border border-slate-200 rounded-sm bg-slate-50 flex items-center justify-center text-[5px] text-slate-400">QR</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حفظ بيانات الفاتورة والشركة؟</AlertDialogTitle>
            <AlertDialogDescription>
              ستنعكس التغييرات على الفواتير والطباعة الجديدة. تأكد من صحة الرقم الضريبي ونسبة الضريبة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel type="button">إلغاء</AlertDialogCancel>
            <AlertDialogAction type="button" disabled={loading} onClick={() => void runSave()}>
              {loading ? "جاري الحفظ…" : "تأكيد الحفظ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
