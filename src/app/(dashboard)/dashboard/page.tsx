import {
  getDashboardStats,
  getSalesChartData,
  getRecentInvoices,
  getTopProducts,
} from "@/lib/actions/reports.actions"
import { KPIGrid } from "@/components/dashboard/KPIGrid"
import { DashboardCompanyContext } from "@/components/dashboard/DashboardCompanyContext"
import { SalesChart } from "@/components/dashboard/SalesChart"
import { TopProductsChart } from "@/components/dashboard/TopProductsChart"
import { RecentInvoices } from "@/components/dashboard/RecentInvoices"
import { StockAlertsWidget } from "@/components/dashboard/StockAlertsWidget"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getBackendSession } from "@/lib/api/user"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getBackendSession()
  const p = (session as any)?.profile
  const hasCompany = !!(p?.company_id ?? p?.companyId)

  const [stats, salesData, recentInvoices, topProducts] = await Promise.all([
    getDashboardStats().catch(() => null),
    getSalesChartData().catch(() => []),
    getRecentInvoices().catch(() => []),
    getTopProducts().catch(() => []),
  ])

  const statsFailed = hasCompany && stats === null

  return (
    <div className="space-y-8 pb-10">
      <DashboardCompanyContext />

      {!hasCompany && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">أهلاً بك في CorePOS</CardTitle>
            <CardDescription className="text-muted-foreground">
              لإكمال الإعداد، أضف بيانات شركتك من الإعدادات لتفعيل المخزون والفواتير والتقارير.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/settings">
              <Button size="lg">إكمال إعداد الشركة</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">ملخص سريع: مبيعات اليوم، الخزينة، والفواتير الأخيرة.</p>
      </div>

      <KPIGrid initialData={stats ?? {}} statsFailed={statsFailed} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">اتجاه المبيعات</CardTitle>
              <CardDescription>آخر سبعة أيام مسجّلة في النظام.</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-4 pt-0 sm:px-4">
              <SalesChart data={salesData} />
            </CardContent>
          </Card>

          <TopProductsChart data={topProducts} />
        </div>

        <div className="lg:col-span-4">
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="mb-3 grid h-10 w-full grid-cols-2 bg-muted/60 p-1">
              <TabsTrigger value="recent" className="text-xs font-medium">
                آخر الفواتير
              </TabsTrigger>
              <TabsTrigger value="low-stock" className="text-xs font-medium">
                المخزون
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              <Card className="min-h-[320px] border bg-card shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">آخر العمليات</CardTitle>
                  <CardDescription>انقر على صف للانتقال إلى تفاصيل الفاتورة.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentInvoices invoices={recentInvoices} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="low-stock">
              <Card className="min-h-[320px] border bg-card shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">تنبيهات المخزون</CardTitle>
                  <CardDescription>أصناف وصلت لحد التنبيه أو دونه.</CardDescription>
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
