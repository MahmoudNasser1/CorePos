'use client';

import { useState, useEffect } from 'react';
import ReportFilters from '@/components/reports/ReportFilters';
import { RevenueTrendChart } from '@/components/reports/ReportCharts';
import { getSalesReport } from '@/lib/actions/reports.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DollarSign, TrendingUp, CreditCard, PieChart } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function SalesReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const reportData = await getSalesReport({
        ...filters,
      });
      setData(reportData || []);
    } catch (error) {
      console.error('Error fetching sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const totalSales = data.reduce((acc, curr) => acc + Number(curr.total), 0);
  const totalVAT = data.reduce((acc, curr) => acc + Number(curr.tax_amount), 0);
  const totalPaid = data.reduce((acc, curr) => acc + Number(curr.paid), 0);
  const totalRemaining = data.reduce((acc, curr) => acc + Number(curr.remaining), 0);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      'رقم الفاتورة': item.invoice_number,
      'التاريخ': item.date,
      'العميل': item.customers?.name || 'عميل نقدي',
      'الإجمالي': item.total,
      'الضريبة': item.tax_amount,
      'المدفوع': item.paid,
      'المتبقي': item.remaining,
      'الحالة': item.status,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    XLSX.writeFile(wb, `تقرير_المبيعات_${filters.startDate}_${filters.endDate}.xlsx`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">تقرير المبيعات</h1>
      </div>

      <ReportFilters onFilter={setFilters} onExport={exportToExcel} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-primary/10">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">إجمالي المبيعات</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold">{totalSales.toLocaleString()} ر.س</div>
            <TrendingUp className="w-4 h-4 text-primary mt-2" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">إجمالي الضريبة</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold">{totalVAT.toLocaleString()} ر.س</div>
            <div className="text-[10px] text-muted-foreground mt-2">VAT 15%</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">المبالغ المحصلة</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold text-green-600">{totalPaid.toLocaleString()} ر.س</div>
            <CreditCard className="w-4 h-4 text-green-600 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">إجمالي الآجل</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold text-red-600">{totalRemaining.toLocaleString()} ر.س</div>
            <DollarSign className="w-4 h-4 text-red-600 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RevenueTrendChart 
          title="منحنى المبيعات" 
          data={data.map(i => ({ date: i.date, total: i.total })).reverse()} 
          dataKey="total" 
          xKey="date" 
        />
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead className="text-right">الإجمالي</TableHead>
                <TableHead className="text-right">الضريبة</TableHead>
                <TableHead className="text-right">المتبقي</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">لا توجد سجلات</TableCell></TableRow>
              ) : data.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">#{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.customers?.name || 'عميل نقدي'}</TableCell>
                  <TableCell className="text-right">{invoice.total} ر.س</TableCell>
                  <TableCell className="text-right">{invoice.tax_amount} ر.س</TableCell>
                  <TableCell className="text-right text-red-500">{invoice.remaining} ر.س</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === 'confirmed' ? 'default' : 'secondary'}>
                      {invoice.status === 'confirmed' ? 'مؤكد' : invoice.status}
                    </Badge>
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
