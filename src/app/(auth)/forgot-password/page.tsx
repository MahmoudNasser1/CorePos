"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { backendFetch } from "@/lib/api/backend-client"

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("تأكد من صيغة البريد الإلكتروني"),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError(null)
    try {
      await backendFetch("/auth/reset", { method: "POST", body: { email: data.email } })
    } catch (e: unknown) {
      if (e instanceof TypeError || (e instanceof Error && /fetch|network/i.test(e.message))) {
        setError("تعذّر الاتصال بالخادم. تحقق من الشبكة ثم أعد المحاولة.")
        return
      }
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="container mx-auto max-w-md px-4 sm:px-6">
        <Card className="border-primary/20 text-center shadow-lg">
          <CardHeader>
            <div className="mb-2 flex justify-center text-primary">
              <CheckCircle2 className="h-14 w-14" aria-hidden />
            </div>
            <CardTitle className="text-2xl">تم إرسال الطلب</CardTitle>
            <CardDescription className="text-base">
              إن وُجد حساب مرتبط بهذا البريد، ستصلك تعليمات إعادة تعيين كلمة المرور قريباً. راجع
              صندوق الوارد والبريد غير المرغوب.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/login">العودة لتسجيل الدخول</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-md px-4 sm:px-6">
      <Card className="border-border/80 shadow-xl shadow-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">نسيت كلمة المرور</CardTitle>
          <CardDescription>
            أدخل البريد المسجّل لدينا وسنرسل لك رابط إعادة التعيين إن وُجد الحساب
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                disabled={isSubmitting}
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <span className="text-xs text-destructive">{errors.email.message}</span>
              )}
            </div>

            <Button
              type="submit"
              className="mt-1 w-full gap-2"
              size="lg"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  جاري الإرسال…
                </>
              ) : (
                "إرسال الرابط"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link href="/login" className="text-muted-foreground underline-offset-4 hover:underline">
              العودة لتسجيل الدخول
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
