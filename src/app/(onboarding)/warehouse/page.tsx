'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Warehouse, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingWarehousePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ branch: string; warehouse: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userData.user.id)
        .single()

      if ((profile as any)?.company_id) {
        const { data: branches } = await supabase
          .from('branches')
          .select('name')
          .eq('company_id', (profile as any).company_id)
        
        const { data: warehouses } = await supabase
          .from('warehouses')
          .select('name')
          .eq('company_id', (profile as any).company_id)

        setData({
          branch: (branches as any)?.[0]?.name || 'الفرع الرئيسي',
          warehouse: (warehouses as any)?.[0]?.name || 'المخزن الرئيسي'
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [supabase])

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
        <p className="text-muted-foreground w-3/4 mx-auto leading-relaxed">
          خطوة 2 من 3: تم إنشاء فرعك ومخزنك الأول تلقائياً يمكنك تعديل الأسماء لاحقاً من الإعدادات
        </p>
      </div>

      <div className="grid gap-4 mt-6">
        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">الفرع الافتراضي</p>
            <p className="font-semibold">{data?.branch}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Warehouse size={24} />
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

      <Button onClick={onNext} className="w-full mt-4">
        المتابعة
      </Button>
    </div>
  )
}
