import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { PageHeader } from "@/components/shared/PageHeader"

export default async function NewPurchaseInvoicePage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="إنشاء فاتورة مشتريات" 
        subtitle="تسجيل فاتورة توريد جديدة وإضافة عناصر للمخزن."
      />
      
      <InvoiceForm type="purchase" />

    </div>
  )
}
