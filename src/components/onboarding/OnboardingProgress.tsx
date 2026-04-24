"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const STEPS = [
  { path: "/onboarding/company", n: 1, short: "الشركة" },
  { path: "/onboarding/warehouse", n: 2, short: "الفرع والمخزن" },
  { path: "/onboarding/sample-data", n: 3, short: "بيانات تجريبية" },
] as const

export function OnboardingProgress() {
  const pathname = usePathname()
  const index = STEPS.findIndex((s) => pathname === s.path || pathname.startsWith(`${s.path}/`))
  const step = index >= 0 ? index + 1 : 1

  return (
    <div className="mb-6 space-y-3" aria-label={`التقدم في الإعداد: الخطوة ${step} من ${STEPS.length}`}>
      <div className="flex justify-between gap-1 text-[11px] font-semibold text-muted-foreground sm:text-xs">
        {STEPS.map((s, i) => (
          <span
            key={s.path}
            className={cn("min-w-0 flex-1 truncate text-center", i + 1 <= step && "text-primary")}
            title={s.short}
          >
            <span className="tabular-nums">{s.n}</span>. {s.short}
          </span>
        ))}
      </div>
      <div className="flex gap-1" aria-hidden>
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 min-w-0 flex-1 rounded-full transition-colors",
              i < step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  )
}
