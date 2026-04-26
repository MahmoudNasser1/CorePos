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
import { updateCompanyProfile } from "@/lib/actions/settings.actions"
import { Building2, Percent, FileText, MapPin, Phone, Link as LinkIcon, Save } from "lucide-react"
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
                {watchLogo ? (
                  <img
                    src={watchLogo}
                    alt="معاينة الشعار"
                    className="max-h-36 w-auto max-w-full object-contain"
                  />
                ) : (
                  <div className="py-6 text-center">
                    <Building2 className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" aria-hidden />
                    <p className="text-xs text-muted-foreground">لا يوجد شعار</p>
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

          <Card className="border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">معاينة قالب A4 (مصغّرة)</CardTitle>
              <CardDescription>اتجاه RTL؛ للمراجعة البصرية فقط.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div
                className="flex aspect-[210/297] w-full max-w-[220px] flex-col border border-border bg-white p-3 text-[9px] leading-snug text-foreground shadow-sm dark:bg-zinc-950 dark:text-zinc-100"
                dir="rtl"
              >
                <div className="mb-2 flex items-start justify-between gap-2 border-b border-border pb-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{watchName || "اسم الشركة"}</p>
                    {watchTax ? <p className="text-muted-foreground">ض.ر.: {watchTax}</p> : null}
                  </div>
                  {watchLogo ? (
                    <img src={watchLogo} alt="" className="h-10 w-10 shrink-0 object-contain" />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded border border-dashed bg-muted/40" />
                  )}
                </div>
                <div className="flex-1 space-y-1 text-muted-foreground">
                  <p>فاتورة ضريبية — معاينة</p>
                  <p className="tabular-nums">ضريبة القيمة المضافة: {watchVat ?? 0}%</p>
                </div>
                {watchFooter ? (
                  <p className="mt-2 border-t border-border pt-2 text-[8px] text-muted-foreground">
                    {watchFooter.length > 120 ? `${watchFooter.slice(0, 120)}…` : watchFooter}
                  </p>
                ) : null}
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
