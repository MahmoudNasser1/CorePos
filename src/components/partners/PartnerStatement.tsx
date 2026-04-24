"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { DataTable } from "@/components/shared/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface StatementEntry {
  id: string
  created_at: string
  type: "invoice" | "payment"
  description: string
  debit: number
  credit: number
  balance: number
}

function typeLabel(t: string): string {
  if (t === "invoice") return "فاتورة"
  if (t === "payment") return "سند دفع"
  return t
}

function dateKey(iso: string): string {
  if (!iso) return ""
  return iso.length >= 10 ? iso.slice(0, 10) : iso
}

const columns: ColumnDef<StatementEntry>[] = [
  {
    accessorKey: "created_at",
    header: "التاريخ",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {format(new Date(row.original.created_at), "PPP", { locale: ar })}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "البيان / الحركة",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-start">
        <span className="font-medium">{row.original.description}</span>
        <span className="text-[10px] text-muted-foreground">{typeLabel(row.original.type)}</span>
      </div>
    ),
  },
  {
    accessorKey: "debit",
    header: () => <span className="text-start">مدين (عليه)</span>,
    cell: ({ row }) =>
      row.original.debit > 0 ? (
        <CurrencyDisplay amount={row.original.debit} className="font-medium text-destructive tabular-nums" />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "credit",
    header: () => <span className="text-start">دائن (له)</span>,
    cell: ({ row }) =>
      row.original.credit > 0 ? (
        <CurrencyDisplay amount={row.original.credit} className="font-medium text-foreground tabular-nums" />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "balance",
    header: () => <span className="text-start">الرصيد التراكمي</span>,
    cell: ({ row }) => {
      const b = row.original.balance
      return (
        <CurrencyDisplay
          amount={Math.abs(b)}
          className={cn(
            "font-semibold tabular-nums",
            b > 0 && "text-destructive",
            b <= 0 && "text-muted-foreground",
          )}
        />
      )
    },
  },
]

export function PartnerStatement({ data }: { data: StatementEntry[] }) {
  const [draftFrom, setDraftFrom] = useState("")
  const [draftTo, setDraftTo] = useState("")
  const [activeFrom, setActiveFrom] = useState("")
  const [activeTo, setActiveTo] = useState("")
  const [q, setQ] = useState("")
  const dq = useDeferredValue(q.trim().toLowerCase())

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const key = dateKey(row.created_at)
      if (activeFrom && key && key < activeFrom) return false
      if (activeTo && key && key > activeTo) return false
      if (dq) {
        const desc = (row.description || "").toLowerCase()
        if (!desc.includes(dq)) return false
      }
      return true
    })
  }, [data, activeFrom, activeTo, dq])

  const applyDateFilters = () => {
    setActiveFrom(draftFrom)
    setActiveTo(draftTo)
  }

  const clearFilters = () => {
    setDraftFrom("")
    setDraftTo("")
    setActiveFrom("")
    setActiveTo("")
    setQ("")
  }

  return (
    <div className="space-y-4">
      <Card className="border-none bg-muted/30 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:flex-wrap md:items-end" dir="rtl">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">من تاريخ</Label>
            <Input type="date" value={draftFrom} onChange={(e) => setDraftFrom(e.target.value)} className="w-[160px] bg-background" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">إلى تاريخ</Label>
            <Input type="date" value={draftTo} onChange={(e) => setDraftTo(e.target.value)} className="w-[160px] bg-background" />
          </div>
          <div className="min-w-0 flex-1 space-y-2 md:min-w-[200px]">
            <Label htmlFor="stmt-search" className="text-xs font-medium text-muted-foreground">
              بحث في البيان
            </Label>
            <Input
              id="stmt-search"
              placeholder="ابحث في وصف الحركة…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="flex flex-wrap gap-2 md:ms-auto">
            <Button type="button" size="sm" onClick={applyDateFilters}>
              تطبيق التاريخ
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
              تصفير
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filtered}
        showToolbar={false}
        emptyState={{
          title: "لا حركات في الفترة",
          description: "غيّر نطاق التاريخ أو امسح البحث لعرض المزيد.",
        }}
      />
    </div>
  )
}
