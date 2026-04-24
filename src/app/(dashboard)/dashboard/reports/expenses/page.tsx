'use client';

import { useState, useEffect } from 'react';
import ReportFilters from '@/components/reports/ReportFilters';
import { RevenueTrendChart } from '@/components/reports/ReportCharts';
import { getExpensesReport } from '@/lib/actions/reports.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DollarSign, Wallet, Calendar, Tag } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ExpensesReportPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const reportData = await getExpensesReport({
        ...filters,
      });
      setData(reportData || []);
    } catch (error) {
      console.error('Error fetching expenses report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const totalExpenses = data.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const expenseCount = data.length;
  const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      'المبلغ': item.amount,
      'التاريخ': item.date,
      'التصنيف': item.expense_categories?.name || 'عام',
      'الفرع': item.branches?.name || 'غير محدد',
      'ملاحظات': item.notes || '',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses Report');
    XLSX.writeFile(wb, `تقرير_المصروفات_${filters.startDate}_${filters.endDate}.xlsx`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">تقرير المصروفات</h1>
      </div>

      <ReportFilters onFilter={setFilters} onExport={exportToExcel} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-red-50 dark:bg-red-950/20">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-red-600 dark:text-red-400">إجمالي المصروفات</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold text-red-700 dark:text-red-300">{totalExpenses.toLocaleString()} ج.م</div>
            <DollarSign className="w-4 h-4 text-red-600 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">عدد العمليات</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold">{expenseCount} عملية</div>
            <Calendar className="w-4 h-4 text-muted-foreground mt-2" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">متوسط المصروف</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="text-xl font-bold">{avgExpense.toLocaleString()} ج.م</div>
            <Wallet className="w-4 h-4 text-muted-foreground mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RevenueTrendChart 
          title="توزيع المصروفات زمنياً" 
          data={data.map(i => ({ date: i.date, amount: i.amount })).reverse()} 
          dataKey="amount" 
          xKey="date" 
        />
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>الفرع</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">لا توجد سجلات</TableCell></TableRow>
              ) : data.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Tag className="w-3 h-3" />
                      {expense.expense_categories?.name || 'عام'}
                    </Badge>
                  </TableCell>
                  <TableCell>{expense.branches?.name || 'المركز الرئيسي'}</TableCell>
                  <TableCell className="text-right font-bold text-red-600">{expense.amount.toLocaleString()} ج.م</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={expense.notes}>
                    {expense.notes || '-'}
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
