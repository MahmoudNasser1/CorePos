import { InvoiceForm } from "@/components/invoices/InvoiceForm"

export default function NewPurchaseReturnPage() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">مرتجع مشتريات جديد</h1>
        <p className="text-muted-foreground">قم بإرجاع الأصناف للمورد واسترداد المبالغ أو تعديل المديونية</p>
      </div>
      <InvoiceForm type="purchase_return" />
    </div>
  )
}
