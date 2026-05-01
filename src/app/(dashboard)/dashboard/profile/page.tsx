import { getMyProfile } from "@/lib/actions/settings.actions"
import { ProfileForm } from "@/components/settings/ProfileForm"
import { Separator } from "@/components/ui/separator"

export default async function DashboardProfilePage() {
  const profile = await getMyProfile()

  if (!profile) {
    return <div>لم يتم العثور على بيانات الملف الشخصي.</div>
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">الملف الشخصي</h2>
        <p className="text-muted-foreground">
          إدارة إعدادات حسابك الشخصي والبيانات التي تظهر للآخرين.
        </p>
      </div>
      <Separator className="my-6" />
      <ProfileForm initialData={profile as any} />
    </div>
  )
}
