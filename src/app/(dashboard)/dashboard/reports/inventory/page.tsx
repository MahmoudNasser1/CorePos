'use client';

import { useState, useEffect } from 'react';
import ReportFilters from '@/components/reports/ReportFilters';
import { DistributionChart } from '@/components/reports/ReportCharts';
import { getStockReport } from '@/lib/actions/reports.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, BarChart3, Archive } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatCurrency } from '@/lib/utils';

export default function InventoryReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({ stock_value: 0, qty: 0 });
  const [filters, setFilters] = useState({
    warehouseId: undefined,
    lowStockOnly: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getStockReport(filters);
      setData(response.data || []);
      setTotals(response.totals || { stock_value: 0, qty: 0 });
    } catch (error) {
      console.error('Error fetching inventory report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      'اسم الصنف': item.name,
      'الباركود': item.barcode,
      'التصنيف': item.category_name,
      'المخزن': item.warehouse_name,
      'الكمية': item.qty,
      'متوسط التكلفة': item.avg_cost,
      'قيمة المخزون': item.stock_value,
      'الحد الأدنى': item.min_qty,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Report');
    XLSX.writeFile(wb, `تقرير_المخزون_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const lowStockItems = data.filter(i => i.low_stock);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">تقرير المخزون</h1>
      </div>

      <ReportFilters 
        onFilter={(f) => setFilters({ ...filters, ...f })} 
        onExport={exportToExcel}
        showBranch={false}
        showWarehouse={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">إجمالي الأصناف</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold text-blue-700">{data.length} صنف</div>
            <Package className="w-4 h-4 text-blue-700 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50/50">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">نواقص المخزون</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold text-amber-700">{lowStockItems.length} صنف</div>
            <AlertTriangle className="w-4 h-4 text-amber-700 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">إجمالي الكميات</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold">{totals.qty.toLocaleString()} وحدة</div>
            <Archive className="w-4 h-4 text-muted-foreground mt-2" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-green-50/50">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">قيمة المخزون (بالتكلفة)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold text-green-700 tabular-nums">{formatCurrency(Math.round(Number(totals.stock_value) || 0))}</div>
            <BarChart3 className="w-4 h-4 text-green-700 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionChart 
          title="توزيع المخزون حسب التصنيف" 
          data={[
            { name: 'إلكترونيات', value: 400 },
            { name: 'أدوات مكتبية', value: 300 },
            { name: 'منظفات', value: 300 },
            { name: 'أخرى', value: 200 },
          ]} 
        />
        <DistributionChart 
          title="حالة الأصناف" 
          data={[
            { name: 'متوفر', value: data.length - lowStockItems.length },
            { name: 'منخفض', value: lowStockItems.length },
          ]} 
        />
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-md">تفاصيل المخازن</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الصنف</TableHead>
                <TableHead>المخزن</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">التكلفة المتوسطة</TableHead>
                <TableHead className="text-right">إجمالي القيمة</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">لا توجد بيانات مخزون</TableCell></TableRow>
              ) : data.map((item, idx) => (
                <TableRow key={`${item.id}-${item.warehouse_id}-${idx}`}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground">{item.barcode}</div>
                  </TableCell>
                  <TableCell>{item.warehouse_name || 'غير محدد'}</TableCell>
                  <TableCell className="text-right font-bold">{item.qty}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(Number(item.avg_cost))}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(Number(item.stock_value))}</TableCell>
                  <TableCell>
                    {item.low_stock ? (
                      <Badge variant="destructive">منخفض</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">متوفر</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
