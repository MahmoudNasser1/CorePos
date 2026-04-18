import { getInvoiceById } from "@/lib/actions/invoices"
import { InvoicePrint } from "@/components/invoices/InvoicePrint"
import { notFound } from "next/navigation"

export default async function InvoicePrintPage({ params }: { params: { id: string } }) {
  const invoice = await getInvoiceById(params.id)

  if (!invoice) notFound()

  const company = {
    name: "مؤسسة الأساس للتجارة",
    address: "القاهرة، شارع النصر، المعادي",
    phone: "01000000000",
    tax_number: "123-456-789"
  }

  return (
    <div className="bg-white min-h-screen p-0 m-0">
      <InvoicePrint invoice={invoice} company={company} />
      {/* Auto print script */}
      <script dangerouslySetInnerHTML={{ __html: `window.print();` }} />
    </div>
  )
}
