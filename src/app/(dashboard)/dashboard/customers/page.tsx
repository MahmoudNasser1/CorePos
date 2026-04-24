import { getCustomers } from "@/lib/actions/customers.actions"
import { PartnerTable } from "@/components/partners/PartnerTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { UserPlus, Users, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"

export const dynamic = "force-dynamic"

export default async function CustomersPage() {
  const customers = await getCustomers()

  const totalDebts = (customers as any[])
    .filter((c: any) => Number(c.balance || 0) > 0)
    .reduce((acc: number, c: any) => acc + Number(c.balance || 0), 0)

  const partners = (customers as any[]).map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phone ?? null,
    address: c.address ?? null,
    balance: Number(c.balance || 0),
    type: "customer" as const,
  }))

  return (
    <div className="space-y-6 rounded-2xl border border-sky-500/15 border-s-4 border-s-sky-500/45 bg-sky-50/15 p-4 md:p-6 dark:bg-sky-950/10">
      <PageHeader title="العملاء" subtitle="قائمة العملاء والأرصدة — نفس تجربة الموردين مع تمييز لوني خفيف للعملاء.">
        <Button type="button" className="gap-2" disabled title="يتم ربط نموذج إضافة عميل لاحقاً">
          <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
          إضافة عميل جديد
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي العملاء"
          value={customers.length}
          isCurrency={false}
          icon={Users}
          subtitle="عدد العملاء المسجلين حالياً"
        />
        <StatCard
          title="إجمالي المديونيات"
          value={totalDebts}
          isCurrency
          icon={TrendingUp}
          className="border-border"
          subtitle="رصيد مدين (عليه) لدى العملاء"
        />
        <StatCard
          title="أفضل عميل الشهر"
          value="—"
          isCurrency={false}
          icon={TrendingUp}
          subtitle="قريبًا حسب حجم المشتريات"
        />
        <StatCard
          title="نشاط العملاء"
          value="—"
          isCurrency={false}
          icon={TrendingUp}
          className="border-border"
          subtitle="مؤشر تفاعل قيد التطوير"
        />
      </div>

      <PartnerTable data={partners} kind="customer" />
    </div>
  )
}
