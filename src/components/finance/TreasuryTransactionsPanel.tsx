"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { TreasuryTable, type TreasuryTransaction } from "@/components/finance/TreasuryTable"

function transactionDateKey(iso: string): string {
  if (!iso) return ""
  return iso.length >= 10 ? iso.slice(0, 10) : iso
}

export function TreasuryTransactionsPanel({ data }: { data: TreasuryTransaction[] }) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const filtered = useMemo(() => {
    return data.filter((t) => {
      const key = transactionDateKey(t.created_at)
      if (dateFrom && key && key < dateFrom) return false
      if (dateTo && key && key > dateTo) return false
      return true
    })
  }, [data, dateFrom, dateTo])

  return (
    <div className="space-y-4">
      <Card className="border-none bg-muted/30 shadow-sm">
        <CardContent className="flex flex-wrap items-end gap-4 p-4" dir="rtl">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">من تاريخ</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[160px] bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">إلى تاريخ</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[160px] bg-background"
            />
          </div>
        </CardContent>
      </Card>

      <TreasuryTable data={filtered} />
    </div>
  )
}
