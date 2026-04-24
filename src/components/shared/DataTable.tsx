"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Link from "next/link"
import { Search, ChevronRight, ChevronLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  placeholder?: string
  /** إخفاء شريط البحث والأعمدة والتصدير (مثلاً عند وجود فلاتر خارجية) */
  showToolbar?: boolean
  /** إخفاء شريط ترقيم الصفحات */
  showPagination?: boolean
  emptyState?: {
    title: string
    description?: string
    ctaHref?: string
    ctaLabel?: string
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  placeholder = "ابحث...",
  showToolbar = true,
  showPagination = true,
  emptyState,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = Math.max(1, table.getPageCount())
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <div className="w-full space-y-4">
      {showToolbar && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex max-w-sm flex-1 items-center gap-2">
            <Search className="pointer-events-none absolute start-3 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input
              placeholder={placeholder}
              value={(table.getColumn(searchKey || "")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchKey || "")?.setFilterValue(event.target.value)
              }
              className="ps-10"
              disabled={!searchKey}
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden lg:flex">
                  الأعمدة
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="button" variant="outline" size="icon" aria-label="تصدير">
              <Download className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-md border bg-card">
        <Table className="min-w-[720px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="sticky top-0 z-20 border-b bg-muted/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-muted/80"
              >
                  {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-start whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-start align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center align-middle">
                  <div className="flex flex-col items-center justify-center gap-3 py-6 text-muted-foreground">
                    <p className="max-w-md text-sm font-medium text-foreground">
                      {emptyState?.title ?? "لا يوجد بيانات مطابقة"}
                    </p>
                    {emptyState?.description && (
                      <p className="max-w-md text-xs">{emptyState.description}</p>
                    )}
                    {emptyState?.ctaHref && emptyState?.ctaLabel && (
                      <Button asChild size="sm" className="mt-1">
                        <Link href={emptyState.ctaHref}>{emptyState.ctaLabel}</Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              الصفحة {pageIndex + 1} من {pageCount}
            </span>
            <span className="mx-2 text-border">|</span>
            <span>{table.getFilteredRowModel().rows.length} صفًا</span>
            {selectedCount > 0 && (
              <>
                <span className="mx-2 text-border">|</span>
                <span>{selectedCount} محددًا</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
