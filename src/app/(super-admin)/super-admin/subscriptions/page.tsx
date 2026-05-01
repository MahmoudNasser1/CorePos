import { listPlatformAdminSubscriptions } from "@/lib/actions/platform-admin.actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { CreditCard, Building2, Calendar, ShieldCheck, SearchX, ArrowUpRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SubscriptionsPage() {
  const subscriptions = await listPlatformAdminSubscriptions()

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">نشط</Badge>
      case 'trialing':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300">تجريبي</Badge>
      case 'past_due':
        return <Badge variant="destructive">متأخر</Badge>
      case 'cancelled':
      case 'expired':
        return <Badge variant="outline" className="text-muted-foreground border-muted">منتهي / ملغي</Badge>
      default:
        return <Badge variant="outline">غير معروف</Badge>
    }
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            إدارة الاشتراكات
          </h1>
          <p className="text-muted-foreground mt-2">
            تتبع ومراجعة حالة اشتراكات الشركات المسجلة على المنصة
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            سجل الاشتراكات النشطة والسابقة
          </CardTitle>
          <CardDescription>
            يعرض هذا الجدول بيانات تفصيلية لحالة الاشتراك ومواعيد التجديد لكل شركة.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-4 px-6 text-start font-semibold text-muted-foreground">الشركة</th>
                  <th className="py-4 px-6 text-start font-semibold text-muted-foreground">الباقة</th>
                  <th className="py-4 px-6 text-start font-semibold text-muted-foreground">الحالة</th>
                  <th className="py-4 px-6 text-start font-semibold text-muted-foreground">تاريخ الانتهاء</th>
                  <th className="py-4 px-6 text-end font-semibold text-muted-foreground">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 text-start">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {sub.companyName}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-start text-muted-foreground">{sub.planId || 'غير محدد'}</td>
                    <td className="py-4 px-6 text-start">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="py-4 px-6 text-start text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 opacity-70" />
                        {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('ar-EG', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        }) : '-'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-end">
                      <Link 
                        href={`/super-admin/companies/${sub.companyId}`} 
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        عرض الشركة
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <SearchX className="h-10 w-10 opacity-20" />
                        <p>لا يوجد اشتراكات مسجلة حالياً</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
