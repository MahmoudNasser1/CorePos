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
import { createClient } from '@/lib/supabase/client'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صحيح'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError(null)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message || 'حدث خطأ أثناء إرسال الرابط. تأكد من صحة البريد.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="mx-auto grid w-[350px] gap-6 text-center">
        <div className="flex justify-center text-primary">
          <CheckCircle2 size={64} />
        </div>
        <h1 className="text-2xl font-bold">تم الإرسال بـنجاح!</h1>
        <p className="text-muted-foreground">
          لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. الرجاء التحقق من صندوق الوارد بريدك.
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
        <h1 className="text-3xl font-bold">نسيت كلمة المرور</h1>
        <p className="text-balance text-muted-foreground">
          أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة التعيين
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        {error && (
          <div className="p-3 text-sm text-white bg-destructive rounded-md text-center">
            {error}
          </div>
        )}
        
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
        
        <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'إرسال الرابط'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link href="/login" className="underline">
          العودة لتسجيل الدخول
        </Link>
      </div>
    </div>
  )
}
