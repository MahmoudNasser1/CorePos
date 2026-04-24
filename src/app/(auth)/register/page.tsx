'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { backendFetch, BackendApiError } from '@/lib/api/backend-client'

const registerSchema = z
  .object({
    fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
    email: z
      .string()
      .min(1, 'البريد الإلكتروني مطلوب')
      .email('تأكد من صيغة البريد الإلكتروني'),
    password: z
      .string()
      .min(1, 'كلمة المرور مطلوبة')
      .min(6, '6 أحرف على الأقل'),
    confirmPassword: z.string().min(1, 'أكد كلمة المرور'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمة المرور غير متطابقة',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setError(null)
    try {
      await backendFetch('/auth/register', {
        method: 'POST',
        body: {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
        },
      })

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (e: unknown) {
      if (e instanceof TypeError || (e instanceof Error && /fetch|network/i.test(e.message))) {
        setError('تعذّر الاتصال بالخادم. تحقق من الشبكة ثم أعد المحاولة.')
        return
      }
      if (e instanceof BackendApiError) {
        setError(e.message || 'تعذّر إكمال الطلب. حاول مرة أخرى')
        return
      }
      setError('تعذّر إكمال الطلب. حاول مرة أخرى')
    }
  }

  if (success) {
    return (
      <div className="mx-auto grid w-full max-w-md gap-6 px-4 text-center">
        <div className="flex justify-center text-primary">
          <CheckCircle2 className="h-16 w-16" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold">تم إنشاء الحساب</h1>
        <p className="text-muted-foreground">
          يمكنك تسجيل الدخول بالبريد وكلمة المرور التي اخترتها. إن كان التفعيل عبر البريد مطلوباً، راجع صندوق الوارد.
        </p>
        <Button asChild className="mt-2">
          <Link href="/login">الانتقال لتسجيل الدخول</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-6 px-4">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">حساب جديد</h1>
        <p className="text-balance text-sm text-muted-foreground">أدخل بياناتك لإنشاء حساب جديد</p>
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
          <Label htmlFor="fullName">الاسم الكامل</Label>
          <Input
            id="fullName"
            autoComplete="name"
            disabled={isSubmitting}
            {...register('fullName')}
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
            {...register('email')}
          />
          {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register('password')}
          />
          <p className="text-xs text-muted-foreground">لا تقل عن 6 أحرف؛ يُفضّل دمج أحرف وأرقام.</p>
          {errors.password && (
            <span className="text-xs text-destructive">{errors.password.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-destructive">{errors.confirmPassword.message}</span>
          )}
        </div>

        <Button
          type="submit"
          className="mt-2 w-full"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />
              جاري إنشاء الحساب…
            </>
          ) : (
            'إنشاء حساب'
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          تسجيل الدخول
        </Link>
      </div>
    </div>
  )
}
