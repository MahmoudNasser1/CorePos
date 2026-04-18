"use client"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "paid" | "partial" | "pending" | "cancelled" | "draft"
  label?: string
}

const statusConfig = {
  paid: { label: "مدفوع", className: "bg-accent/10 text-accent border-accent/20" },
  partial: { label: "جزئي", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  pending: { label: "آجل", className: "bg-warning/10 text-warning border-warning/20" },
  cancelled: { label: "ملغى", className: "bg-destructive/10 text-destructive border-destructive/20" },
  draft: { label: "مسودة", className: "bg-muted text-muted-foreground border-border" },
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
      config.className
    )}>
      {label || config.label}
    </span>
  )
}
