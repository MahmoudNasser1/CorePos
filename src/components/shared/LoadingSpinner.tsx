import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  className?: string
  size?: number
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 
        className={cn("animate-spin text-primary", className)} 
        size={size}
      />
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <LoadingSpinner size={40} />
    </div>
  )
}
