'use client';

import { useState, useEffect } from 'react';
import ReportFilters from '@/components/reports/ReportFilters';
import { getStockMovementReport } from '@/lib/actions/reports.actions';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, RefreshCcw, Box } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function StockMovementReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const reportData = await getStockMovementReport({
        ...filters,
      });
      setData(reportData || []);
    } catch (error) {
      console.error('Error fetching stock movement report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const totalIn = data.filter(i => i.invoices.type === 'purchase' || i.invoices.type === 'sale_return').reduce((acc, curr) => acc + Number(curr.qty), 0);
  const totalOut = data.filter(i => i.invoices.type === 'sale' || i.invoices.type === 'purchase_return').reduce((acc, curr) => acc + Number(curr.qty), 0);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      'الصنف': item.products?.name,
      'التاريخ': item.invoices.date,
      'نوع الحركة': item.invoices.type,
      'رقم الفاتورة': item.invoices.invoice_number,
      'الكمية': item.qty,
      'السعر': item.unit_price,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Movement');
    XLSX.writeFile(wb, `حركة_المخزون_${filters.startDate}_${filters.endDate}.xlsx`);
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'sale': return { label: 'مبيعات (صادر)', color: 'text-red-600', bg: 'bg-red-100', icon: ArrowUpRight };
      case 'purchase': return { label: 'مشتريات (وارد)', color: 'text-green-600', bg: 'bg-green-100', icon: ArrowDownLeft };
      case 'sale_return': return { label: 'مرتجع مبيعات (وارد)', color: 'text-blue-600', bg: 'bg-blue-100', icon: RefreshCcw };
      case 'purchase_return': return { label: 'مرتجع مشتريات (صادر)', color: 'text-orange-600', bg: 'bg-orange-100', icon: ArrowUpRight };
      default: return { label: type, color: 'text-gray-600', bg: 'bg-gray-100', icon: Box };
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">تقرير حركة الأصناف</h1>
      </div>

      <ReportFilters onFilter={setFilters} onExport={exportToExcel} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">إجمالي الوارد</p>
              <div className="text-2xl font-bold text-green-700">{totalIn} وحدة</div>
            </div>
            <ArrowDownLeft className="w-8 h-8 text-green-600 opacity-20" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">إجمالي الصادر</p>
              <div className="text-2xl font-bold text-red-700">{totalOut} وحدة</div>
            </div>
            <ArrowUpRight className="w-8 h-8 text-red-600 opacity-20" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>الصنف</TableHead>
                <TableHead>نوع الحركة</TableHead>
                <TableHead>المرجع</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">السعر</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">لا توجد حركات مخزنية</TableCell></TableRow>
              ) : data.map((item) => {
                const move = getMovementLabel(item.invoices.type);
                const Icon = move.icon;
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.invoices.date}</TableCell>
                    <TableCell className="font-bold">{item.products?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${move.bg} ${move.color} border-none flex items-center gap-1 w-fit`}>
                        <Icon className="w-3 h-3" />
                        {move.label}
                      </Badge>
                    </TableCell>
                    <TableCell>#{item.invoices.invoice_number}</TableCell>
                    <TableCell className="text-right font-bold">{item.qty}</TableCell>
                    <TableCell className="text-right">{item.unit_price} ج.م</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
