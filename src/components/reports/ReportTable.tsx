"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface Column {
  key: string
  label: string
  align?: "left" | "center" | "right"
  format?: (value: any, row: any) => React.ReactNode
}

interface ReportTableProps {
  columns: Column[]
  data: any[]
  totals?: Record<string, number | string>
  onExport?: () => void
  isLoading?: boolean
  className?: string
}

export function ReportTable({
  columns,
  data,
  totals,
  onExport,
  isLoading = false,
  className
}: ReportTableProps) {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center border rounded-lg bg-card animate-pulse">
        <p className="text-muted-foreground font-bold">جاري تحميل البيانات...</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">النتائج ({data.length})</h3>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2 font-bold">
            <Download className="w-4 h-4" />
            تصدير Excel
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              {columns.map((col) => (
                <TableHead 
                  key={col.key} 
                  className={cn(
                    "font-black text-foreground",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right"
                  )}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-muted-foreground font-medium">
                  لا توجد بيانات متاحة لهذا التقرير
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell 
                      key={col.key}
                      className={cn(
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right font-medium"
                      )}
                    >
                      {col.format ? col.format(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          {totals && data.length > 0 && (
            <TableFooter className="bg-secondary/30">
              <TableRow>
                {columns.map((col, idx) => (
                  <TableCell 
                    key={col.key} 
                    className={cn(
                      "font-black text-primary",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right"
                    )}
                  >
                    {idx === 0 && !totals[col.key] ? "الإجمالي" : (totals[col.key] || "")}
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  )
}
