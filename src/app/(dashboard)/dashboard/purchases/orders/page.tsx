import { getInvoices } from "@/lib/actions/invoices"
import { InvoiceTable } from "@/components/invoices/InvoiceTable"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PurchaseOrdersPage() {
  const orders = await getInvoices({ type: 'purchase_order' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">أوامر الشراء</h1>
          <p className="text-muted-foreground">عرض وإدارة طلبات الشراء من الموردين</p>
        </div>
        <Link href="/dashboard/purchases/orders/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            أمر شراء جديد
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm border-none bg-white/50 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            سجل أوامر الشراء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTable data={orders} type="purchase_order" />
        </CardContent>
      </Card>
    </div>
  )
}
