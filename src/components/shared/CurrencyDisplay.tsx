import { formatCurrency, cn } from "@/lib/utils"

interface CurrencyDisplayProps {
  amount: number
  className?: string
  currencyClassName?: string
  /** عند الحاجة (مثلاً طباعة من السيرفر) يُمرَّر كود ISO للعملة */
  currencyCode?: string
}

export function CurrencyDisplay({ 
  amount, 
  className,
  currencyClassName,
  currencyCode,
}: CurrencyDisplayProps) {
  const formatted = formatCurrency(amount, currencyCode)
  
  // formatted looks like "123,456.78 ج.م"
  const [value, currency] = formatted.split(" ")
  
  return (
    <span className={cn("font-bold tracking-tight inline-flex items-center gap-1", className)}>
      <span className="tabular-nums">{value}</span>
      <span className={cn("text-[0.8em] font-normal opacity-70", currencyClassName)}>
        {currency}
      </span>
    </span>
  )
}
