import { PageHeader } from "@/components/shared/PageHeader"
import { DataTable } from "@/components/shared/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { listPlatformAdminUsers } from "@/lib/actions/platform-admin.actions"
import { UsersTableActions } from "./users-table-actions"

export const dynamic = "force-dynamic"

type Row = Awaited<ReturnType<typeof listPlatformAdminUsers>>[number]

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "fullName",
    header: "المستخدم",
    cell: ({ row }) => (
      <div className="min-w-[240px]">
        <div className="font-semibold">{(row.original as any).fullName}</div>
        <div className="text-xs text-muted-foreground" dir="ltr">
          {(row.original as any).email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "companyName",
    header: "الشركة",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {(row.original as any).companyName ?? "—"}
      </div>
    ),
  },
  {
    accessorKey: "orgUnitName",
    header: "الإدارة",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {(row.original as any).orgUnitName ?? "—"}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "الدور",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal" dir="ltr">
        {(row.original as any).role}
      </Badge>
    ),
  },
  {
    accessorKey: "isActive",
    header: "الحالة",
    cell: ({ row }) => {
      const active = Boolean((row.original as any).isActive)
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
    cell: ({ row }) => <UsersTableActions user={row.original as any} />,
  },
]

export default async function PlatformUsersPage() {
  const data = await listPlatformAdminUsers()

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="المستخدمون" subtitle="إدارة المستخدمين على مستوى المنصة (مع تسجيل كل إجراء في Audit)." />

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
    </div>
  )
}

