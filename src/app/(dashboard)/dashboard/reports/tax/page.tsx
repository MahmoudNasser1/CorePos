'use client';

import { useState, useEffect } from 'react';
import ReportFilters from '@/components/reports/ReportFilters';
import { RevenueTrendChart } from '@/components/reports/ReportCharts';
import { getTaxReport } from '@/lib/actions/reports.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileText, PieChart, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function TaxReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const reportData = await getTaxReport({
        ...filters,
      });
      setData(reportData || []);
    } catch (error) {
      console.error('Error fetching tax report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const salesTax = data.filter(i => i.type === 'sale').reduce((acc, curr) => acc + Number(curr.tax_amount), 0);
  const purchaseTax = data.filter(i => i.type === 'purchase').reduce((acc, curr) => acc + Number(curr.tax_amount), 0);
  const netTax = salesTax - purchaseTax;

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      'رقم الفاتورة': item.invoice_number,
      'التاريخ': item.date,
      'النوع': item.type === 'sale' ? 'مبيعات' : 'مشتريات',
      'الإجمالي': item.total,
      'قيمة الضريبة': item.tax_amount,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tax Report');
    XLSX.writeFile(wb, `تقرير_الضريبة_${filters.startDate}_${filters.endDate}.xlsx`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">التقرير الضريبي</h1>
      </div>

      <ReportFilters onFilter={setFilters} onExport={exportToExcel} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">ضريبة المبيعات (مستحقة)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold text-orange-600 font-mono">{salesTax.toLocaleString()} ج.م</div>
            <ArrowUpRight className="w-4 h-4 text-orange-600 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">ضريبة المشتريات (مدفوعة)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold text-blue-600 font-mono">{purchaseTax.toLocaleString()} ج.م</div>
            <ArrowDownLeft className="w-4 h-4 text-blue-600 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-primary">صافي الضريبة للملف</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold text-primary font-mono">{netTax.toLocaleString()} ج.م</div>
            <PieChart className="w-4 h-4 text-primary mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead className="text-right">الإجمالي</TableHead>
                <TableHead className="text-right">قيمة الضريبة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">لا توجد سجلات ضريبية</TableCell></TableRow>
              ) : data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">#{item.invoice_number}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === 'sale' ? 'default' : 'secondary'}>
                      {item.type === 'sale' ? 'مبيعات' : 'مشتريات'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{item.total.toLocaleString()} ج.م</TableCell>
                  <TableCell className={`text-right font-bold font-mono ${item.type === 'sale' ? 'text-orange-600' : 'text-blue-600'}`}>
                    {item.tax_amount.toLocaleString()} ج.م
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
