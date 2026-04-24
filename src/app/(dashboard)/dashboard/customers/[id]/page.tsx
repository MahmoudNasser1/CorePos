import { getPartnerStatement, getPartnerById } from "@/lib/actions/customers.actions"
import { PartnerStatement } from "@/components/partners/PartnerStatement"
import { PageHeader } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { notFound } from "next/navigation"

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const partner = await getPartnerById(id)
  
  if (!partner) notFound()

  const statement = await getPartnerStatement(id)
  const balance = Number((partner as any).balance || 0)

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`كشف حساب: ${partner.name}`} 
        subtitle={`عرض كافة الحركات المالية والفواتير الخاصة بالعميل.`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-bold">الرصيد النهائي:</span>
          <CurrencyDisplay
            amount={Math.abs(balance)}
            className={balance > 0 ? "text-red-600 text-xl" : "text-green-700 text-xl"}
          />
          <Badge variant={balance > 0 ? "destructive" : "default"}>
            {balance > 0 ? "مدين" : "دائن"}
          </Badge>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="md:col-span-1">
            <CardHeader>
               <CardTitle className="text-sm font-bold">بيانات التواصل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <p className="text-xs text-muted-foreground mb-1">الهاتف</p>
                  <p className="font-bold">{partner.phone || "---"}</p>
               </div>
               <div>
                  <p className="text-xs text-muted-foreground mb-1">العنوان</p>
                  <p className="text-sm">{partner.address || "---"}</p>
               </div>
            </CardContent>
         </Card>

         <div className="md:col-span-2">
            <PartnerStatement data={statement} />
         </div>
      </div>
    </div>
  )
}
