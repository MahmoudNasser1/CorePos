import { Users, Building, CreditCard, Activity, AlertTriangle, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default async function SuperAdminDashboard() {
  const overview: unknown[] = []

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8" dir="rtl">
      <div
        className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-50/80 p-4 text-sm text-amber-950 dark:border-amber-600/50 dark:bg-amber-950/30 dark:text-amber-100"
        role="status"
      >
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
        <div>
          <p className="font-semibold">منطقة للمسؤولين فقط</p>
          <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
            أي إجراء حساس يتطلب تأكيداً مزدوجاً وسياسات خادم عند التفعيل. البيانات المعروضة أدناه تجريبية حتى يُربَط واجه برمجة المنصة.
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">مسؤول المنصة</h1>
        <p className="text-sm text-muted-foreground">مؤشرات تجريبية — تُحدَّث من الخادم عند التوفر.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="إجمالي الشركات" value="—" icon={Building} color="blue" />
        <StatsCard title="اشتراكات نشطة" value="—" icon={CreditCard} color="green" />
        <StatsCard title="إيرادات المنصة" value="—" icon={Activity} color="purple" />
        <StatsCard title="تنبيهات انقضاء" value="—" icon={AlertTriangle} color="orange" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="border bg-card shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">الشركات</CardTitle>
            <CardDescription>قائمة الشركات والاشتراكات عند توفر واجهة الخادم.</CardDescription>
          </CardHeader>
          <CardContent>
            {overview.length === 0 ? (
              <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground">لا بيانات شركات من الخادم حالياً</p>
                <p className="mt-2 max-w-md">عند ربط مسارات الإدارة ستظهر الجداول والإجراءات هنا مع تأكيد قبل العمليات الحساسة.</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">تنبيهات النظام</CardTitle>
            <CardDescription>ملخص من الخادم عند التفعيل.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <p>لا تنبيهات حية — تُستبدل ببيانات حقيقية بعد التكامل.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type StatColor = "blue" | "green" | "purple" | "orange"

function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: StatColor
}) {
  const colors: Record<StatColor, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
    green: "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300",
  }

  return (
    <Card className="border bg-card shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
          </div>
          <div className={cn("rounded-2xl p-3", colors[color])}>
            <Icon className="h-6 w-6" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
