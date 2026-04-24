"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { DataTable } from "@/components/shared/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, User, Phone, MapPin, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface Partner {
  id: string
  name: string
  phone: string | null
  address: string | null
  balance: number
  type: "customer" | "supplier"
}

export type PartnerKind = "customer" | "supplier"

function buildColumns(kind: PartnerKind): ColumnDef<Partner>[] {
  return [
    {
      accessorKey: "name",
      header: "الاسم",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              kind === "customer" ? "bg-sky-500/10" : "bg-amber-500/10",
            )}
          >
            <User className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
          <span className="font-bold">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "رقم الهاتف",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums">
          <Phone className="h-3 w-3 shrink-0" aria-hidden />
          <span>{row.original.phone || "—"}</span>
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: "الرصيد",
      cell: ({ row }) => {
        const b = Number(row.original.balance) || 0
        const abs = Math.abs(b)
        return (
          <div className="flex flex-wrap items-center gap-2">
            <CurrencyDisplay
              amount={abs}
              className={cn(
                "tabular-nums",
                b > 0 && "text-destructive",
                b === 0 && "text-muted-foreground",
                b < 0 && "text-muted-foreground",
              )}
            />
            <Badge variant={b > 0 ? "destructive" : "secondary"} className="text-[10px] font-semibold">
              {b > 0
                ? kind === "customer"
                  ? "مدين"
                  : "مستحق للمورد"
                : b < 0
                  ? kind === "customer"
                    ? "دائن / له"
                    : "دفعة مقدمة"
                  : "متزن"}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "address",
      header: "العنوان",
      cell: ({ row }) => (
        <div className="flex max-w-[200px] items-center gap-2 truncate text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
          <span>{row.original.address || "—"}</span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const partner = row.original
        const typePath = partner.type === "customer" ? "customers" : "suppliers"

        return (
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label={`إجراءات ${partner.name}`}
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>العمليات</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${typePath}/${partner.id}`}>
                  <Eye className="me-2 h-4 w-4" aria-hidden />
                  عرض التفاصيل والكشف
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>تعديل البيانات</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" disabled>
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

export function PartnerTable({ data, kind }: { data: Partner[]; kind: PartnerKind }) {
  const [query, setQuery] = useState("")
  const deferred = useDeferredValue(query.trim().toLowerCase())

  const filtered = useMemo(() => {
    if (!deferred) return data
    return data.filter((p) => {
      const name = (p.name || "").toLowerCase()
      const phone = (p.phone || "").toLowerCase().replace(/\s+/g, "")
      const qPhone = deferred.replace(/\s+/g, "")
      return name.includes(deferred) || phone.includes(qPhone)
    })
  }, [data, deferred])

  const columns = useMemo(() => buildColumns(kind), [kind])

  const emptyState =
    data.length === 0
      ? {
          title: kind === "customer" ? "لا عملاء بعد" : "لا موردين بعد",
          description: "يمكنك إضافة جهات جديدة عندما يتاح المسار في النظام.",
        }
      : {
          title: "لا نتائج — جرّب كلمات أخرى",
          description: "لا يوجد تطابق للاسم أو رقم الهاتف في القائمة الحالية.",
        }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 sm:max-w-md sm:flex-1">
          <Label htmlFor="partner-search" className="text-xs text-muted-foreground">
            بحث
          </Label>
          <Input
            id="partner-search"
            placeholder="ابحث بالاسم أو الهاتف…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-background"
            autoComplete="off"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        showToolbar={false}
        emptyState={emptyState}
      />
    </div>
  )
}
