import { InvoiceForm } from "@/components/invoices/InvoiceForm"

export default function NewQuotationPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">عرض سعر جديد</h2>
        <p className="text-muted-foreground">قم بإنشاء عرض سعر للعميل بدون التأثير على المخزون أو الحسابات.</p>
      </div>
      <InvoiceForm type="quotation" />
    </div>
  )
}
