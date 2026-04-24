'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { backendFetch, BackendApiError } from '@/lib/api/backend-client'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'أدخل البريد الإلكتروني')
    .email('تأكد من صيغة البريد الإلكتروني'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف'),
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
      await backendFetch('/auth/login', {
        method: 'POST',
        body: {
          email: data.email,
          password: data.password,
        },
      })

      router.push('/dashboard')
      router.refresh()
    } catch (e: unknown) {
      if (e instanceof TypeError || (e instanceof Error && /fetch|network/i.test(e.message))) {
        setError('تعذّر الاتصال بالخادم. تحقق من الشبكة ثم أعد المحاولة.')
        return
      }
      if (e instanceof BackendApiError && (e.status === 401 || e.status === 403)) {
        setError('بيانات الدخول غير صحيحة')
        return
      }
      setError('بيانات الدخول غير صحيحة')
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-6 px-4">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">تسجيل الدخول</h1>
        <p className="text-balance text-sm text-muted-foreground">
          أدخل بيانات الدخول للمتابعة إلى لوحة التحكم
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
          {errors.email && (
            <span className="text-xs text-destructive">{errors.email.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={isSubmitting}
            {...register('password')}
          />
          {errors.password && (
            <span className="text-xs text-destructive">{errors.password.message}</span>
          )}
        </div>

        <Button
          type="submit"
          className="w-full gap-2"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />
              جاري تسجيل الدخول…
            </>
          ) : (
            'تسجيل الدخول'
          )}
        </Button>

        <p className="text-center text-sm">
          <Link href="/forgot-password" className="text-muted-foreground underline underline-offset-4">
            نسيت كلمة المرور؟
          </Link>
        </p>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
          إنشاء حساب جديد
        </Link>
      </div>
    </div>
  )
}
