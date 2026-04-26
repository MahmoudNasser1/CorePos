import Link from "next/link"
import { notFound } from "next/navigation"
import { getPlatformAdminCompany } from "@/lib/actions/platform-admin.actions"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { Button } from "@/components/ui/button"
import { Building2, Mail, Phone, Users } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function PlatformCompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const company = await getPlatformAdminCompany(id)
  if (!company) return notFound()

  const subLabel = company.subscription ? `${company.subscription.status} • ${company.subscription.planId}` : "—"

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title={company.name}
        subtitle={`معرف الشركة: ${company.id}`}
      >
        <Button asChild variant="outline">
          <Link href="/super-admin/companies">رجوع للشركات</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي المستخدمين" value={company.users.total} icon={Users} />
        <StatCard title="مستخدمين نشطين" value={company.users.active} icon={Users} />
        <StatCard title="مستخدمين معطّلين" value={company.users.disabled} icon={Users} />
        <StatCard title="الاشتراك" value={subLabel} icon={Building2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-semibold mb-3">بيانات التواصل</div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden />
                البريد
              </span>
              <span dir="ltr">{company.email ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-foreground">
                <Phone className="h-4 w-4 text-muted-foreground" aria-hidden />
                الهاتف
              </span>
              <span dir="ltr">{company.phone ?? "—"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-semibold mb-3">معلومات عامة</div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-3">
              <span className="text-foreground">العملة</span>
              <span dir="ltr">{company.currency ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-foreground">المنطقة الزمنية</span>
              <span dir="ltr">{company.timezone ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-foreground">الدولة</span>
              <span dir="ltr">{company.countryCode ?? "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

