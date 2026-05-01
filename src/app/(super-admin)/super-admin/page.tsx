import { getPlatformAdminOverview } from "@/lib/actions/platform-admin.actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  Activity
} from "lucide-react"
import { PlatformHealth } from "./PlatformHealth"
import { PlatformAnalytics } from "./PlatformAnalytics"
import { RecentActivity } from "./RecentActivity"

export const dynamic = "force-dynamic"

export default async function SuperAdminOverviewPage() {
  const overview = await getPlatformAdminOverview()

  if (!overview) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">خطأ في تحميل البيانات</h1>
        <p className="text-muted-foreground mt-2">يرجى التأكد من اتصالك بالإنترنت وصلاحيات الحساب.</p>
      </div>
    )
  }

  const stats = [
    {
      title: "إجمالي الشركات",
      value: overview.companies.total,
      description: "نمو مستقر للمنصة",
      icon: Building2,
      trend: "+12%",
      trendUp: true,
      color: "blue"
    },
    {
      title: "المستخدمين",
      value: overview.users.total,
      description: `${overview.users.active} حساب نشط`,
      icon: Users,
      trend: "+5%",
      trendUp: true,
      color: "indigo"
    },
    {
      title: "الاشتراكات النشطة",
      value: overview.subscriptions.active,
      description: "عقود سارية المفعول",
      icon: CreditCard,
      trend: "+8%",
      trendUp: true,
      color: "emerald"
    },
    {
      title: "الإيرادات الشهرية",
      value: formatCurrency(overview.revenue?.mrr || 0, 'EGP'),
      description: "صافي أرباح (MRR)",
      icon: TrendingUp,
      trend: "+15%",
      trendUp: true,
      color: "amber"
    }
  ]

  return (
    <div className="space-y-8 pb-10" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            نظرة عامة على المنصة
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة مركزية شاملة لكافة موارد ومستخدمي النظام.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 ml-2 animate-pulse" />
            جميع الأنظمة تعمل بكفاءة
          </Badge>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border shadow-sm hover:shadow-md transition-all group relative overflow-hidden bg-card">
            <div className={`absolute top-0 right-0 w-1 h-full bg-${stat.color}-500`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-xl bg-muted text-foreground group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex items-center text-[10px] font-bold ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.trend}
                </span>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health and Control Center */}
      <PlatformHealth />

      {/* Analytics and Activity */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <PlatformAnalytics trends={overview.trends || []} />
        </div>
        <div className="lg:col-span-4">
          <RecentActivity activities={overview.recentActivity || []} />
        </div>
      </div>

      {/* Secondary Alerts Section */}
      {overview.subscriptions.pastDue > 0 && (
        <Card className="border-amber-100 bg-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700">
              <AlertCircle className="h-4 w-4" />
              تنبيهات السداد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-800">
              يوجد <strong>{overview.subscriptions.pastDue}</strong> اشتراكات متأخرة السداد تتطلب متابعة مالية.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
