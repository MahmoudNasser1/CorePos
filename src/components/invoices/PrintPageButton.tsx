"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintPageButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="secondary"
      className={className}
      onClick={() => window.print()}
      aria-label="طباعة أو معاينة الطباعة"
    >
      <Printer className="me-2 h-4 w-4" aria-hidden />
      طباعة
    </Button>
  )
}
