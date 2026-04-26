"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AuthPasswordField } from "@/components/auth/AuthPasswordField"
import { RegisterValuePanel } from "@/components/auth/RegisterValuePanel"
import { backendFetch, BackendApiError } from "@/lib/api/backend-client"

const REGISTER_COUNTRY = [
  { value: "none", label: "الدولة (اختياري)" },
  { value: "EG", label: "مصر" },
  { value: "SD", label: "السودان" },
  { value: "SA", label: "السعودية" },
  { value: "AE", label: "الإمارات" },
  { value: "KW", label: "الكويت" },
  { value: "QA", label: "قطر" },
  { value: "BH", label: "البحرين" },
  { value: "OM", label: "عُمان" },
  { value: "JO", label: "الأردن" },
  { value: "LB", label: "لبنان" },
  { value: "IQ", label: "العراق" },
  { value: "MA", label: "المغرب" },
  { value: "DZ", label: "الجزائر" },
  { value: "TN", label: "تونس" },
  { value: "LY", label: "ليبيا" },
  { value: "PS", label: "فلسطين" },
  { value: "other", label: "أخرى (اذكر في حقل العنوان)" },
] as const

function buildCompanyAddressForApi(street: string, countryCode: string) {
  const t = street.trim()
  if (countryCode === "none" || countryCode === "other")
    return t || undefined
  const row = REGISTER_COUNTRY.find((c) => c.value === countryCode)
  const line = row ? `الدولة: ${row.label}` : undefined
  if (t && line) return `${t}\n${line}`
  if (t) return t
  if (line) return line
  return undefined
}

const registerSchema = z
  .object({
    company: z.string().min(2, "اسم المحل أو الشركة مطلوب (حرفان على الأقل)"),
    fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
    email: z
      .string()
      .min(1, "البريد الإلكتروني مطلوب")
      .email("تأكد من صيغة البريد الإلكتروني"),
    companyPhone: z
      .string()
      .optional()
      .transform((s) => s?.trim() ?? ""),
    companyAddress: z
      .string()
      .optional()
      .transform((s) => s?.trim() ?? ""),
    country: z
      .string()
      .optional()
      .transform((s) => s || "none"),
    password: z
      .string()
      .min(1, "كلمة المرور مطلوبة")
      .min(6, "6 أحرف على الأقل"),
    confirmPassword: z.string().min(1, "أكد كلمة المرور"),
  })
  .refine(
    (data) => !data.companyPhone || data.companyPhone.length >= 8,
    { message: "رقم هاتف التواصل يجب أن يكون 8 أرقام/أحرف على الأقل إن أدخلتَه", path: ["companyPhone"] },
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمة المرور غير متطابقة",
    path: ["confirmPassword"],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      country: "none",
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    setError(null)
    try {
      await backendFetch("/auth/register", {
        method: "POST",
        body: {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          company: data.company.trim(),
          companyAddress: buildCompanyAddressForApi(
            data.companyAddress,
            data.country ?? "none",
          ),
          companyPhone: data.companyPhone || undefined,
        },
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (e: unknown) {
      if (e instanceof TypeError || (e instanceof Error && /fetch|network/i.test(e.message))) {
        setError("تعذّر الاتصال بالخادم. تحقق من الشبكة ثم أعد المحاولة.")
        return
      }
      if (e instanceof BackendApiError) {
        setError(e.message || "تعذّر إكمال الطلب. حاول مرة أخرى")
        return
      }
      setError("تعذّر إكمال الطلب. حاول مرة أخرى")
    }
  }

  if (success) {
    return (
      <div className="container mx-auto max-w-lg px-4 sm:px-6">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="mb-2 flex justify-center text-primary">
              <CheckCircle2 className="h-14 w-14" aria-hidden />
            </div>
            <CardTitle className="text-2xl">تم إنشاء الحساب</CardTitle>
            <CardDescription className="text-base">
              يمكنك تسجيل الدخول بالبريد وكلمة المرور التي اخترتها. إن كان التفعيل عبر البريد
              مطلوباً، راجع صندوق الوارد.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button asChild>
              <Link href="/login">الانتقال لتسجيل الدخول</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)] lg:gap-14">
        <RegisterValuePanel />

        <Card className="border-border/80 shadow-xl shadow-primary/5">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl sm:text-3xl">أنشئ حسابك</CardTitle>
            <CardDescription>
              بيانات المحل والمستخدم — ثم خطوة الإعداد لضبط العملة والضريبة ونوع النشاط.
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
                <Label htmlFor="company">اسم المحل أو الشركة</Label>
                <Input
                  id="company"
                  autoComplete="organization"
                  disabled={isSubmitting}
                  {...register("company")}
                  aria-invalid={errors.company ? "true" : "false"}
                />
                {errors.company && (
                  <span className="text-xs text-destructive">{errors.company.message}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  autoComplete="name"
                  disabled={isSubmitting}
                  {...register("fullName")}
                  aria-invalid={errors.fullName ? "true" : "false"}
                />
                {errors.fullName && (
                  <span className="text-xs text-destructive">{errors.fullName.message}</span>
                )}
              </div>

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
                {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <div className="grid gap-2 sm:col-span-1">
                  <Label htmlFor="companyPhone">رقم هاتف التواصل (اختياري)</Label>
                  <Input
                    id="companyPhone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    className="text-end tabular-nums"
                    disabled={isSubmitting}
                    {...register("companyPhone")}
                    aria-invalid={errors.companyPhone ? "true" : "false"}
                  />
                  {errors.companyPhone && (
                    <span className="text-xs text-destructive">{errors.companyPhone.message}</span>
                  )}
                </div>
                <div className="grid gap-2 sm:col-span-1">
                  <Label htmlFor="companyAddress">العنوان (اختياري)</Label>
                  <Input
                    id="companyAddress"
                    autoComplete="street-address"
                    disabled={isSubmitting}
                    {...register("companyAddress")}
                    aria-invalid={errors.companyAddress ? "true" : "false"}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="country">الدولة (اختياري)</Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="country" aria-invalid={errors.country ? "true" : "false"}>
                        <SelectValue placeholder="الدولة" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGISTER_COUNTRY.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.country && (
                  <span className="text-xs text-destructive">{errors.country.message}</span>
                )}
              </div>

              <AuthPasswordField
                id="password"
                label="كلمة المرور"
                hint="لا تقل عن 6 أحرف؛ يُفضّل دمج أحرف وأرقام."
                disabled={isSubmitting}
                autoComplete="new-password"
                error={errors.password}
                registration={register("password")}
              />

              <AuthPasswordField
                id="confirmPassword"
                label="تأكيد كلمة المرور"
                disabled={isSubmitting}
                autoComplete="new-password"
                error={errors.confirmPassword}
                registration={register("confirmPassword")}
              />

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
                    جاري إنشاء الحساب…
                  </>
                ) : (
                  "إنشاء الحساب والمتابعة"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                تسجيل الدخول
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
