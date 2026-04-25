import { getPurchaseInvoiceById } from "@/lib/actions/invoices"
import { InvoicePrint } from "@/components/invoices/InvoicePrint"
import { notFound } from "next/navigation"

export default async function PurchaseInvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="m-0 min-h-screen bg-white p-0">
      <InvoicePrint invoice={invoice} company={company} />
      <script dangerouslySetInnerHTML={{ __html: `window.print();` }} />
    </div>
  )
}
