import { getPurchaseInvoiceById } from "@/lib/actions/invoices"
import { InvoicePrint } from "@/components/invoices/InvoicePrint"
import { PrintPageButton } from "@/components/invoices/PrintPageButton"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { ChevronRight, Share2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function PurchaseInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = (await getPurchaseInvoiceById(id)) as any

  if (!invoice) notFound()

  const company = {
    name: "مؤسسة الأساس للتجارة",
    address: "القاهرة، شارع النصر، المعادي",
    phone: "01000000000",
    tax_number: "123-456-789",
  }

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title="فاتورة مشتريات"
          subtitle={`رقم ${invoice.invoice_number} — ${invoice.date} — ${invoice.suppliers?.name || "مورد"}`}
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/purchases/invoices">
                <ChevronRight className="me-2 h-4 w-4" aria-hidden /> العودة للقائمة
              </Link>
            </Button>
            <Button variant="destructive" asChild>
              <Link href={`/dashboard/purchases/returns/new?reference_id=${invoice.id}`}>عمل مرتجع</Link>
            </Button>
            <Button type="button" variant="secondary">
              <Share2 className="me-2 h-4 w-4" aria-hidden /> مشاركة
            </Button>
            <PrintPageButton />
          </div>
        </PageHeader>
      </div>

      <div className="mb-12 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-xl md:p-12">
        <InvoicePrint invoice={invoice} company={company} />
      </div>
    </div>
  )
}
