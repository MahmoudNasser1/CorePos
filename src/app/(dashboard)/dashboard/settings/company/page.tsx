import { getCompanyProfile } from "@/lib/actions/settings.actions"
import { CompanyRegionalForm } from "@/components/settings/CompanyRegionalForm"
import { CompanyGeneralForm } from "@/components/settings/CompanyGeneralForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Globe2 } from "lucide-react"

export default async function CompanySettingsPage() {
  const company = await getCompanyProfile()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">إعدادات المنشأة</h1>
        <p className="text-sm text-muted-foreground">
          إدارة بيانات الهوية، الموقع، والبيانات الإقليمية الخاصة بشركتك.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="h-4 w-4" />
            البيانات العامة
          </TabsTrigger>
          <TabsTrigger value="regional" className="gap-2">
            <Globe2 className="h-4 w-4" />
            المنطقة والعملة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 outline-none">
          <CompanyGeneralForm initialData={company as any} />
        </TabsContent>

        <TabsContent value="regional" className="space-y-6 outline-none">
          <CompanyRegionalForm initialData={company as any} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
