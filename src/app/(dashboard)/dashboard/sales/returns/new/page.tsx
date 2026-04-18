import { InvoiceForm } from "@/components/invoices/InvoiceForm"

export default function NewSaleReturnPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">مرتجع مبيعات جديد</h2>
        <p className="text-muted-foreground">قم بإنشاء فاتورة مرتجع مبيعات لإرجاع الأصناف للمخزن ورد المبالغ للعميل.</p>
      </div>
      <InvoiceForm type="sale_return" />
    </div>
  )
}
