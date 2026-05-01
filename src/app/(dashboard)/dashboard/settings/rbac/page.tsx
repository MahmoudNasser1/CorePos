import { RbacManager } from "@/components/settings/RbacManager"
import { getRbacSnapshot } from "@/lib/actions/rbac.actions"

export default async function RbacPage() {
  const snapshotRes = await getRbacSnapshot()
  const snapshot = snapshotRes?.data || { roles: [], rolePermissions: {}, overrides: [] }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">إدارة الصلاحيات</h3>
        <p className="text-sm text-muted-foreground">
          تحكم في صلاحيات الأدوار المختلفة أو قم بإضافة استثناءات لمستخدمين محددين.
        </p>
      </div>
      <RbacManager initialData={snapshot} />
    </div>
  )
}
