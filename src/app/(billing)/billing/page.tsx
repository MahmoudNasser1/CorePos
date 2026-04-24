'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CompanyWithSubscription } from '@/types/auth.types'
import { 
  CreditCard, 
  ChevronLeft, 
  AlertTriangle, 
  Package, 
  MapPin, 
  Users,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

type UsageCounts = {
  products: number
  branches: number
  users: number
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ company: CompanyWithSubscription | null; usage: UsageCounts } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBillingData() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userData.user.id)
        .single() as { data: { company_id: string } | null }

      if (profile?.company_id) {
        // Fetch subscription and company usage
        const { data: company } = await supabase
          .from('companies')
          .select(`
            name,
            subscriptions (
              status,
              current_period_end,
              plan_id,
              plans (
                name,
                max_branches,
                max_users,
                max_products
              )
            )
          `)
          .eq('id', profile.company_id)
          .single() as { data: CompanyWithSubscription }

        // Fetch actual usage counts
        const [
          { count: productsCount },
          { count: branchesCount },
          { count: usersCount }
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id),
          supabase.from('branches').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('company_id', profile.company_id)
        ])

        setData({
          company,
          usage: {
            products: productsCount || 0,
            branches: branchesCount || 0,
            users: usersCount || 0
          }
        })
      }
      setLoading(false)
    }
    fetchBillingData()
  }, [supabase])

  if (loading) {
    return <div className="flex justify-center py-20 animate-pulse text-muted-foreground">جاري تحميل بيانات الاشتراك...</div>
  }

  const sub = data?.company?.subscriptions?.[0]
  const plan = sub?.plans
  const isTrial = sub?.status === 'trialing'
  const isExpired = sub?.current_period_end ? new Date(sub.current_period_end) < new Date() : false

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الاشتراك</h1>
          <p className="text-muted-foreground">إدارة خطتك الحالية وتفاصيل الدفع</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard" className="flex items-center gap-2">
            العودة للوحة التحكم
            <ChevronLeft size={16} />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Plan Card */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-primary/10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">خطتك الحالية: {plan?.name || 'مجانية'}</CardTitle>
                <CardDescription>
                  {isTrial ? 'أنت حالياً في الفترة التجريبية' : 'اشتراك مفعل'}
                </CardDescription>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isExpired ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-700'}`}>
                {isExpired ? 'منتهي' : 'نشط'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 text-sm">
                <Clock className="text-muted-foreground" size={18} />
                <span>
                    ينتهي الاشتراك في: {sub?.current_period_end ? format(new Date(sub.current_period_end), 'PPP', { locale: ar }) : 'غير محدد'}
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <UsageMetric 
                icon={<Package size={16} />} 
                label="المنتجات" 
                current={data?.usage?.products || 0} 
                max={plan?.max_products ?? null} 
              />
              <UsageMetric 
                icon={<MapPin size={16} />} 
                label="الفروع" 
                current={data?.usage?.branches || 0} 
                max={plan?.max_branches ?? null} 
              />
              <UsageMetric 
                icon={<Users size={16} />} 
                label="المستخدمين" 
                current={data?.usage?.users || 0} 
                max={plan?.max_users ?? null} 
              />
            </div>
          </CardContent>
          <CardFooter className="bg-secondary/10 border-t flex justify-between">
            <p className="text-sm text-muted-foreground">هل تحتاج للمزيد من المميزات؟</p>
            <Button asChild size="sm">
              <Link href="/billing/upgrade">ترقية الخطة</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Invoice Card Sneak Peek */}
        <Card className="shadow-sm">
             <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard size={18} /> 
                    طرق الدفع
                </CardTitle>
             </CardHeader>
             <CardContent className="text-center py-8">
                 <AlertTriangle className="mx-auto mb-2 text-amber-500" size={32} />
                 <p className="text-sm font-medium">الدفع حالياً بـالتحويل المباشر</p>
                 <p className="text-xs text-muted-foreground mt-2">نحن نعمل على إضافة طرق دفع إلكترونية قريباً</p>
             </CardContent>
             <CardFooter>
                 <Button asChild variant="ghost" className="w-full">
                     <Link href="/billing/history">سجل المدفوعات</Link>
                 </Button>
             </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function UsageMetric({ icon, label, current, max }: { icon: React.ReactNode, label: string, current: number, max: number | null }) {
  const percentage = max ? Math.min((current / max) * 100, 100) : 0
  const isUnlimited = !max || max === -1

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
          {icon} {label}
        </span>
        <span className="font-semibold">
          {current} / {isUnlimited ? '∞' : max}
        </span>
      </div>
      {!isUnlimited && (
        <Progress value={percentage} className="h-1.5" />
      )}
    </div>
  )
}
