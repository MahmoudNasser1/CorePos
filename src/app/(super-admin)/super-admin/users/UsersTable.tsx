"use client"

import { DataTable } from "@/components/shared/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { UsersTableActions } from "./users-table-actions"

type Row = any

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "fullName",
    header: "المستخدم",
    cell: ({ row }) => (
      <div className="min-w-[240px]">
        <div className="font-semibold">{row.original.fullName}</div>
        <div className="text-xs text-muted-foreground" dir="ltr">
          {row.original.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "companyName",
    header: "الشركة",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.companyName ?? "—"}
      </div>
    ),
  },
  {
    accessorKey: "orgUnitName",
    header: "الإدارة",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.orgUnitName ?? "—"}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "الدور",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal" dir="ltr">
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "isActive",
    header: "الحالة",
    cell: ({ row }) => {
      const active = Boolean(row.original.isActive)
      return (
        <Badge variant={active ? "secondary" : "destructive"} className="font-normal">
          {active ? "نشط" : "موقوف"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <UsersTableActions user={row.original} />,
  },
]

interface UsersTableProps {
  data: any[]
}

export function UsersTable({ data }: UsersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="fullName"
      placeholder="ابحث بالاسم أو البريد…"
      emptyState={{
        title: "لا يوجد مستخدمون",
        description: "عند إنشاء حسابات جديدة ستظهر هنا.",
      }}
    />
  )
}
