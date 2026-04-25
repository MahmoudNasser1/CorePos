'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Warehouse, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminApi } from '@/lib/api/admin'

export default function OnboardingWarehousePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ branch: string; warehouse: string } | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include', cache: 'no-store' })
        const [branches, warehouses] = await Promise.all([adminApi.listBranches(), adminApi.listWarehouses()])
        setData({
          branch: (branches as any)?.[0]?.name || 'الفرع الرئيسي',
          warehouse: (warehouses as any)?.[0]?.name || 'المخزن الرئيسي',
        })
      } catch {
        // ignore
      } finally {
      setLoading(false)
      }
    }
    fetchData()
  }, [])

  const onNext = () => {
    router.push('/onboarding/sample-data')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">المخزون والفرع</h1>
        <p className="mx-auto w-full max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
          تم إنشاء فرع ومخزن افتراضيين؛ يمكنك تعديل الأسماء لاحقاً من الإعدادات.
        </p>
      </div>

      <div className="grid gap-4 mt-6">
        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <MapPin size={24} aria-hidden />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">الفرع الافتراضي</p>
            <p className="font-semibold">{data?.branch}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Warehouse size={24} aria-hidden />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">المخزن الافتراضي</p>
            <p className="font-semibold">{data?.warehouse}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-2 mt-4 text-center text-sm text-muted-foreground">
        <p>لا تقلق، يمكنك إضافة فروع ومخازن غير محدودة في الخطط المتقدمة</p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Button asChild variant="outline" className="w-full">
          <Link href="/onboarding/company">رجوع لتعديل بيانات الشركة</Link>
        </Button>
        <Button type="button" onClick={onNext} className="w-full">
          المتابعة
        </Button>
      </div>
    </div>
  )
}
