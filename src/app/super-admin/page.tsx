import { createClient } from "@/lib/supabase/server"
import { Users, Building, CreditCard, Activity, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function SuperAdminDashboard() {
  const supabase = await createClient()

  // Fetch SaaS overview from view
  const { data: overview } = await supabase
    .from('v_saas_overview')
    .select('*')
  
  // Fake summary stats for design
  const summary = {
    total_companies: 12,
    active_subscriptions: 10,
    total_revenue: 45000,
    trial_expiring_soon: 3
  }

  return (
    <div className="space-y-8 p-8 font-cairo">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black">Super Admin Console</h1>
        <p className="text-muted-foreground font-bold">نظام إدارة الشركات والاشتراكات والمنصة</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard 
          title="إجمالي الشركات" 
          value={summary.total_companies} 
          icon={Building} 
          color="blue" 
        />
        <StatsCard 
          title="اشتراكات نشطة" 
          value={summary.active_subscriptions} 
          icon={CreditCard} 
          color="green" 
        />
        <StatsCard 
          title="إجمالي الإيرادات" 
          value={`${summary.total_revenue.toLocaleString()} ج.م`} 
          icon={Activity} 
          color="purple" 
        />
        <StatsCard 
          title="تنبيهات الانقضاء" 
          value={summary.trial_expiring_soon} 
          icon={AlertTriangle} 
          color="orange" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Companies List */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-black">الشركات والنشاط الحالي</CardTitle>
            <CardDescription className="font-bold">متابعة حالة الاشتراكات واستخدام المنصة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview?.map((co: any) => (
                <div key={co.company_id} className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-secondary">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-primary text-xl">
                      {co.company_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-md">{co.company_name}</h3>
                      <p className="text-xs text-muted-foreground font-bold">
                        {co.invoice_count} فاتورة • {co.product_count} صنف • {co.user_count} مستخدم
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <div className="text-xs font-black text-muted-foreground uppercase mb-1">Status</div>
                      <Badge variant={co.sub_status === 'active' ? 'default' : 'destructive'} className="font-black">
                        {co.sub_status === 'active' ? 'نشط' : 'مشكلة'}
                      </Badge>
                    </div>
                    
                    <div className="text-left">
                      <div className="text-xs font-black text-muted-foreground uppercase mb-1">Plan</div>
                      <span className="font-black text-sm">{co.plan_name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health / Logs */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-black">تنبيهات النظام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3 text-sm p-3 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-100">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="font-bold">شركة "البراء للتجارة" اقترب موعد انتهاء اشتراكها (3 أيام)</p>
              </div>
              <div className="flex gap-3 text-sm p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                <Users className="w-5 h-5 shrink-0" />
                <p className="font-bold">تم تسجيل ٥ مستخدمين جدد اليوم في النظام</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600"
  }

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-black mt-1 tracking-tight">{value}</h3>
          </div>
          <div className={cn("p-3 rounded-2xl", colors[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { cn } from "@/lib/utils"
