import { getMyProfile } from "@/lib/actions/settings.actions"
import { ProfileForm } from "@/components/settings/ProfileForm"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck } from "lucide-react"

export default async function SuperAdminProfilePage() {
  const profile = await getMyProfile()

  if (!profile) {
    return <div>لم يتم العثور على بيانات الملف الشخصي.</div>
  }

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">إدارة حساب السوبر أدمن</h2>
          <p className="text-muted-foreground text-sm">
            إعدادات الوصول والإدارة العليا للمنصة.
          </p>
        </div>
      </div>
      <Separator className="my-6 opacity-50" />
      <div className="max-w-4xl">
        <ProfileForm initialData={profile as any} />
      </div>
    </div>
  )
}
