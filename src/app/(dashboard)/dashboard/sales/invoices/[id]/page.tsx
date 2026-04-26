import { getInvoiceById } from "@/lib/actions/invoices"
import { getCompanyProfile } from "@/lib/actions/settings.actions"
import { InvoicePrint } from "@/components/invoices/InvoicePrint"
import { PrintPageButton } from "@/components/invoices/PrintPageButton"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { ChevronRight, Share2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getTreasuries } from "@/lib/actions/payments"
import { InvoicePaymentDialog } from "@/components/invoices/InvoicePaymentDialog"

export default async function SaleInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoiceById(id) as any
  const treasuries = await getTreasuries()

  if (!invoice) notFound()

  const company = await getCompanyProfile()

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title="فاتورة مبيعات"
          subtitle={`رقم ${invoice.invoice_number} — ${invoice.date} — ${invoice.customers?.name || "عميل نقدي"}`}
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/sales/invoices">
                <ChevronRight className="me-2 h-4 w-4" aria-hidden /> العودة للقائمة
              </Link>
            </Button>
            {Number(invoice.remaining || 0) > 0 && (
              <InvoicePaymentDialog
                invoiceId={invoice.id}
                customerId={invoice.customer_id ?? invoice.customerId ?? invoice.customers?.id ?? null}
                remaining={Number(invoice.remaining || 0)}
                treasuries={(treasuries || []).map((t: any) => ({ id: t.id, name: t.name }))}
              />
            )}
            {invoice.type === 'sale' && (
              <Button variant="destructive" asChild>
                <Link href={`/dashboard/sales/returns/new?reference_id=${invoice.id}`}>
                  عمل مرتجع
                </Link>
              </Button>
            )}
            <Button type="button" variant="secondary">
              <Share2 className="me-2 h-4 w-4" aria-hidden /> مشاركة
            </Button>
            <PrintPageButton />
          </div>
        </PageHeader>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-4 md:p-12 mb-12">
        <InvoicePrint invoice={invoice} company={company} />
      </div>
    </div>
  )
}
