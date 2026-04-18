import { getCustomers } from "@/lib/actions/customers"
import { PartnerTable } from "@/components/partners/PartnerTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { UserPlus, Users, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"

export default async function CustomersPage() {
  const customers = await getCustomers({ type: 'customer' })

  const totalDebts = customers
    .filter(c => c.balance > 0)
    .reduce((acc, c) => acc + c.balance, 0)

  return (
    <div className="space-y-6">
      <PageHeader 
        title="قاعدة بيانات العملاء" 
        description="إدارة العملاء، متابعة المديونيات، والنشاط التجاري."
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
          description="عدد العملاء المسجلين حالياً"
        />
        <StatCard 
          title="إجمالي المديونيات" 
          value={totalDebts} 
          icon={TrendingUp} 
          className="text-red-500"
          description="معدل الديون المستحقة عند العملاء"
        />
        <StatCard 
          title="أفضل عميل الشهر" 
          value="غير متاح" 
          isCurrency={false}
          icon={TrendingUp} 
          description="بناءً على حجم المشتريات"
        />
        <StatCard 
          title="نشاط العملاء" 
          value="نشط" 
          isCurrency={false}
          icon={TrendingUp} 
          className="text-green-600"
          description="حالة التفاعل في آخر 30 يوم"
        />
      </div>

      <PartnerTable data={customers} />
    </div>
  )
}
