import { getInvoices } from "@/lib/actions/invoices"
import { InvoiceTable } from "@/components/invoices/InvoiceTable"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"

type PurchaseOrderRow = { id: string } & Record<string, unknown>

export default async function PurchaseOrdersPage() {
  const orders = (await getInvoices({ type: "purchase_order" })) as unknown as PurchaseOrderRow[]

  return (
    <div className="space-y-6 rounded-2xl border border-amber-500/15 border-s-4 border-s-amber-500/45 bg-amber-50/15 p-4 md:p-6 dark:bg-amber-950/10">
      <PageHeader
        title="أوامر الشراء"
        subtitle="طلبات توريد من الموردين — بعد الاعتماد يمكن تحويل الأمر إلى فاتورة مشتريات من قائمة الإجراءات."
      >
        <Button asChild className="gap-2">
          <Link href="/dashboard/purchases/orders/new" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            أمر شراء جديد
          </Link>
        </Button>
      </PageHeader>

      <Card className="border-none bg-white/50 shadow-sm backdrop-blur-md dark:bg-card/50">
        <CardHeader className="space-y-2 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <ShoppingCart className="h-5 w-5 text-primary" aria-hidden />
            سجل أوامر الشراء
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            دورة مبسّطة: مسودة → مؤكد → عند التحويل تظهر الحالة «محوّل لفاتورة» في الجدول.
          </p>
        </CardHeader>
        <CardContent>
          <InvoiceTable data={orders} type="purchase_order" />
        </CardContent>
      </Card>
    </div>
  )
}
