import { getTreasuryTransactions, getTreasuries } from "@/lib/actions/payments"
import { TreasuryTransactionsPanel } from "@/components/finance/TreasuryTransactionsPanel"
import type { TreasuryTransaction } from "@/components/finance/TreasuryTable"
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
        title="حركة الخزينة"
        subtitle="رصيد مختصر ثم حركات وارد/صادر مع إمكانية تصفية بالتاريخ."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="رصيد الخزينة الافتراضية"
          value={mainTreasury?.balance || 0}
          isCurrency
          icon={Wallet}
          className="border-primary/20 bg-primary/5"
          subtitle={mainTreasury?.name ? `الحساب: ${mainTreasury.name}` : "لم تُحدد خزينة بعد"}
        />
        <StatCard
          title="توريدات اليوم"
          value={dailyIn}
          isCurrency
          icon={ArrowUpCircle}
          className="border-border"
          subtitle="وارد مسجّل اليوم"
        />
        <StatCard
          title="صادر اليوم"
          value={dailyOut}
          isCurrency
          icon={ArrowDownCircle}
          className="border-border"
          subtitle="صرف مسجّل اليوم"
        />
        <StatCard
          title="عدد الحركات"
          value={transactions.length}
          isCurrency={false}
          icon={History}
          subtitle="في السجل الحالي (قبل التصفية)"
        />
      </div>

      <TreasuryTransactionsPanel data={transactions as TreasuryTransaction[]} />
    </div>
  )
}
