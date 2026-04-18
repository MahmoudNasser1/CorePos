import { getTreasuryTransactions, getTreasuries } from "@/lib/actions/payments"
import { TreasuryTable } from "@/components/finance/TreasuryTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { Wallet, ArrowDownCircle, ArrowUpCircle, History } from "lucide-react"

export default async function TreasuryPage() {
  const [transactions, treasuries] = await Promise.all([
    getTreasuryTransactions(),
    getTreasuries()
  ])

  // Assuming we use the first (default) treasury for main stats
  const mainTreasury = treasuries[0]
  
  const dailyIn = transactions
    .filter(t => t.type === 'in' && new Date(t.created_at).toDateString() === new Date().toDateString())
    .reduce((acc, t) => acc + t.amount, 0)

  const dailyOut = transactions
    .filter(t => t.type === 'out' && new Date(t.created_at).toDateString() === new Date().toDateString())
    .reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader 
        title="إدارة الخزينة" 
        description="متابعة حركة النقدية والودائع والشركات."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="الرصيد الحالي" 
          value={mainTreasury?.balance || 0} 
          icon={Wallet} 
          className="bg-primary/5 border-primary/20"
          description="إجمالي النقدية المتوفرة حالياً"
        />
        <StatCard 
          title="توريدات اليوم" 
          value={dailyIn} 
          icon={ArrowUpCircle} 
          className="text-green-600"
          description="إجمالي المبالغ المحصلة اليوم"
        />
        <StatCard 
          title="مصروفات اليوم" 
          value={dailyOut} 
          icon={ArrowDownCircle} 
          className="text-red-500"
          description="إجمالي المبالغ الخارجة اليوم"
        />
        <StatCard 
          title="إجمالي العمليات" 
          value={transactions.length} 
          isCurrency={false}
          icon={History} 
          description="عدد الحركات المالية المسجلة"
        />
      </div>

      <TreasuryTable data={transactions} />
    </div>
  )
}
