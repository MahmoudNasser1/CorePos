import { getInvoiceById } from "@/lib/actions/invoices"
import { InvoicePrint } from "@/components/invoices/InvoicePrint"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Printer, ChevronRight, Share2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await getInvoiceById(params.id)

  if (!invoice) notFound()

  // In a real app, you'd fetch company settings here
  const company = {
    name: "مؤسسة الأساس للتجارة",
    address: "القاهرة، شارع النصر، المعادي",
    phone: "01000000000",
    tax_number: "123-456-789"
  }

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader 
          title={`عرض الفاتورة #${invoice.invoice_number}`} 
          description="مراجعة تفاصيل الفاتورة والمبالغ والحسابات."
        >
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/sales/invoices">
                <ChevronRight className="ml-2 h-4 w-4" /> العودة للقائمة
              </Link>
            </Button>
            {invoice.type === 'sale' && (
              <Button variant="destructive" asChild>
                <Link href={`/dashboard/sales/returns/new?reference_id=${invoice.id}`}>
                  عمل مرتجع
                </Link>
              </Button>
            )}
            <Button variant="secondary">
              <Share2 className="ml-2 h-4 w-4" /> مشاركة
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="ml-2 h-4 w-4" /> طباعة
            </Button>
          </div>
        </PageHeader>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-4 md:p-12 mb-12">
        <InvoicePrint invoice={invoice} company={company} />
      </div>
    </div>
  )
}
