'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Database, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingSampleDataPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const insertSampleData = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userData.user?.id)
        .single()

      if (!profile?.company_id) throw new Error('Company not found')

      const company_id = profile.company_id

      // 1. Categories
      const { data: categories, error: catErr } = await supabase.from('product_categories').insert([
        { company_id, name: 'هواتف ذكية' },
        { company_id, name: 'إكسسوارات' },
        { company_id, name: 'قطع غيار' }
      ]).select()

      if (catErr) throw catErr

      // 2. Sample Products
      if (categories && categories.length > 0) {
        const { error: prodErr } = await supabase.from('products').insert([
          { 
            company_id, 
            category_id: categories[0].id, 
            name: 'iPhone 15 Pro', 
            sku: 'IPH-15P', 
            buy_price: 50000, 
            sell_price: 60000,
            track_inventory: true
          },
          { 
            company_id, 
            category_id: categories[1].id, 
            name: 'شاحن سريع 20W', 
            sku: 'ACC-CHG20', 
            buy_price: 300, 
            sell_price: 500,
            track_inventory: true
          }
        ])
        if (prodErr) throw prodErr
      }

      // 3. Sample Customer
      await supabase.from('customers').insert({
        company_id,
        name: 'عميل تجريبي',
        phone: '01000000000'
      })

      // Update company onboarding status (if we had a field, but for now we redirect to dashboard)
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError('حدث خطأ أثناء إدخال البيانات التجريبية. يمكنك تخطي هذه الخطوة.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const skipStep = () => {
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">بيانات تجريبية</h1>
        <p className="text-muted-foreground w-3/4 mx-auto leading-relaxed">
          خطوة 3 من 3: هل تود إضافة بيانات تجريبية (منتجات وعملاء) لتجربة النظام فوراً؟
        </p>
      </div>

      <div className="grid gap-4 mt-6">
        <div className="flex flex-col gap-6 p-6 rounded-lg bg-primary/5 border border-primary/20 text-center items-center">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Sparkles size={40} />
            </div>
            <div className="space-y-2">
                <h3 className="font-bold text-lg">بـدء سريع بنقرة واحدة</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={14} className="text-green-500" /> إضافة 3 أقسام رئيسية</li>
                    <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={14} className="text-green-500" /> إضافة منتجات تجريبية بأسعارها</li>
                    <li className="flex items-center gap-2 justify-center"><CheckCircle2 size={14} className="text-green-500" /> إضافة عملاء وموردين وهميين</li>
                </ul>
            </div>
        </div>
      </div>

      {error && (
          <div className="p-3 text-sm text-white bg-destructive rounded-md text-center">
            {error}
          </div>
      )}

      <div className="flex flex-col gap-3 mt-4">
        <Button onClick={insertSampleData} className="w-full h-12 text-lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'نعم، أضف بيانات تجريبية'}
        </Button>
        <Button onClick={skipStep} variant="ghost" className="w-full" disabled={isSubmitting}>
          تخطي هذه الخطوة وابدأ بالبيانات الفارغة
        </Button>
      </div>
    </div>
  )
}
