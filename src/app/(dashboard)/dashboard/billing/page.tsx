'use client'

import { useEffect, useState } from 'react'
import { billingApi, BillingUsage } from '@/lib/api/billing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CreditCard, Users, Store, Warehouse, Package, FileText, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function BillingPage() {
  const [data, setData] = useState<BillingUsage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    billingApi.getUsage()
      .then(setData)
      .catch((err) => {
        console.error(err)
        toast.error('فشل في تحميل بيانات الاشتراك')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!data) return null

  const getPercentage = (used: number, max: number) => {
    return Math.min(Math.round((used / max) * 100), 100)
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive'
    if (percentage >= 70) return 'bg-orange-500'
    return 'bg-primary'
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الاشتراك والفوترة</h1>
          <p className="text-muted-foreground mt-1">إدارة خطة اشتراكك ومراقبة حدود الاستخدام.</p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
          ترقية الاشتراك
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-primary/10 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="pb-2">
            <CardDescription>الخطة الحالية</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              {data.plan === 'free' ? 'المجانية (Free)' : data.plan === 'starter' ? 'البداية (Starter)' : 'الاحترافية (Pro)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {data.status === 'active' ? 'نشط' : 'تجريبي'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CheckCircle2 className="w-24 h-24" />
          </div>
          <CardHeader>
            <CardTitle>حالة النظام</CardTitle>
            <CardDescription>جميع الأنظمة تعمل بشكل طبيعي مع خطتك الحالية.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex -space-x-2 space-x-reverse">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px]">
                   AI
                 </div>
               ))}
            </div>
            <p className="text-sm text-muted-foreground font-medium">نظام "سهل" يدعم نمو أعمالك بذكاء.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Users Limit */}
        <UsageCard 
          title="المستخدمين" 
          icon={<Users className="w-5 h-5" />} 
          used={data.usage.users} 
          max={data.limits.maxUsers} 
          percentage={getPercentage(data.usage.users, data.limits.maxUsers)}
          color={getStatusColor(getPercentage(data.usage.users, data.limits.maxUsers))}
        />

        {/* Branches Limit */}
        <UsageCard 
          title="الفروع" 
          icon={<Store className="w-5 h-5" />} 
          used={data.usage.branches} 
          max={data.limits.maxBranches} 
          percentage={getPercentage(data.usage.branches, data.limits.maxBranches)}
          color={getStatusColor(getPercentage(data.usage.branches, data.limits.maxBranches))}
        />

        {/* Warehouses Limit */}
        <UsageCard 
          title="المستودعات" 
          icon={<Warehouse className="w-5 h-5" />} 
          used={data.usage.warehouses} 
          max={data.limits.maxWarehouses} 
          percentage={getPercentage(data.usage.warehouses, data.limits.maxWarehouses)}
          color={getStatusColor(getPercentage(data.usage.warehouses, data.limits.maxWarehouses))}
        />

        {/* Products Limit */}
        <UsageCard 
          title="الأصناف / المنتجات" 
          icon={<Package className="w-5 h-5" />} 
          used={data.usage.products} 
          max={data.limits.maxProducts} 
          percentage={getPercentage(data.usage.products, data.limits.maxProducts)}
          color={getStatusColor(getPercentage(data.usage.products, data.limits.maxProducts))}
        />

        {/* Invoices Limit */}
        <UsageCard 
          title="الفواتير (هذا الشهر)" 
          icon={<FileText className="w-5 h-5" />} 
          used={data.usage.monthlyInvoices} 
          max={data.limits.maxInvoicesPerMonth} 
          percentage={getPercentage(data.usage.monthlyInvoices, data.limits.maxInvoicesPerMonth)}
          color={getStatusColor(getPercentage(data.usage.monthlyInvoices, data.limits.maxInvoicesPerMonth))}
        />
      </div>
    </div>
  )
}

function UsageCard({ title, icon, used, max, percentage, color }: { title: string, icon: any, used: number, max: number, percentage: number, color: string }) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-muted rounded-lg text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold">{used}</div>
          <div className="text-xs text-muted-foreground font-medium">من أصل {max}</div>
        </div>
        <Progress value={percentage} className="h-2" indicatorClassName={color} />
        <p className="text-[10px] text-muted-foreground text-left" dir="ltr">{percentage}% used</p>
      </CardContent>
    </Card>
  )
}
