import { getProductInsights } from "@/lib/actions/inventory.actions"
import { StatCard } from "@/components/shared/StatCard"
import { 
  ArrowLeft, 
  Package, 
  TrendingUp, 
  DollarSign, 
  History, 
  Warehouse,
  AlertCircle,
  Tag,
  Printer
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { BarcodePrintDialog } from "@/components/inventory/BarcodePrintDialog"
import { SalesChart } from "@/components/inventory/SalesChart"

type StockDistributionRow = { qty?: number | null; warehouses?: { name?: string | null } | null }
type RecentSaleRow = {
  qty?: number | null
  invoices?: {
    type?: string | null
    invoice_number?: string | number | null
    created_at?: string | null
    customer_name?: string | null
  } | null
}
type ProductInsights = {
  product?: {
    name: string
    barcode?: string | null
    sales_price?: number | null
    cost_price?: number | null
    min_qty?: number | null
    categories?: { name?: string | null } | null
    units?: { name?: string | null } | null
  } | null
  stockDistribution: StockDistributionRow[]
  recentSales: RecentSaleRow[]
  stats: { totalSold: number; totalRevenue: number; totalProfit: number }
  dailyData: { date: string; revenue: number }[]
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { 
    product, 
    stockDistribution, 
    recentSales, 
    stats,
    dailyData 
  } = (await getProductInsights(id)) as unknown as ProductInsights

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">المنتج غير موجود</h2>
        <Link href="/dashboard/inventory/products" className="mt-4">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للمنتجات
          </Button>
        </Link>
      </div>
    )
  }

  const isLowStock = (product.min_qty || 0) >= (stockDistribution.reduce((acc, s) => acc + (s.qty || 0), 0))


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/inventory/products">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
              {isLowStock && (
                <Badge variant="destructive" className="animate-pulse">
                  مخزون منخفض
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {product.categories?.name || 'بدون تصنيف'} • {product.units?.name || 'بدون وحدة'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/inventory/products/${id}/edit`}>
            <Button variant="outline">تعديل البيانات</Button>
          </Link>
          <BarcodePrintDialog 
            productName={product.name}
            productPrice={product.sales_price || 0}
            barcode={product.barcode || ''}
            trigger={
              <Button className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                <Printer className="w-4 h-4 ml-2" />
                طباعة باركود
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي المباع"
          value={`${stats.totalSold} ${product.units?.name || ''}`}
          icon={Package}
          description="منذ بداية التعامل"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.totalRevenue)}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
          description="مبيعات المنتج"
        />
        <StatCard
          title="صافي الأرباح"
          value={new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.totalProfit)}
          icon={DollarSign}
          description="بناءً على التكلفة"
        />
        <StatCard
          title="المخزون الحالي"
          value={stockDistribution.reduce((acc, s) => acc + (s.qty || 0), 0)}
          icon={Warehouse}
          description="في كافة المستودعات"
        />
      </div>


      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
           <SalesChart data={dailyData} />
        </div>
        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                معلومات المنتج الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="flex justify-between p-4 px-6 hover:bg-muted/20 transition-colors">
                  <span className="text-muted-foreground">الباركود</span>
                  <span className="font-mono bg-muted px-2 py-0.5 rounded text-sm">{product.barcode || '—'}</span>
                </div>
                <div className="flex justify-between p-4 px-6 hover:bg-muted/20 transition-colors">
                  <span className="text-muted-foreground">سعر البيع</span>
                  <span className="font-semibold text-primary">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(product.sales_price || 0)}</span>
                </div>
                <div className="flex justify-between p-4 px-6 hover:bg-muted/20 transition-colors">
                  <span className="text-muted-foreground">سعر التكلفة</span>
                  <span className="font-medium">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(product.cost_price || 0)}</span>
                </div>
                <div className="flex justify-between p-4 px-6 hover:bg-muted/20 transition-colors">
                  <span className="text-muted-foreground">حد الطلب (Min Qty)</span>
                  <span className="font-medium text-destructive">{product.min_qty || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-primary" />
                توزيع المخزون
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stockDistribution.length > 0 ? (
                <div className="space-y-4">
                  {stockDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="font-medium">{item.warehouses?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{item.qty}</span>
                        <span className="text-xs text-muted-foreground">{product.units?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground italic">
                  لا يوجد رصيد مخزني متاح حالياً
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              آخر الحركات
            </CardTitle>
            <Badge variant="outline">{recentSales.length} حركة</Badge>
          </CardHeader>
          <CardContent>
            {recentSales.length > 0 ? (
              <div className="relative border-r-2 border-primary/20 pr-6 space-y-8 py-2">
                {recentSales.map((sale, idx) => (
                  <div key={idx} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -right-[2.1rem] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm">
                            {sale.invoices?.type === 'SALE' ? 'فاتورة مبيعات' : 'فاتورة مشتريات'} #{sale.invoices?.invoice_number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sale.invoices?.created_at && format(new Date(sale.invoices.created_at), 'PPP', { locale: ar })}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-primary">+{sale.qty} {product.units?.name}</p>
                          <p className="text-[10px] text-muted-foreground">العميل: {sale.invoices?.customer_name || 'نقدي'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <History className="w-12 h-12 opacity-20 mb-4" />
                <p>لم يتم تسجيل أي حركات لهذا المنتج بعد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
