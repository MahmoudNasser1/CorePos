import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { LucideIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "up" | "down" | "neutral"
  icon: LucideIcon
  color?: string
  description?: string
  subtitle?: string
  isCurrency?: boolean
  className?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  color,
  description,
  subtitle,
  isCurrency,
  className,
}: StatCardProps) {
  const finalDescription = description || subtitle
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-bold">{title}</CardTitle>
        <Icon className={cn("w-4 h-4", color || "text-muted-foreground")} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black">
          {isCurrency && typeof value === 'number' ? (
            <CurrencyDisplay amount={value} />
          ) : (
            value
          )}
        </div>
        {(change || finalDescription) && (
          <p className="text-xs text-muted-foreground mt-1">
            {change && (
              <span
                className={cn(
                  "font-bold ms-1",
                  changeType === "up" ? "text-accent" : changeType === "down" ? "text-destructive" : ""
                )}
              >
                {change}
              </span>
            )}
            {finalDescription}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
