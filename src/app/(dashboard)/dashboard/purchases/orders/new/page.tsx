import { InvoiceForm } from "@/components/invoices/InvoiceForm"

export default function NewPurchaseOrderPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">إنشاء أمر شراء</h1>
        <p className="text-muted-foreground">قم بإضافة الأصناف المطلوبة من المورد</p>
      </div>
      <InvoiceForm type="purchase_order" />
    </div>
  )
}
