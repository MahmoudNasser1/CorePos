"use server"

import { getTreasuries } from "@/lib/actions/payments"
import { TreasuryList } from "@/components/finance/TreasuryList"
import { Wallet } from "lucide-react"

export default async function TreasuriesPage() {
  const treasuries = await getTreasuries()

  return (
    <div className="space-y-6 pt-2 font-cairo">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" /> إدارة الخزائن والموارد المالية
          </h1>
          <p className="text-muted-foreground font-bold">إضافة وإدارة الخزائن النقدية والحسابات البنكية ومتابعة أرصدتها</p>
        </div>
      </div>

      <TreasuryList initialData={treasuries} />
    </div>
  )
}
