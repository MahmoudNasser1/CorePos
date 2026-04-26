import { getPurchaseInvoiceById } from "@/lib/actions/invoices"
import { getCompanyProfile } from "@/lib/actions/settings.actions"
import { InvoicePrint } from "@/components/invoices/InvoicePrint"
import { notFound } from "next/navigation"

export default async function PurchaseInvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [invoice, companyRow] = await Promise.all([
    getPurchaseInvoiceById(id) as Promise<any>,
    getCompanyProfile(),
  ])

  if (!invoice) notFound()

  const c = companyRow as Record<string, unknown> | null
  const company = {
    name: (c?.name as string) || "اسم الشركة",
    address: (c?.address as string) || "",
    phone: (c?.phone as string) || "",
    tax_number: (c?.taxNumber ?? c?.tax_number) as string | undefined,
    currency: (c?.currency as string) || "EGP",
  }

  return (
    <div className="m-0 min-h-screen bg-white p-0">
      <InvoicePrint invoice={invoice} company={company} />
      <script dangerouslySetInnerHTML={{ __html: `window.print();` }} />
    </div>
  )
}
