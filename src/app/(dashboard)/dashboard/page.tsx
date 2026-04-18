import { Suspense } from "react"
import { 
  getDashboardStats, 
  getSalesChartData, 
  getRecentInvoices, 
  getLowStockProducts,
  getTopProducts
} from "@/lib/actions/reports.actions"
import { KPIGrid } from "@/components/dashboard/KPIGrid"
import { DashboardCompanyContext } from "@/components/dashboard/DashboardCompanyContext"
import { SalesChart } from "@/components/dashboard/SalesChart"
import { TopProductsChart } from "@/components/dashboard/TopProductsChart"
import { RecentInvoices } from "@/components/dashboard/RecentInvoices"
import { StockAlertsWidget } from "@/components/dashboard/StockAlertsWidget"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  // Fetch initial data
  const [stats, salesData, recentInvoices, lowStock, topProducts] = await Promise.all([
    getDashboardStats(),
    getSalesChartData(),
    getRecentInvoices(),
    getLowStockProducts(),
    getTopProducts()
  ])

  return (
    <div className="space-y-8 pb-10">
      <DashboardCompanyContext />
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight">لوحة التحكم</h1>
        <p className="text-muted-foreground font-bold">ملخص شامل لأداء نشاطك التجاري اليوم</p>
      </div>

      {/* KPI Cards */}
      <KPIGrid initialData={stats} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sales Analysis Chart */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="border-none shadow-sm overflow-hidden flex-1">
            <CardHeader className="bg-white pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black">تحليل المبيعات</CardTitle>
                <CardDescription className="font-bold">أداء المبيعات خلال آخر 7 أيام</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-black italic">
                  تحديث تلقائي
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              <SalesChart data={salesData} />
            </CardContent>
          </Card>

          <TopProductsChart data={topProducts} />
        </div>

        {/* Recent Activity & Low Stock */}
        <div className="lg:col-span-4 space-y-6">
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11 mb-2 bg-secondary/50 p-1">
              <TabsTrigger value="recent" className="font-black text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                آخر الفواتير
              </TabsTrigger>
              <TabsTrigger value="low-stock" className="font-black text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                تنبيهات المخزون
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent">
              <Card className="border-none shadow-sm overflow-hidden min-h-[400px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-black">آخر العمليات</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentInvoices invoices={recentInvoices} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="low-stock">
              <Card className="border-none shadow-sm overflow-hidden min-h-[400px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-black">نواقص المخزون</CardTitle>
                </CardHeader>
                <CardContent>
                  <StockAlertsWidget />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
