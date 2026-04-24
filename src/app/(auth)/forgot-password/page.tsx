'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { backendFetch } from '@/lib/api/backend-client'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('تأكد من صيغة البريد الإلكتروني'),
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
      await backendFetch('/auth/reset', { method: 'POST', body: { email: data.email } })
    } catch (e: unknown) {
      if (e instanceof TypeError || (e instanceof Error && /fetch|network/i.test(e.message))) {
        setError('تعذّر الاتصال بالخادم. تحقق من الشبكة ثم أعد المحاولة.')
        return
      }
      // أخطاء الخادم: نعرض شاشة النجاح المحايدة ولا نكشف وجود البريد (T2.9)
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="mx-auto grid w-full max-w-md gap-6 px-4 text-center">
        <div className="flex justify-center text-primary">
          <CheckCircle2 className="h-16 w-16" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold">تم إرسال الطلب</h1>
        <p className="text-balance text-muted-foreground">
          إن وُجد حساب مرتبط بهذا البريد، ستصلك تعليمات إعادة تعيين كلمة المرور قريباً. راجع صندوق الوارد والبريد غير المرغوب.
        </p>
        <Button asChild className="mt-2">
          <Link href="/login">العودة لتسجيل الدخول</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-6 px-4">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">نسيت كلمة المرور</h1>
        <p className="text-balance text-sm text-muted-foreground">
          أدخل البريد المسجّل لدينا وسنرسل لك رابط إعادة التعيين إن وُجد الحساب
        </p>
      </div>

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
            {...register('email')}
          />
          {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
        </div>

        <Button type="submit" className="mt-2 w-full gap-2" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />
              جاري الإرسال…
            </>
          ) : (
            'إرسال الرابط'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <Link href="/login" className="text-muted-foreground underline underline-offset-4">
          العودة لتسجيل الدخول
        </Link>
      </div>
    </div>
  )
}
