"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const INVOICE_STATUS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "مسودة", variant: "secondary" },
  paid: { label: "مدفوعة", variant: "default" },
  partial: { label: "جزئية", variant: "outline" },
  pending: { label: "آجل", variant: "outline" },
  confirmed: { label: "مؤكدة", variant: "default" },
  void: { label: "ملغاة", variant: "destructive" },
  cancelled: { label: "ملغاة", variant: "destructive" },
  converted: { label: "محوّل لفاتورة", variant: "secondary" },
  sent: { label: "مُرسل", variant: "outline" },
  accepted: { label: "مقبول", variant: "default" },
  received: { label: "مستلمة", variant: "default" },
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const key = (status || "").toLowerCase()
  const cfg = INVOICE_STATUS[key] ?? {
    label: status || "—",
    variant: "outline" as const,
  }

  return (
    <Badge variant={cfg.variant} className={cn("tabular-nums font-semibold")}>
      {cfg.label}
    </Badge>
  )
}
