import { PageHeader } from "@/components/shared/PageHeader"
import { listPlatformAdminUsers } from "@/lib/actions/platform-admin.actions"
import { UsersTable } from "./UsersTable"

export const dynamic = "force-dynamic"

export default async function PlatformUsersPage() {
  const data = await listPlatformAdminUsers()

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="المستخدمون" subtitle="إدارة المستخدمين على مستوى المنصة (مع تسجيل كل إجراء في Audit)." />

      <UsersTable data={data} />
    </div>
  )
}

