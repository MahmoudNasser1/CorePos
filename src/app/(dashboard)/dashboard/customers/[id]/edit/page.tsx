import { notFound } from "next/navigation"
import { getCustomerById } from "@/lib/actions/customers.actions"
import { PageHeader } from "@/components/shared/PageHeader"
import { PartnerContactForm } from "@/components/partners/PartnerContactForm"

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = await getCustomerById(id)
  if (!row) notFound()

  return (
    <div className="space-y-6 p-1">
      <PageHeader title="تعديل عميل" subtitle="تحديث الاسم والتواصل — الرصيد يتغير عبر الفواتير فقط." />
      <PartnerContactForm
        kind="customer"
        id={id}
        title="تعديل بيانات العميل"
        initialData={{
          name: String(row.name ?? ""),
          phone: (row as { phone?: string | null }).phone ?? null,
          address: (row as { address?: string | null }).address ?? null,
          email: (row as { email?: string | null }).email ?? null,
          taxNumber: (row as { taxNumber?: string | null }).taxNumber ?? (row as { tax_number?: string | null }).tax_number ?? null,
        }}
      />
    </div>
  )
}
