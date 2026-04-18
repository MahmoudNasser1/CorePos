import { getCustomers } from "@/lib/actions/customers"
import { PartnerTable } from "@/components/partners/PartnerTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Truck, Users, Wallet } from "lucide-react"
import { StatCard } from "@/components/shared/StatCard"

export default async function SuppliersPage() {
  const suppliers = await getCustomers({ type: 'supplier' })

  const totalPayables = suppliers
    .filter(s => s.balance > 0)
    .reduce((acc, s) => acc + s.balance, 0)

  return (
    <div className="space-y-6">
      <PageHeader 
        title="قائمة الموردين" 
        description="إدارة الموردين وتتبع فواتير التوريد والمدفوعات."
      >
        <Button>
          <Truck className="ml-2 h-4 w-4" /> إضافة مورد جديد
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="إجمالي الموردين" 
          value={suppliers.length} 
          isCurrency={false}
          icon={Users} 
          description="شركاء النجاح المسجلين"
        />
        <StatCard 
          title="ديون للموردين" 
          value={totalPayables} 
          icon={Wallet} 
          className="text-red-500"
          description="إجمالي الاستحقاقات المطلوبة منا"
        />
        <StatCard 
          title="أفضل مورد" 
          value="غير متاح" 
          isCurrency={false}
          icon={Truck} 
          description="بناءً على تاريخ التوريد"
        />
        <StatCard 
          title="حالة التوريد" 
          value="مستقر" 
          isCurrency={false}
          icon={Truck} 
          className="text-green-600"
          description="معدل استلام البضائع"
        />
      </div>

      <PartnerTable data={suppliers} />
    </div>
  )
}
