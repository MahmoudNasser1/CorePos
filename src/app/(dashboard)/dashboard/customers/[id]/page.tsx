import { getCustomerStatement, getCustomerById } from "@/lib/actions/customers.actions"
import { PartnerStatement } from "@/components/partners/PartnerStatement"
import { PageHeader } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { notFound } from "next/navigation"
import Link from "next/link"
import { FileText, Receipt } from "lucide-react"

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const partner = await getCustomerById(id)

  if (!partner) notFound()

  const statement = await getCustomerStatement(id)
  const p = partner as { name?: string; phone?: string | null; address?: string | null; balance?: unknown }
  const balance = Number(p.balance || 0)

  return (
    <div className="space-y-6 rounded-2xl border border-sky-500/15 border-s-4 border-s-sky-500/45 bg-sky-50/15 p-4 md:p-6 dark:bg-sky-950/10">
      <PageHeader title={String(p.name ?? "عميل")} subtitle="بيانات التواصل وكشف الحساب والروابط السريعة للمبيعات والتحصيل.">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={`/dashboard/customers/${id}/edit`}>تعديل البيانات</Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border bg-card shadow-sm md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">الرصيد الحالي</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-black tabular-nums">
              <CurrencyDisplay amount={Math.abs(balance)} />
            </div>
            <Badge variant={balance > 0 ? "destructive" : balance < 0 ? "secondary" : "outline"}>
              {balance > 0 ? "مدين" : balance < 0 ? "دائن / له" : "متزن"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-sm md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">بيانات التواصل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">الهاتف</p>
              <p className="font-bold tabular-nums">{p.phone || "—"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">العنوان</p>
              <p className="text-sm">{p.address || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center gap-2 border bg-card p-4 shadow-sm md:col-span-1">
          <p className="text-xs font-bold text-muted-foreground">روابط سريعة</p>
          <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
            <Link href="/dashboard/sales/new">
              <FileText className="h-4 w-4" aria-hidden />
              فاتورة مبيعات جديدة
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="justify-start gap-2" asChild>
            <Link href="/dashboard/finance/receipts/new">
              <Receipt className="h-4 w-4" aria-hidden />
              سند قبض
            </Link>
          </Button>
        </Card>
      </div>

      <div className="min-w-0">
        <h2 className="mb-3 text-lg font-bold">كشف الحساب</h2>
        <PartnerStatement data={statement} />
      </div>
    </div>
  )
}
