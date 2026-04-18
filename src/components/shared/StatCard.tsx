import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "up" | "down" | "neutral"
  icon: LucideIcon
  color?: string
  description?: string
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  color,
  description,
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-bold">{title}</CardTitle>
        <Icon className={cn("w-4 h-4", color || "text-muted-foreground")} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black">{value}</div>
        {(change || description) && (
          <p className="text-xs text-muted-foreground mt-1">
            {change && (
              <span
                className={cn(
                  "font-bold ml-1",
                  changeType === "up" ? "text-accent" : changeType === "down" ? "text-destructive" : ""
                )}
              >
                {change}
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
