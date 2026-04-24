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
import { backendFetch } from '@/lib/api/backend-client'
const registerSchema = z.object({
  fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string().min(6, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.password === data.confirmPassword, {
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
      // Auto redirect after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      setError('حدث خطأ أثناء إنشاء الحساب')
    }
  }


  if (success) {
    return (
      <div className="mx-auto grid w-[350px] gap-6 text-center">
        <div className="flex justify-center text-primary">
          <CheckCircle2 size={64} />
        </div>
        <h1 className="text-2xl font-bold">تم إنشاء الحساب بنجاح!</h1>
        <p className="text-muted-foreground">
          لقد أرسلنا رابط تفعيل إلى بريدك الإلكتروني. يرجى تفعيل الحساب لتتمكن من الدخول والمتابعة.
        </p>
        <Button asChild className="mt-4">
          <Link href="/login">العودة لتسجيل الدخول</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">حساب جديد</h1>
        <p className="text-balance text-muted-foreground">
          أدخل بياناتك لإنشاء حساب جديد
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        {error && (
          <div className="p-3 text-sm text-white bg-destructive rounded-md text-center">
            {error}
          </div>
        )}
        
        <div className="grid gap-2">
          <Label htmlFor="fullName">الاسم الكامل</Label>
          <Input
            id="fullName"
            placeholder="أحمد محمد"
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
            placeholder="m@example.com"
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
            disabled={isSubmitting}
            {...register('password')}
          />
          {errors.password && (
            <span className="text-xs text-destructive">{errors.password.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
          <Input
            id="confirmPassword"
            type="password"
            disabled={isSubmitting}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-destructive">{errors.confirmPassword.message}</span>
          )}
        </div>
        
        <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'إنشاء حساب'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="underline">
          تسجيل الدخول
        </Link>
      </div>
    </div>
  )
}
