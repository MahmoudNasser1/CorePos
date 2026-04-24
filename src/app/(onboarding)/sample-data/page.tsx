'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setupSampleData } from '@/lib/actions/onboarding.actions'

export default function OnboardingSampleDataPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const insertSampleData = async () => {
    setIsSubmitting(true)
    setError(null)

    const result = await setupSampleData()

    if (result.error) {
      setError('حدث خطأ أثناء إدخال البيانات التجريبية: ' + result.error)
      setIsSubmitting(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const skipStep = () => {
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">بيانات تجريبية</h1>
        <p className="mx-auto w-full max-w-sm text-balance text-sm text-muted-foreground leading-relaxed">
          الخطوة 3 من 3: بيانات تجريبية — يمكن إضافة أصناف وعملاء وهميين لتجربة النظام فوراً، أو التخطي والبدء فارغاً
        </p>
      </div>

      <div className="grid gap-4 mt-6">
        <div className="flex flex-col gap-6 p-6 rounded-lg bg-primary/5 border border-primary/20 text-center items-center">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Sparkles size={40} />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-bold">بدء سريع بنقرة واحدة</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={14} className="text-green-500" /> إضافة 3 أقسام رئيسية</li>
                    <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={14} className="text-green-500" /> إضافة منتجات تجريبية بأسعارها</li>
                    <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={14} className="text-green-500" /> إضافة عملاء وموردين وهميين</li>
                </ul>
            </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <Button asChild variant="outline" className="w-full" disabled={isSubmitting}>
          <Link href="/onboarding/warehouse">رجوع لخطوة الفرع والمخزن</Link>
        </Button>
        <Button
          type="button"
          onClick={insertSampleData}
          className="h-12 w-full text-lg"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="me-2 h-5 w-5 animate-spin" aria-hidden />
              جاري الإعداد…
            </>
          ) : (
            'نعم، أضف بيانات تجريبية'
          )}
        </Button>
        <Button type="button" onClick={skipStep} variant="ghost" className="w-full" disabled={isSubmitting}>
          تخطي هذه الخطوة وابدأ بالبيانات الفارغة
        </Button>
      </div>
    </div>
  )
}
