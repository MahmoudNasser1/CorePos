import { getPlatformAdminOverview } from "@/lib/actions/platform-admin.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Building2, Users, CreditCard, TrendingUp, AlertCircle, ArrowUpRight, Activity, UserX, Clock, Wallet } from "lucide-react"

export const dynamic = "force-dynamic"

function StatCard({ 
  title, 
  value, 
  hint, 
  icon: Icon,
  trend,
  colorClass = "text-primary"
}: { 
  title: string; 
  value: string; 
  hint?: string;
  icon?: any;
  trend?: "up" | "down" | "neutral";
  colorClass?: string;
}) {
  return (
    <Card className="border bg-card shadow-sm hover:shadow-md transition-all duration-200" dir="rtl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className={`h-5 w-5 ${colorClass}`} />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {hint && (
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default async function SuperAdminOverviewPage() {
  const overview = await getPlatformAdminOverview()

  if (!overview) {
    return (
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">إدارة المنصة</h1>
          <p className="text-muted-foreground mt-2">تعذّر تحميل بيانات الملخص. تأكد من تشغيل الباكند وصلاحيات الحساب.</p>
        </div>
      </div>
    )
  }

  const { revenue, expiringTrials } = overview

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            نظرة عامة على النظام
          </h1>
          <p className="text-muted-foreground mt-2">
            مرحباً بك في لوحة تحكم الإدارة المركزية (Super Admin).
          </p>
        </div>
        <Badge variant="default" className="text-sm px-4 py-1.5 shadow-sm rounded-full w-fit">
          حساب إدارة المنصة
        </Badge>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            المؤشرات الرئيسية
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="إجمالي الشركات" value={String(overview.companies.total)} icon={Building2} colorClass="text-blue-500" />
            <StatCard title="إجمالي المستخدمين" value={String(overview.users.total)} icon={Users} colorClass="text-indigo-500" />
            <StatCard title="مستخدمين نشطين" value={String(overview.users.active)} icon={Activity} colorClass="text-emerald-500" />
            <StatCard title="مستخدمين معطّلين" value={String(overview.users.disabled)} icon={UserX} colorClass="text-rose-500" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            حالة الاشتراكات
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="إجمالي الاشتراكات" value={String(overview.subscriptions.total)} icon={CreditCard} hint="جميع الاشتراكات المُسجلة" />
            <StatCard title="نشط (Active)" value={String(overview.subscriptions.active)} icon={Activity} colorClass="text-emerald-500" />
            <StatCard title="تجريبي (Trialing)" value={String(overview.subscriptions.trialing)} icon={Clock} colorClass="text-amber-500" />
            <StatCard 
              title="غير فعّال" 
              value={`${overview.subscriptions.pastDue + overview.subscriptions.cancelled + overview.subscriptions.expired}`} 
              icon={AlertCircle} 
              hint={`متأخر: ${overview.subscriptions.pastDue} | ملغي: ${overview.subscriptions.cancelled} | منتهي: ${overview.subscriptions.expired}`} 
              colorClass="text-rose-500" 
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            الأداء المالي
          </h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            <StatCard 
              title="إيرادات الشهر الحالي" 
              value={formatCurrency(revenue?.thisMonthRevenue || 0, 'EGP')} 
              icon={Wallet}
              colorClass="text-emerald-600"
              hint="إجمالي الإيرادات المحصلة هذا الشهر"
            />
            <StatCard 
              title="MRR (الإيرادات المتكررة الشهرية)" 
              value={formatCurrency(revenue?.mrr || 0, 'EGP')} 
              icon={TrendingUp}
              colorClass="text-emerald-600"
              hint="قيمة الاشتراكات النشطة شهرياً"
              trend="up"
            />
            <StatCard 
              title="ARR (الإيرادات المتكررة السنوية)" 
              value={formatCurrency(revenue?.arr || 0, 'EGP')} 
              icon={TrendingUp}
              colorClass="text-emerald-600"
              hint="MRR متوقع على مدار السنة (×12)"
              trend="up"
            />
          </div>
        </div>
      </div>

      {expiringTrials && expiringTrials.length > 0 && (
        <Card className="border-rose-100 bg-rose-50/30 shadow-sm dark:bg-rose-950/10 dark:border-rose-900/50 mt-8" dir="rtl">
          <CardHeader className="pb-3 border-b border-rose-100 dark:border-rose-900/50">
            <CardTitle className="text-lg font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              تنبيه: فترات تجريبية تنتهي قريباً (خلال 7 أيام)
            </CardTitle>
            <CardDescription>
              شركات تقترب فترتها التجريبية من الانتهاء، يتطلب المتابعة لتحويلها لاشتراكات مدفوعة.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto rounded-md border border-rose-100 dark:border-rose-900/50 bg-background/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-rose-100 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/20 text-muted-foreground">
                    <th className="py-3 px-4 text-start font-medium">اسم الشركة</th>
                    <th className="py-3 px-4 text-start font-medium">تاريخ الانتهاء</th>
                    <th className="py-3 px-4 text-end font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100 dark:divide-rose-900/50">
                  {expiringTrials.map((trial) => (
                    <tr key={trial.id} className="hover:bg-rose-50/80 dark:hover:bg-rose-900/30 transition-colors">
                      <td className="py-3 px-4 text-start font-semibold text-foreground">{trial.name}</td>
                      <td className="py-3 px-4 text-start text-rose-600 dark:text-rose-400 font-medium">
                        {new Date(trial.currentPeriodEnd).toLocaleDateString('ar-EG', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <Link 
                          href={`/super-admin/companies/${trial.id}`} 
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          عرض التفاصيل
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

