import { getInvoices } from "@/lib/actions/invoices"
import { InvoiceTable } from "@/components/invoices/InvoiceTable"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"

type PurchaseReturnRow = { id: string } & Record<string, unknown>

export default async function PurchaseReturnsPage() {
  const returns = (await getInvoices({ type: "purchase_return" })) as unknown as PurchaseReturnRow[]

  return (
    <div className="space-y-6 rounded-2xl border border-amber-500/15 border-s-4 border-s-amber-500/45 bg-amber-50/15 p-4 md:p-6 dark:bg-amber-950/10">
      <PageHeader
        title="مرتجعات المشتريات"
        subtitle="إرجاع بضاعة للمورد — يُنصح بمراجعة الكميات قبل التأكيد لأثرها على المخزون."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/purchases/invoices">فواتير المشتريات</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/dashboard/purchases/returns/new" className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              مرتجع جديد
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Card className="border-none bg-white/50 shadow-sm backdrop-blur-md dark:bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <RefreshCcw className="h-5 w-5 text-primary" aria-hidden />
            سجل المرتجعات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTable data={returns} type="purchase_return" />
        </CardContent>
      </Card>
    </div>
  )
}
