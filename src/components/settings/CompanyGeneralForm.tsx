"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateCompanyProfile } from "@/lib/actions/settings.actions"
import { Building2, Phone, Mail, MapPin, Hash, Image as ImageIcon, Save, Loader2 } from "lucide-react"

const schema = z.object({
  name: z.string().min(2, "اسم الشركة مطلوب"),
  nameEn: z.string().optional().nullable(),
  email: z.string().email("البريد الإلكتروني غير صالح").or(z.literal("")).optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  logoUrl: z.string().url("رابط اللوجو غير صالح").or(z.literal("")).optional().nullable(),
})

type FormValues = z.infer<typeof schema>

interface CompanyGeneralFormProps {
  initialData: {
    name: string
    nameEn?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    taxNumber?: string | null
    logoUrl?: string | null
  }
}

export function CompanyGeneralForm({ initialData }: CompanyGeneralFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData.name,
      nameEn: initialData.nameEn,
      email: initialData.email,
      phone: initialData.phone,
      address: initialData.address,
      taxNumber: initialData.taxNumber,
      logoUrl: initialData.logoUrl,
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true)
    try {
      await updateCompanyProfile(values)
      toast.success("تم تحديث بيانات الشركة بنجاح")
    } catch (error) {
      toast.error("فشل تحديث بيانات الشركة")
    } finally {
      setLoading(false)
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Building2 className="h-5 w-5 text-primary" />
            البيانات العامة للمنشأة
          </CardTitle>
          <CardDescription>هذه البيانات تظهر في الفواتير والتقارير الرسمية.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">اسم المنشأة (عربي)</Label>
            <Input id="name" {...form.register("name")} className="bg-background/50" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nameEn">اسم المنشأة (English)</Label>
            <Input id="nameEn" {...form.register("nameEn")} className="bg-background/50" dir="ltr" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              البريد الإلكتروني الرسمي
            </Label>
            <Input id="email" {...form.register("email")} className="bg-background/50" type="email" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              رقم التواصل
            </Label>
            <Input id="phone" {...form.register("phone")} className="bg-background/50" />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              العنوان بالتفصيل
            </Label>
            <Input id="address" {...form.register("address")} className="bg-background/50" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="taxNumber" className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              الرقم الضريبي
            </Label>
            <Input id="taxNumber" {...form.register("taxNumber")} className="bg-background/50" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="logoUrl" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              رابط اللوجو (SVG/PNG)
            </Label>
            <Input id="logoUrl" {...form.register("logoUrl")} className="bg-background/50" placeholder="https://..." />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t bg-muted/30 pt-4">
          <Button type="submit" disabled={loading} className="gap-2 min-w-[120px]">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? "جاري الحفظ..." : "حفظ البيانات"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
