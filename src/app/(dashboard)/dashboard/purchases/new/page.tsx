import { InvoiceForm } from "@/components/invoices/InvoiceForm"
import { getCustomers } from "@/lib/actions/customers"
import { getInventory } from "@/lib/actions/inventory.actions"
import { getTreasuries } from "@/lib/actions/payments"
import { PageHeader } from "@/components/shared/PageHeader"

export default async function NewPurchaseInvoicePage() {
  const [suppliers, products, treasuries] = await Promise.all([
    getCustomers({ type: 'supplier' }),
    getInventory(), 
    getTreasuries()
  ])

  // Map inventory to simplified products for the form
  const formattedProducts = products.map(item => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    sale_price: item.sale_price,
    purchase_price: item.purchase_price,
    stock: item.stock?.[0]?.quantity || 0,
    category: item.categories?.name
  }))

  return (
    <div className="space-y-6">
      <PageHeader 
        title="فاتورة توريد (مشتريات)" 
        description="تسجيل بضاعة جديدة في المخازن وتحديث حسابات الموردين."
      />

      <InvoiceForm 
        type="purchase"
        customers={suppliers}
        products={formattedProducts}
        treasuries={treasuries}
      />
    </div>
  )
}
