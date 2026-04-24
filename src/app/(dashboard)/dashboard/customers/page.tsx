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
    type: 'customer' as const,
  }))

  return (
    <div className="space-y-6">
      <PageHeader 
        title="قاعدة بيانات العملاء" 
        subtitle="إدارة العملاء وتتبع حساباتهم ومديونياتهم."
      >
        <Button>
          <UserPlus className="ml-2 h-4 w-4" /> إضافة عميل جديد
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          icon={TrendingUp} 
          className="text-red-500"
          subtitle="معدل الديون المستحقة عند العملاء"
        />
        <StatCard 
          title="أفضل عميل الشهر" 
          value="غير متاح" 
          isCurrency={false}
          icon={TrendingUp} 
          subtitle="بناءً على حجم المشتريات"
        />
        <StatCard 
          title="نشاط العملاء" 
          value="نشط" 
          isCurrency={false}
          icon={TrendingUp} 
          className="text-green-600"
          subtitle="حالة التفاعل في آخر 30 يوم"
        />
      </div>

      <PartnerTable data={partners} />
    </div>
  )
}
