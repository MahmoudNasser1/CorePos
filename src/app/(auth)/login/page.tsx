"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthPasswordField } from "@/components/auth/AuthPasswordField"
import { backendFetch, BackendApiError } from "@/lib/api/backend-client"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "أدخل البريد الإلكتروني")
    .email("تأكد من صيغة البريد الإلكتروني"),
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    try {
      await backendFetch("/auth/login", {
        method: "POST",
        body: {
          email: data.email,
          password: data.password,
        },
      })

      router.push("/dashboard")
      router.refresh()
    } catch (e: unknown) {
      if (e instanceof TypeError || (e instanceof Error && /fetch|network/i.test(e.message))) {
        setError("تعذّر الاتصال بالخادم. تحقق من الشبكة ثم أعد المحاولة.")
        return
      }
      if (e instanceof BackendApiError && (e.status === 401 || e.status === 403)) {
        setError("بيانات الدخول غير صحيحة")
        return
      }
      setError("بيانات الدخول غير صحيحة")
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 sm:px-6">
      <Card className="border-border/80 shadow-xl shadow-primary/5">
        <CardHeader className="text-center sm:text-start">
          <CardTitle className="text-2xl sm:text-3xl">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بيانات الدخول للمتابعة إلى لوحة التحكم</CardDescription>
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

            <AuthPasswordField
              id="password"
              label="كلمة المرور"
              disabled={isSubmitting}
              autoComplete="current-password"
              error={errors.password}
              registration={register("password")}
            />

            <Button
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  جاري تسجيل الدخول…
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>

            <p className="text-center text-sm">
              <Link
                href="/forgot-password"
                className="text-muted-foreground underline-offset-4 hover:underline"
              >
                نسيت كلمة المرور؟
              </Link>
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
