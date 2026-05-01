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
import { updateMyProfile } from "@/lib/actions/settings.actions"
import { User, Phone, Image as ImageIcon, Save, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const schema = z.object({
  fullName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url("رابط الصورة غير صالح").or(z.literal("")).optional().nullable(),
})

type FormValues = z.infer<typeof schema>

interface ProfileFormProps {
  initialData: {
    fullName: string
    phone?: string | null
    avatarUrl?: string | null
    email: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: initialData.fullName,
      phone: initialData.phone,
      avatarUrl: initialData.avatarUrl,
    },
  })

  const avatarUrl = form.watch("avatarUrl")
  const fullName = form.watch("fullName")

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true)
    try {
      await updateMyProfile({
        fullName: values.fullName,
        phone: values.phone ?? undefined,
        avatarUrl: values.avatarUrl ?? undefined,
      })
      toast.success("تم تحديث الملف الشخصي بنجاح")
    } catch (error) {
      toast.error("فشل تحديث الملف الشخصي")
    } finally {
      setLoading(false)
    }
  })

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-primary/10">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback className="bg-primary/5 text-primary text-xl">
                {fullName?.slice(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-bold">المعلومات الشخصية</CardTitle>
              <CardDescription>{initialData.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              الاسم الكامل
            </Label>
            <Input
              id="fullName"
              {...form.register("fullName")}
              placeholder="أدخل اسمك الكامل"
              className="bg-background/50"
            />
            {form.formState.errors.fullName && (
              <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              رقم الهاتف
            </Label>
            <Input
              id="phone"
              {...form.register("phone")}
              placeholder="01xxxxxxxxx"
              className="bg-background/50"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="avatarUrl" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              رابط صورة الملف الشخصي
            </Label>
            <Input
              id="avatarUrl"
              {...form.register("avatarUrl")}
              placeholder="https://example.com/photo.jpg"
              className="bg-background/50"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              * سيتم استخدام هذه الصورة في القوائم والتقارير.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t bg-muted/30 pt-4">
          <Button type="submit" disabled={loading} className="gap-2 min-w-[120px]">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
