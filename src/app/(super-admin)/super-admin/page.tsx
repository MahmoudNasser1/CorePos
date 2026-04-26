import { getPlatformAdminOverview } from "@/lib/actions/platform-admin.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card className="border bg-card shadow-sm" dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {hint ? <div className="mt-2 text-xs text-muted-foreground">{hint}</div> : null}
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
          <h1 className="text-2xl font-semibold">إدارة المنصة</h1>
          <p className="text-sm text-muted-foreground">تعذّر تحميل بيانات الملخص. تأكد من تشغيل الباكند وصلاحيات الحساب.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">إدارة المنصة</h1>
          <p className="text-sm text-muted-foreground">ملخص سريع للشركات والمستخدمين والاشتراكات (أرقام حقيقية من قاعدة البيانات).</p>
        </div>
        <Badge variant="secondary">Platform Admin</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي الشركات" value={String(overview.companies.total)} />
        <StatCard title="إجمالي المستخدمين" value={String(overview.users.total)} />
        <StatCard title="مستخدمين نشطين" value={String(overview.users.active)} />
        <StatCard title="مستخدمين معطّلين" value={String(overview.users.disabled)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي الاشتراكات" value={String(overview.subscriptions.total)} hint="قد تكون 0 إذا لم يتم تشغيل migrations الخاصة بالـ SaaS بعد." />
        <StatCard title="Active" value={String(overview.subscriptions.active)} />
        <StatCard title="Trialing" value={String(overview.subscriptions.trialing)} />
        <StatCard title="Past due / Cancelled / Expired" value={`${overview.subscriptions.pastDue}/${overview.subscriptions.cancelled}/${overview.subscriptions.expired}`} />
      </div>
    </div>
  )
}

