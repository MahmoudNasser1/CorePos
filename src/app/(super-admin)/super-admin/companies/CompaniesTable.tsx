"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/DataTable"
import type { ColumnDef } from "@tanstack/react-table"

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
      <div className="min-w-[220px]">
        <div className="font-semibold">{row.original.name}</div>
        <div className="text-xs text-muted-foreground" dir="ltr">
          {row.original.id}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "subscription",
    header: "الاشتراك",
    cell: ({ row }) => {
      const sub = row.original.subscription
      if (!sub) return <span className="text-sm text-muted-foreground">—</span>
      const st = String(sub.status ?? "")
      const variant =
        st === "active" ? "secondary" : st === "trialing" ? "outline" : st ? "destructive" : "outline"
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={variant as any}>{sub.status ?? "unknown"}</Badge>
          <span className="text-xs text-muted-foreground">{sub.planId ?? "—"}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "البريد",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground" dir="ltr">
        {row.original.email ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "phone",
    header: "الهاتف",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground" dir="ltr">
        {row.original.phone ?? "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href={`/super-admin/companies/${row.original.id}`}>التفاصيل</Link>
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
