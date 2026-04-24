"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface LowStockWidgetProps {
  products: any[]
}

export function LowStockWidget({ products }: LowStockWidgetProps) {
  return (
    <div className="space-y-4">
      {(Array.isArray(products) ? products : []).map((product) => {
        const ratio = product.min_qty > 0 ? (product.qty / product.min_qty) * 100 : 0
        const isEmergency = product.qty <= 0
        
        return (
          <div key={product.id} className="space-y-2 p-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  isEmergency ? "bg-destructive animate-pulse" : "bg-yellow-500"
                )} />
                <span className="font-bold text-sm truncate max-w-[150px]">{product.name}</span>
              </div>
              <span className="text-xs font-black">
                {product.qty} / {product.min_qty}
              </span>
            </div>
            <Progress 
              value={ratio} 
              className="h-1.5" 
              indicatorClassName={isEmergency ? "bg-destructive" : "bg-yellow-500"} 
            />
          </div>
        )
      })}
      
      <Button variant="outline" className="w-full mt-2 group border-dashed hover:border-primary hover:bg-primary/5 transition-all" asChild>
        <Link href="/dashboard/inventory/products" className="flex items-center justify-center gap-2 text-xs font-black">
          إدارة المخزون
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </Button>
    </div>
  )
}
