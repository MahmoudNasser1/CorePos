import { adminApi } from "@/lib/api/admin"
import { UsersManagement } from "@/components/settings/UsersManagement"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "إدارة المستخدمين | CorePOS",
  description: "إدارة مستخدمي الشركة وصلاحياتهم",
}

export default async function UsersPage() {
  // Fetch users and branches in parallel
  const [users, branches] = await Promise.all([
    adminApi.listUsers(),
    adminApi.listBranches(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">إدارة المستخدمين</h2>
        <p className="text-muted-foreground">
          إدارة موظفي شركتك، تعيين الأدوار الوظيفية، والتحكم في الوصول.
        </p>
      </div>
      <UsersManagement initialUsers={users} branches={branches} />
    </div>
  )
}
