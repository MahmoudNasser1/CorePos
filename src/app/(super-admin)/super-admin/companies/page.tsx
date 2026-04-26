import Link from "next/link"
import { listPlatformAdminCompanies } from "@/lib/actions/platform-admin.actions"
import { PageHeader } from "@/components/shared/PageHeader"
import { DataTable } from "@/components/shared/DataTable"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

type Row = Awaited<ReturnType<typeof listPlatformAdminCompanies>>[number]

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

export default async function PlatformCompaniesPage() {
  const data = await listPlatformAdminCompanies()

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="الشركات"
        subtitle="قائمة الشركات على مستوى المنصة (بحث + فلترة حسب الخطة في المرحلة التالية)."
      />

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
    </div>
  )
}

