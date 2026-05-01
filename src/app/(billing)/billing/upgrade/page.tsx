'use client'

import { useState } from 'react'
import { Check, MessageSquare, Star, Zap, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { billingApi } from '@/lib/api/billing'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const WHATSAPP_NUMBER = '201113511940' // Egyptian format
const CONTACT_TEXT = 'أهلاً، أرغب في ترقية اشتراكي في CorePOS'

export default function UpgradePage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')

  const openWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(CONTACT_TEXT)}`, '_blank')
  }

  const handleCheckout = async (planId: string) => {
    if (planId === 'free') return
    
    try {
      setLoadingPlan(planId)
      const { checkoutUrl } = await billingApi.checkout(planId, cycle)
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('حدث خطأ أثناء بدء عملية الدفع. يرجى المحاولة لاحقاً.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">اختر الخطة المناسبة لعملك</h1>
          <p className="text-xl text-muted-foreground">
            خطط مرنة تناسب احتياجاتك، من المحلات الصغيرة إلى الشركات المتعددة الفروع
          </p>
        </div>

        <div className="flex justify-center">
          <Tabs defaultValue="monthly" onValueChange={(v) => setCycle(v as any)} className="w-[300px]">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1">
              <TabsTrigger value="monthly" className="text-sm">دفع شهري</TabsTrigger>
              <TabsTrigger value="yearly" className="text-sm">
                دفع سنوي
                <span className="mr-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-700 font-bold">خصم 20%</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3 pt-4">
        {/* FREE PLAN */}
        <PlanCard 
          title="التجريبية" 
          price="مـجاناً" 
          description="مثالية لتجربة النظام"
          features={[
            'فرع واحد فقط',
            'مخزن واحد فقط',
            'حتى 100 منتج',
            'مستخدم واحد (المالك)',
            'تقارير مبيعات أساسية'
          ]}
          icon={<Zap className="text-blue-500" />}
          onAction={() => {}}
          actionText="خطة البداية"
          disabled
        />

        {/* STARTER PLAN */}
        <PlanCard 
          title="الأساسية (Starter)" 
          price={cycle === 'monthly' ? '500 ج.م' : '5,000 ج.م'}
          period={cycle === 'monthly' ? '/ شهر' : '/ سنة'}
          description="للمحلات والأنشطة الصغيرة"
          featured
          features={[
            'حتى 5 فروع',
            'حتى 5 مخازن',
            'حتى 500 منتج',
            '5 مستخدمين',
            'نظام الخصومات والولاء',
            'تقارير تفصيلية'
          ]}
          icon={<Star className="text-amber-500" />}
          onAction={() => handleCheckout('starter')}
          isLoading={loadingPlan === 'starter'}
          actionText="ابدأ الآن"
        />

        {/* PRO PLAN */}
        <PlanCard 
          title="الاحترافية (Pro)" 
          price={cycle === 'monthly' ? '1,000 ج.م' : '10,000 ج.م'}
          period={cycle === 'monthly' ? '/ شهر' : '/ سنة'}
          description="للشركات والأنشطة الكبرى"
          features={[
            'فروع ومخازن غير محدودة',
            'منتجات ومستخدمين غير محدودين',
            'دعم فني مخصص 24/7',
            'ربط API ومميزات خاصة',
            'تخصيص كامل للتقارير',
            'إدارة سلاسل الإمداد'
          ]}
          icon={<Shield className="text-green-600" />}
          onAction={() => handleCheckout('pro')}
          isLoading={loadingPlan === 'pro'}
          actionText="ابدأ الاحتراف"
        />
      </div>

      <div className="bg-primary/5 border rounded-2xl p-8 text-center space-y-6 max-w-4xl mx-auto mt-12">
        <div className="space-y-2">
            <h2 className="text-2xl font-bold">تحتاج لمساعدة في الاختيار؟</h2>
            <p className="text-muted-foreground">
                فريقنا متاح دائماً لمساعدتك في اختيار الباقة الأنسب لحجم عملك وتفعيلها فوراً.
            </p>
        </div>
        <Button onClick={openWhatsApp} size="lg" className="bg-green-600 hover:bg-green-700 h-14 px-8 text-lg gap-3">
            <MessageSquare size={24} />
            تحدث معنا عبر الواتساب للاستفسار
        </Button>
      </div>
    </div>
  )
}

interface PlanCardProps {
  title: string
  price: string
  period?: string
  description: string
  features: string[]
  featured?: boolean
  icon: React.ReactNode
  onAction: () => void
  isLoading?: boolean
  disabled?: boolean
  actionText: string
}

function PlanCard({ 
  title, 
  price, 
  period, 
  description, 
  features, 
  featured = false, 
  icon, 
  onAction, 
  isLoading,
  disabled,
  actionText
}: PlanCardProps) {
  return (
    <Card className={`relative flex flex-col h-full transition-all duration-300 hover:shadow-xl ${featured ? 'border-primary ring-1 ring-primary shadow-md scale-105 z-10' : 'border-border grayscale-[0.2] hover:grayscale-0'}`}>
      {featured && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
          الأكثر طلباً
        </div>
      )}
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto p-3 rounded-2xl bg-secondary w-fit mb-2">
            {icon}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="py-2">
            <span className="text-3xl font-bold tracking-tighter">{price}</span>
            {period && <span className="text-sm text-muted-foreground mr-1">{period}</span>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature: string) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
                <div className="mt-1 bg-primary/10 rounded-full p-0.5 text-primary shrink-0">
                    <Check size={12} />
                </div>
                <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
            className="w-full h-12 text-lg font-bold" 
            variant={featured ? 'default' : 'outline'}
            onClick={onAction}
            disabled={disabled || isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : actionText}
        </Button>
      </CardFooter>
    </Card>
  )
}

