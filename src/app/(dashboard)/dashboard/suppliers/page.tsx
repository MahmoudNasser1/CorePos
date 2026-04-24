import { getSuppliers } from "@/lib/actions/customers.actions"
import { PartnerTable } from "@/components/partners/PartnerTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Truck, Users, Wallet } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"

export default async function SuppliersPage() {
  const suppliers = await getSuppliers()

  const totalPayables = (suppliers as any[])
    .filter((s: any) => Number(s.balance || 0) > 0)
    .reduce((acc: number, s: any) => acc + Number(s.balance || 0), 0)

  const partners = (suppliers as any[]).map((s: any) => ({
    id: s.id,
    name: s.name,
    phone: s.phone ?? null,
    address: s.address ?? null,
    balance: Number(s.balance || 0),
    type: "supplier" as const,
  }))

  return (
    <div className="space-y-6 rounded-2xl border border-amber-500/15 border-s-4 border-s-amber-500/45 bg-amber-50/15 p-4 md:p-6 dark:bg-amber-950/10">
      <PageHeader title="الموردون" subtitle="قائمة الموردين والمستحقات — نفس أعمدة العملاء مع تمييز لوني خفيف للموردين.">
        <Button type="button" disabled>
          <Truck className="me-2 h-4 w-4" aria-hidden />
          إضافة مورد جديد
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الموردين"
          value={suppliers.length}
          isCurrency={false}
          icon={Users}
          subtitle="شركاء التوريد المسجلين"
        />
        <StatCard
          title="مستحقات للموردين"
          value={totalPayables}
          isCurrency
          icon={Wallet}
          className="border-border"
          subtitle="مبالغ مستحقة لدى الموردين"
        />
        <StatCard
          title="أفضل مورد"
          value="—"
          isCurrency={false}
          icon={Truck}
          subtitle="قريبًا حسب التوريد"
        />
        <StatCard
          title="حالة التوريد"
          value="—"
          isCurrency={false}
          icon={Truck}
          className="border-border"
          subtitle="مؤشر استلام قيد التطوير"
        />
      </div>

      <PartnerTable data={partners} kind="supplier" />
    </div>
  )
}
