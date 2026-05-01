"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"

type Row = {
  id: string
  name: string
  email: string | null
  phone: string | null
  subscription: {
    status: string | null
    planId: string | null
  } | null
}

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "name",
    header: "الشركة",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 min-w-[240px]">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
          {row.original.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-foreground">{row.original.name}</div>
          <div className="text-[10px] text-muted-foreground font-mono" dir="ltr">
            {row.original.id.slice(0, 8)}...
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "subscription",
    header: "حالة الاشتراك",
    cell: ({ row }) => {
      const sub = row.original.subscription
      if (!sub) return <Badge variant="outline" className="opacity-50">بدون اشتراك</Badge>
      
      const st = String(sub.status ?? "").toLowerCase()
      let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
      let label = st
      let colorClass = ""

      if (st === "active") {
        variant = "secondary"
        label = "نشط"
        colorClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      } else if (st === "trialing") {
        variant = "outline"
        label = "تجريبي"
        colorClass = "bg-blue-500/10 text-blue-600 border-blue-500/20"
      } else if (st === "expired" || st === "cancelled") {
        variant = "destructive"
        label = st === "expired" ? "منتهي" : "ملغي"
      }

      return (
        <div className="flex flex-col gap-1">
          <Badge className={cn("w-fit font-bold", colorClass)} variant={variant}>
            {label}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{sub.planId || "خطه افتراضيه"}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "contact",
    header: "التواصل",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs gap-1">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="font-medium truncate max-w-[150px]" dir="ltr">{row.original.email}</span>
        </div>
        <div className="text-muted-foreground/70" dir="ltr">{row.original.phone || "—"}</div>
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button asChild variant="ghost" size="sm" className="hover:bg-primary/5 hover:text-primary transition-colors font-bold">
          <Link href={`/super-admin/companies/${row.original.id}`}>
            إدارة
            <ArrowUpRight className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    ),
  },
]

interface CompaniesTableProps {
  data: any[]
}

export function CompaniesTable({ data }: CompaniesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      placeholder="ابحث باسم الشركة / البريد / الهاتف…"
      emptyState={{
        title: "لا توجد شركات",
        description: "عند إنشاء شركات جديدة ستظهر هنا تلقائيًا.",
        ctaHref: "/register",
        ctaLabel: "إنشاء شركة جديدة",
      }}
    />
  )
}
