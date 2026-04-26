import { PageHeader } from "@/components/shared/PageHeader"
import { OrgUnitsClient } from "./org-units-client"

export const dynamic = "force-dynamic"

export default function PlatformOrgUnitsPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader title="الإدارات (Org Units)" subtitle="إدارة الإدارات داخل الشركات (Platform Admin)." />
      <OrgUnitsClient />
    </div>
  )
}


