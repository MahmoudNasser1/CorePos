import { PageHeader } from "@/components/shared/PageHeader"
import { RbacClient } from "./rbac-client"

export const dynamic = "force-dynamic"

export default function PlatformRbacPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="RBAC" subtitle="Role templates + user overrides لكل شركة (Platform Admin)." />
      <RbacClient />
    </div>
  )
}

