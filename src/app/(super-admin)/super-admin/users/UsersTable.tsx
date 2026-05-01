"use client"

import { DataTable } from "@/components/shared/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { UsersTableActions } from "./users-table-actions"
import { cn } from "@/lib/utils"

type Row = any

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "fullName",
    header: "المستخدم",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 min-w-[240px]">
        <div className="h-9 w-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold text-xs">
          {row.original.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-foreground">{row.original.fullName}</div>
          <div className="text-[10px] text-muted-foreground" dir="ltr">
            {row.original.email}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "companyName",
    header: "الشركة / الإدارة",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <div className="font-medium text-foreground">{row.original.companyName || "—"}</div>
        <div className="text-muted-foreground/70">{row.original.orgUnitName || "—"}</div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "الدور",
    cell: ({ row }) => {
      const role = row.original.role
      const isSuper = role === 'PLATFORM_ADMIN' || role === 'super-admin'
      return (
        <Badge 
          variant={isSuper ? "default" : "outline"} 
          className={cn("font-bold text-[10px]", isSuper && "bg-indigo-600")} 
          dir="ltr"
        >
          {role}
        </Badge>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: "الحالة",
    cell: ({ row }) => {
      const active = Boolean(row.original.isActive)
      return (
        <div className="flex items-center gap-1.5">
          <div className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-emerald-500" : "bg-rose-500")} />
          <span className={cn("text-xs font-bold", active ? "text-emerald-600" : "text-rose-600")}>
            {active ? "نشط" : "موقوف"}
          </span>
        </div>
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
