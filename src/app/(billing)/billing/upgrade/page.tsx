'use client'

import { Check, MessageSquare, Star, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const WHATSAPP_NUMBER = '201113511940' // Egyptian format
const CONTACT_TEXT = 'أهلاً، أرغب في ترقية اشتراكي في CorePOS'

export default function UpgradePage() {
  const openWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(CONTACT_TEXT)}`, '_blank')
  }

  return (
    <div className="space-y-10">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">اختر الخطة المناسبة لعملك</h1>
        <p className="text-xl text-muted-foreground">
          خطط مرنة تناسب احتياجاتك، من المحلات الصغيرة إلى الشركات المتعددة الفروع
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
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
        />

        {/* BASIC PLAN */}
        <PlanCard 
          title="الأساسية" 
          price="200 ج.م / شهر" 
          description="للمحلات والأنشطة الصغيرة"
          featured
          features={[
            'حتى 3 فروع',
            'حتى 3 مخازن',
            'حتى 2,000 منتج',
            '3 مستخدمين',
            'نظام الخصومات والولاء',
            'تقارير تفصيلية'
          ]}
          icon={<Star className="text-amber-500" />}
        />

        {/* PRO PLAN */}
        <PlanCard 
          title="الاحترافية" 
          price="تواصل معنا" 
          description="للشركات والأنشطة الكبرى"
          features={[
            'فروع غير محدودة',
            'مخازن غير محدودة',
            'منتجات غير محدودة',
            'مستخدمين غير محدودين',
            'دعم فني مخصص 24/7',
            'ربط API ومميزات خاصة'
          ]}
          icon={<Shield className="text-green-600" />}
        />
      </div>

      <div className="bg-primary/5 border rounded-2xl p-8 text-center space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
            <h2 className="text-2xl font-bold">كيف يتم الاشتراك والترقية؟</h2>
            <p className="text-muted-foreground">
                نحن نعتمد حالياً نظام التفعيل المباشر لضمان أفضل خدمة ودعم فني. يمكنك التواصل معنا عبر الواتساب لتفعيل خطتك فوراً.
            </p>
        </div>
        <Button onClick={openWhatsApp} size="lg" className="bg-green-600 hover:bg-green-700 h-14 px-8 text-lg gap-3">
            <MessageSquare size={24} />
            تحدث معنا عبر الواتساب للترقية
        </Button>
      </div>
    </div>
  )
}

function PlanCard({ title, price, description, features, featured = false, icon }: { title: string; price: string; description: string; features: string[]; featured?: boolean; icon: React.ReactNode }) {
  return (
    <Card className={`relative flex flex-col h-full transition-all duration-300 hover:shadow-xl ${featured ? 'border-primary ring-1 ring-primary shadow-md scale-105 z-10' : 'border-border grayscale-[0.3] hover:grayscale-0'}`}>
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
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature: string) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
                <div className="mt-1 bg-primary/10 rounded-full p-0.5 text-primary">
                    <Check size={12} />
                </div>
                <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {/* All buttons lead to WhatsApp for now as per instructions */}
        <Button 
            className="w-full h-11" 
            variant={featured ? 'default' : 'outline'}
            onClick={() => window.open(`https://wa.me/201113511940?text=${encodeURIComponent('أرغب في اختيار باقة: ' + title)}`, '_blank')}
        >
          {title === 'التجريبية' ? 'خطة البداية' : 'اطلب هذه الباقة'}
        </Button>
      </CardFooter>
    </Card>
  )
}
