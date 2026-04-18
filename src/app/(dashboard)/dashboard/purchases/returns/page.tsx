import { getInvoices } from "@/lib/actions/invoices"
import { InvoiceTable } from "@/components/invoices/InvoiceTable"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PurchaseReturnsPage() {
  const returns = await getInvoices({ type: 'purchase_return' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مرتجعات المشتريات</h1>
          <p className="text-muted-foreground">إدارة عمليات إرجاع البضاعة للموردين</p>
        </div>
        <Link href="/dashboard/purchases/new">
          <Button variant="outline" className="gap-2">
            عرض فواتير المشتريات
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm border-none bg-white/50 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-primary" />
            سجل المرتجعات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTable data={returns} type="purchase_order" /> 
          {/* Note: I'll update InvoiceTable to handle purchase_return specifically for party labels if needed, but for now purchase_order shows supplier */}
        </CardContent>
      </Card>
    </div>
  )
}
