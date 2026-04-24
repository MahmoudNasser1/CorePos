'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Filter, RefreshCw, FileDown } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ReportFiltersProps {
  onFilter: (filters: any) => void;
  onExport?: () => void;
  showBranch?: boolean;
  showWarehouse?: boolean;
}

export function ReportFilters({ onFilter, onExport, showBranch = true, showWarehouse = false }: ReportFiltersProps) {
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [branchId, setBranchId] = useState('all');

  const handleRangeChange = (range: string) => {
    setDateRange(range);
    const today = new Date();
    let start = today;
    let end = today;

    switch (range) {
      case 'today':
        break;
      case 'yesterday':
        start = subDays(today, 1);
        end = subDays(today, 1);
        break;
      case 'this_week':
        start = subDays(today, 7);
        break;
      case 'this_month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'this_year':
        start = startOfYear(today);
        break;
    }

    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  const applyFilters = () => {
    onFilter({
      startDate,
      endDate,
      branchId: branchId === 'all' ? undefined : branchId,
    });
  };

  return (
    <Card className="mb-6 border-none shadow-sm bg-muted/30">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label className="mb-2 block text-xs font-medium text-muted-foreground">الفترة الزمنية</Label>
            <Select value={dateRange} onValueChange={handleRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="yesterday">أمس</SelectItem>
                <SelectItem value="this_week">آخر 7 أيام</SelectItem>
                <SelectItem value="this_month">هذا الشهر</SelectItem>
                <SelectItem value="this_year">هذه السنة</SelectItem>
                <SelectItem value="custom">مخصص</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div className="w-40">
                <Label className="mb-2 block text-xs font-medium text-muted-foreground">من تاريخ</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="w-40">
                <Label className="mb-2 block text-xs font-medium text-muted-foreground">إلى تاريخ</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </>
          )}

          {showBranch && (
            <div className="w-48">
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">الفرع</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كافة الفروع</SelectItem>
                  {/* سيتم جلب الفروع ديناميكياً في الصفحة الأب */}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button onClick={applyFilters} className="bg-primary hover:bg-primary/90">
              <Filter className="w-4 h-4 ml-2" />
              تطبيق
            </Button>
            
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4" />
            </Button>

            {onExport && (
              <Button variant="secondary" onClick={onExport}>
                <FileDown className="w-4 h-4 ml-2" />
                تصدير
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReportFilters;
