import { 
  getDashboardStats, 
  getSalesChartData, 
  getRecentInvoices, 
  getTopProducts
} from "@/lib/actions/reports.actions"
import { KPIGrid } from "@/components/dashboard/KPIGrid"
import { DashboardCompanyContext } from "@/components/dashboard/DashboardCompanyContext"
import { SalesChart } from "@/components/dashboard/SalesChart"
import { TopProductsChart } from "@/components/dashboard/TopProductsChart"
import { RecentInvoices } from "@/components/dashboard/RecentInvoices"
import { StockAlertsWidget } from "@/components/dashboard/StockAlertsWidget"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user?.id || '')
    .single()

  const profileData = profile as unknown as { company_id?: string | null }
  const hasCompany = !!profileData?.company_id

  // Fetch initial data - handle errors gracefully
  const [stats, salesData, recentInvoices, topProducts] = await Promise.all([
    getDashboardStats().catch(() => null),
    getSalesChartData().catch(() => []),
    getRecentInvoices().catch(() => []),
    getTopProducts().catch(() => [])
  ])

  return (
    <div className="space-y-8 pb-10">
      <DashboardCompanyContext />
      
      {!hasCompany && (
        <Card className="border-primary bg-primary/5 border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-black">أهلاً بك في CorePOS! 👋</CardTitle>
            <CardDescription className="text-primary font-bold">
              للبدء، نحتاج منك إعداد بيانات شركتك الأساسية لتتمكن من استخدام جميع مميزات النظام.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/settings">
              <Button size="lg" className="font-black shadow-primary/20 shadow-lg">
                 إكمال إعداد الشركة الآن
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

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
