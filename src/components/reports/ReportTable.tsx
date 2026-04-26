"use client"

import { useMemo, useState, useEffect } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Column {
  key?: string
  accessorKey?: string
  label?: string
  header?: string
  align?: "left" | "center" | "right"
  format?: (value: any, row: any) => React.ReactNode
  cell?: (props: { row: any }) => React.ReactNode
}

interface ReportTableProps {
  columns: Column[]
  data: any[]
  totals?: Record<string, number | string> | { label: string; value: string | number }[]
  onExport?: () => void | Promise<void>
  isLoading?: boolean
  isExporting?: boolean
  className?: string
}

const EMPTY_FILTER_MSG =
  "لا توجد بيانات ضمن الفلتر. جرّب توسيع نطاق التاريخ."

const PAGE_OPTIONS = [25, 50, 100] as const

export function ReportTable({
  columns,
  data,
  totals,
  onExport,
  isLoading = false,
  isExporting = false,
  className,
}: ReportTableProps) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState<(typeof PAGE_OPTIONS)[number]>(25)

  const rows = Array.isArray(data) ? data : []
  const usePagination = rows.length > 25

  const normalizedCols = useMemo(
    () =>
      (Array.isArray(columns) ? columns : []).map((col) => ({
        key: col.key || col.accessorKey || "",
        label: col.label || col.header || "",
        align: col.align,
        format:
          col.format ||
          (col.cell
            ? (value: any, row: any) =>
                col.cell!({ row: { original: row, getValue: () => value } })
            : undefined),
      })),
    [columns]
  )

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))

  useEffect(() => {
    const maxP = Math.max(0, pageCount - 1)
    setPage((p) => Math.min(p, maxP))
  }, [rows.length, pageCount])

  const safePage = Math.min(page, pageCount - 1)
  const pagedRows = useMemo(() => {
    if (!usePagination) return rows
    const start = safePage * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, usePagination, safePage, pageSize])

  const handleExport = async () => {
    if (!onExport) return
    await Promise.resolve(onExport())
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold">النتائج ({rows.length})</h3>
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting || rows.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "جاري تجهيز الملف…" : "تصدير Excel"}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="border rounded-lg overflow-hidden bg-card p-4 space-y-3" aria-busy="true">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      ) : (
        <>
          {usePagination && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>عدد الصفوف</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v) as (typeof PAGE_OPTIONS)[number])
                  setPage(0)
                }}
              >
                <SelectTrigger className="w-[100px]" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {PAGE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="tabular-nums">
                صفحة {safePage + 1} من {pageCount}
              </span>
              <div className="flex gap-1 ms-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  السابق
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {normalizedCols.map((col) => (
                    <TableHead
                      key={col.key}
                      className={cn(
                        "sticky top-0 z-10 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80 font-semibold text-foreground shadow-sm",
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
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={normalizedCols.length}
                      className="text-center py-12 text-muted-foreground"
                    >
                      {EMPTY_FILTER_MSG}
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedRows.map((row, idx) => (
                    <TableRow key={idx}>
                      {normalizedCols.map((col) => (
                        <TableCell
                          key={col.key}
                          className={cn(
                            col.align === "center" && "text-center",
                            col.align === "right" &&
                              "text-end font-medium tabular-nums"
                          )}
                        >
                          {col.format
                            ? col.format(row[col.key], row)
                            : row[col.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
              {totals && rows.length > 0 && (
                <TableFooter className="bg-secondary/30">
                  <TableRow>
                    {Array.isArray(totals) ? (
                      <TableCell
                        colSpan={normalizedCols.length}
                        className="font-semibold text-primary text-center"
                      >
                        <div className="flex flex-wrap gap-4 justify-around w-full tabular-nums">
                          {totals.map((t, i) => (
                            <span key={i}>
                              {t.label}: {t.value}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    ) : (
                      normalizedCols.map((col, idx) => (
                        <TableCell
                          key={col.key}
                          className={cn(
                            "font-semibold text-primary tabular-nums",
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right"
                          )}
                        >
                          {idx === 0 && !totals[col.key]
                            ? "الإجمالي"
                            : (totals[col.key] ?? "")}
                        </TableCell>
                      ))
                    )}
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
