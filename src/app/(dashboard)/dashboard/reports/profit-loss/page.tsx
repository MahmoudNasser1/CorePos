'use client';

import { useState, useEffect } from 'react';
import ReportFilters from '@/components/reports/ReportFilters';
import { getPremiumProfitLoss } from '@/lib/actions/reports.actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { TrendingUp, TrendingDown, Receipt, ShoppingCart, Wallet, Percent, Download, FileText, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToPremiumPDF } from '@/lib/pdf-export';

export default function ProfitLossPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getPremiumProfitLoss({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      // Aggregate data from view
      const summary = response?.reduce((acc: any, curr: any) => ({
        totalSales: acc.totalSales + Number(curr.total_sales),
        totalVAT: acc.totalVAT + Number(curr.total_tax),
        totalCOGS: acc.totalCOGS + Number(curr.total_purchases),
        totalExpenses: acc.totalExpenses + Number(curr.total_expenses),
        grossProfit: acc.grossProfit + Number(curr.gross_profit),
        netProfit: acc.netProfit + Number(curr.net_profit),
      }), { totalSales: 0, totalVAT: 0, totalCOGS: 0, totalExpenses: 0, grossProfit: 0, netProfit: 0 });

      setData(summary);
    } catch (error) {
      console.error('Error fetching profit/loss data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleExportPDF = async () => {
    await exportToPremiumPDF({
      filename: "Profit_Loss_Report",
      elementId: "premium-report-content",
      title: "تقرير الأرباح والخسائر - CorePOS"
    });
  };

  if (!data && !loading) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold text-destructive">عذراً، حدث خطأ أثناء تحميل البيانات</h2>
      <Button onClick={fetchData} className="mt-4">إعادة المحاولة</Button>
    </div>
  );

  return (
    <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen pb-20" id="premium-report-content">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">قائمة الدخل (الأرباح والخسائر)</h1>
          <p className="text-slate-500 font-bold mt-1">بيان مالي تفصيلي للأداء خلال الفترة المحددة</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 font-bold bg-white" onClick={handleExportPDF}>
            <Download className="w-4 h-4" />
            تصدير Excel
          </Button>
          <Button className="gap-2 font-bold shadow-lg shadow-primary/20" onClick={handleExportPDF}>
            <FileText className="w-4 h-4" />
            تحميل تقرير PDF بريميوم
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border-none">
        <ReportFilters onFilter={setFilters} showBranch={false} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
           {[...Array(3)].map((_, i) => <div key={i} className="h-44 bg-slate-200 rounded-2xl"></div>)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm overflow-hidden group">
               <div className="h-2 bg-blue-600 w-full" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-500">إجمالي الإيرادات (المبيعات)</CardTitle>
                <div className="text-3xl font-black text-slate-900 mt-2 tabular-nums">{data.totalSales.toLocaleString()} ج.م</div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs font-bold text-slate-500 gap-2 p-2 bg-blue-50 rounded-lg">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  قيمة الضريبة المضافة: {data.totalVAT.toLocaleString()} ج.م
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden group">
               <div className="h-2 bg-orange-500 w-full" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-500">تكلفة البضاعة المباعة</CardTitle>
                <div className="text-3xl font-black text-slate-900 mt-2 tabular-nums">({data.totalCOGS.toLocaleString()}) ج.م</div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs font-bold text-slate-500 gap-2 p-2 bg-orange-50 rounded-lg">
                  <ShoppingCart className="w-4 h-4 text-orange-600" />
                  تشمل تكلفة الشراء فقط
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden bg-emerald-50/30 border border-emerald-100">
               <div className="h-2 bg-emerald-500 w-full" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-emerald-700">مجمل الربح</CardTitle>
                <div className="text-3xl font-black text-emerald-700 mt-2 tabular-nums">{data.grossProfit.toLocaleString()} ج.م</div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs font-black text-emerald-600 gap-2">
                  <TrendingUp className="w-4 h-4" />
                  هامش الربح الإجمالي: {data.totalSales > 0 ? ((data.grossProfit / data.totalSales) * 100).toFixed(1) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-xl font-black">تحليل المصروفات التشغيلية</CardTitle>
                <CardDescription className="font-bold">المبالغ المصروفة خارج تكلفة البضاعة</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  <div className="p-6 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">المصروفات العامة</div>
                        <div className="text-xs text-slate-400 font-bold">إيجارات، فواتير، نثرية</div>
                      </div>
                    </div>
                    <div className="text-lg font-black text-rose-600">{data.totalExpenses.toLocaleString()} ج.م</div>
                  </div>
                  <div className="p-6 flex justify-between items-center bg-slate-50/30">
                    <span className="font-black text-slate-600">إجمالي الخصومات الممنوحة</span>
                    <span className="font-black text-slate-900">0 ج.م</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border-none shadow-2xl rounded-2xl overflow-hidden self-start",
              data.netProfit >= 0 ? "bg-slate-900 text-white" : "bg-rose-900 text-white"
            )}>
              <CardHeader>
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <Wallet className={cn("w-6 h-6", data.netProfit >= 0 ? "text-emerald-400" : "text-rose-400")} />
                  النتيجة النهائية للمنشأة
                </CardTitle>
                <CardDescription className="text-slate-400 font-bold">صافي الربح بعد استقطاع كافة التكاليف والمصروفات</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex justify-between items-baseline border-b border-white/10 pb-4">
                  <span className="text-slate-400 font-bold">قيمة صافي {data.netProfit >= 0 ? "الربح" : "الخسارة"}:</span>
                  <div className="text-5xl font-black tracking-tighter">
                    {data.netProfit.toLocaleString()} <span className="text-lg font-bold">ج.م</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-xs text-slate-400 font-bold mb-1 text-end">هامش صافي الربح</div>
                    <div className="text-2xl font-black text-emerald-400 tabular-nums">
                      {data.totalSales > 0 ? ((data.netProfit / data.totalSales) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-xs text-slate-400 font-bold mb-1 text-end">الوضع</div>
                    <div className={cn("text-xl font-black text-center", data.netProfit >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {data.netProfit >= 0 ? "أداء جيد" : "يحتاج انتباه"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                   <Button className="h-12 w-full gap-2 bg-white font-black text-slate-900 hover:bg-slate-200">
                      <Share2 className="h-4 w-4 shrink-0" aria-hidden />
                      مشاركة التقرير
                   </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
