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
    }
  })

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    setLoading(true)
    try {
      const res = await updateCompanyProfile(values)
      if (res.success) {
        toast.success("تم تحديث الإعدادات بنجاح")
      }
    } catch (error: any) {
      toast.error("حدث خطأ: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-black flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> المعلومات الأساسية
            </CardTitle>
            <CardDescription className="font-bold">بيانات شركتك التي تظهر في رأس الفاتورة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">اسم الشركة (عربي)</Label>
                <Input {...form.register("name")} className="font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Company Name (EN)</Label>
                <Input {...form.register("name_en")} className="text-left font-sans" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">رقم الهاتف</Label>
                <div className="relative">
                   <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input {...form.register("phone")} className="pr-10 font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">الرقم الضريبي</Label>
                <div className="relative">
                   <FileText className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input {...form.register("tax_number")} className="pr-10 font-mono" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">العنوان التفصيلي</Label>
              <div className="relative">
                 <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input {...form.register("address")} className="pr-10 font-bold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-black flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" /> إعدادات الضريبة والفاتورة
            </CardTitle>
            <CardDescription className="font-bold">تحديد نسبة الضريبة الافتراضية وشروط الاسترجاع</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-primary">نسبة ضريبة القيمة المضافة الافتراضية (%)</Label>
                <Input 
                  type="number" 
                  {...form.register("vat_rate", { valueAsNumber: true })} 
                  className="font-black text-lg border-primary/20" 
                />
                <p className="text-[10px] text-muted-foreground">سيتم تطبيق هذه النسبة آلياً عند إنشاء فواتير جديدة</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-destructive">تذييل الفاتورة (شروط الاسترجاع والاستبدال)</Label>
              <Textarea 
                {...form.register("receipt_footer")} 
                placeholder="مثال: البضاعة المباعة لا ترد ولا تستبدل بعد 14 يوم..."
                className="min-h-[120px] font-bold"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-secondary/10 px-6 py-4 rounded-b-xl border-t">
            <Button onClick={form.handleSubmit(onSubmit)} disabled={loading} className="w-full md:w-auto h-11 px-8 font-black">
              {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
              <Save className="mr-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-sm font-black">شعار الشركة (Logo)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center bg-secondary/20 overflow-hidden relative group">
              {form.watch("logo_url") ? (
                <img src={form.watch("logo_url")} alt="Logo Preview" className="w-full h-full object-contain p-4" />
              ) : (
                <div className="text-center p-6">
                  <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-bold">لا يوجد شعار حالياً</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold">رابط الشعار</Label>
              <div className="relative">
                 <LinkIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input {...form.register("logo_url")} placeholder="https://..." className="pr-10 text-xs font-sans" />
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
              * سيتم استخدام هذا الشعار في الفواتير المطبوعة (A4) وفي لوحة التحكم. يفضل أن تكون الخلفية شفافة.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
