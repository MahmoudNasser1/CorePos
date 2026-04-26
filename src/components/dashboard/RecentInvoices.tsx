"use client"

import Link from "next/link"
import { ReceiptText, ChevronLeft } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency } from "@/lib/utils"

interface RecentInvoicesProps {
  invoices: any[]
}

function statusLabel(status: string | undefined) {
  if (status === "paid" || status === "confirmed") return "مؤكد / مدفوع"
  if (status === "draft") return "مسودة"
  return "آجل"
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  const list = Array.isArray(invoices) ? invoices : []

  return (
    <div className="space-y-3">
      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground" role="status">
          <p>لا توجد فواتير في القائمة</p>
        </div>
      ) : (
        list.map((inv) => (
          <Link
            key={inv.id}
            href={`/dashboard/sales/invoices/${inv.id}`}
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-3 transition-colors",
              "hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ReceiptText className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 text-start">
                <p className="truncate text-sm font-semibold tabular-nums">#{inv.invoice_number || "—"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {inv.customer_name || "عميل نقدي"} ·{" "}
                  {inv.created_at || inv.date
                    ? format(new Date(inv.created_at || inv.date), "d MMM yyyy — p", { locale: ar })
                    : "—"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 text-end">
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(typeof inv.total === "number" ? inv.total : 0)}
              </span>
              <Badge variant={inv.status === "paid" ? "default" : "secondary"} className="text-[10px]">
                {statusLabel(inv.status)}
              </Badge>
            </div>
          </Link>
        ))
      )}

      <Button variant="outline" size="sm" className="w-full gap-1 font-medium" asChild>
        <Link href="/dashboard/sales/invoices">
          عرض الكل
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </div>
  )
}
