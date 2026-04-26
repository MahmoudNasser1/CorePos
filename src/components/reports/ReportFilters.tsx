'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Filter, RefreshCw, FileDown } from 'lucide-react';
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfWeek,
  parse,
  isAfter,
} from 'date-fns';
import { ar } from 'date-fns/locale';

interface ReportFiltersProps {
  onFilter: (filters: any) => void;
  onExport?: () => void | Promise<void>;
  showBranch?: boolean;
  showWarehouse?: boolean;
  /** عند التصدير من الـ hook أو الصفحة */
  exportLoading?: boolean;
}

function parseYmd(s: string) {
  return parse(s, 'yyyy-MM-dd', new Date());
}

export function ReportFilters({
  onFilter,
  onExport,
  showBranch = true,
  showWarehouse = false,
  exportLoading = false,
}: ReportFiltersProps) {
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [branchId, setBranchId] = useState('all');
  const [dateError, setDateError] = useState<string | null>(null);
  const [appliedStart, setAppliedStart] = useState(startDate);
  const [appliedEnd, setAppliedEnd] = useState(endDate);
  const [internalExporting, setInternalExporting] = useState(false);

  const periodLabel = useMemo(() => {
    try {
      const a = parseYmd(appliedStart);
      const b = parseYmd(appliedEnd);
      return `من ${format(a, 'd MMMM yyyy', { locale: ar })} إلى ${format(b, 'd MMMM yyyy', { locale: ar })}`;
    } catch {
      return '';
    }
  }, [appliedStart, appliedEnd]);

  const commitFilter = useCallback(
    (nextStart: string, nextEnd: string, rangeKey: string) => {
      const s = parseYmd(nextStart);
      const e = parseYmd(nextEnd);
      if (isAfter(s, e)) {
        setDateError('التاريخ "من" يجب أن يكون قبل "إلى"');
        return false;
      }
      setDateError(null);
      setStartDate(nextStart);
      setEndDate(nextEnd);
      setDateRange(rangeKey);
      setAppliedStart(nextStart);
      setAppliedEnd(nextEnd);
      onFilter({
        startDate: nextStart,
        endDate: nextEnd,
        branchId: branchId === 'all' ? undefined : branchId,
      });
      return true;
    },
    [branchId, onFilter]
  );

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
        start = startOfWeek(today, { weekStartsOn: 6 });
        end = today;
        break;
      case 'this_month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'this_year':
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      case 'custom':
        return;
    }

    const ns = format(start, 'yyyy-MM-dd');
    const ne = format(end, 'yyyy-MM-dd');
    setStartDate(ns);
    setEndDate(ne);
  };

  const applyFilters = () => {
    if (dateRange === 'custom') {
      commitFilter(startDate, endDate, 'custom');
      return;
    }
    commitFilter(startDate, endDate, dateRange);
  };

  const resetFilters = () => {
    const t = format(new Date(), 'yyyy-MM-dd');
    setDateRange('today');
    setBranchId('all');
    setDateError(null);
    setStartDate(t);
    setEndDate(t);
    setAppliedStart(t);
    setAppliedEnd(t);
    onFilter({ startDate: t, endDate: t, branchId: undefined });
  };

  const presetApply = (range: 'today' | 'this_week' | 'this_month') => {
    handleRangeChange(range);
    const today = new Date();
    let start = today;
    let end = today;
    switch (range) {
      case 'today':
        break;
      case 'this_week':
        start = startOfWeek(today, { weekStartsOn: 6 });
        end = today;
        break;
      case 'this_month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
    }
    const ns = format(start, 'yyyy-MM-dd');
    const ne = format(end, 'yyyy-MM-dd');
    setDateRange(range);
    setStartDate(ns);
    setEndDate(ne);
    setDateError(null);
    setAppliedStart(ns);
    setAppliedEnd(ne);
    onFilter({
      startDate: ns,
      endDate: ne,
      branchId: branchId === 'all' ? undefined : branchId,
    });
  };

  const handleExportClick = async () => {
    if (!onExport) return;
    setInternalExporting(true);
    try {
      await Promise.resolve(onExport());
    } finally {
      setInternalExporting(false);
    }
  };

  const exporting = exportLoading || internalExporting;

  return (
    <Card className="mb-6 border-none shadow-sm bg-muted/30" dir="rtl">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {periodLabel}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant={dateRange === 'today' ? 'default' : 'outline'} onClick={() => presetApply('today')}>
            اليوم
          </Button>
          <Button type="button" size="sm" variant={dateRange === 'this_week' ? 'default' : 'outline'} onClick={() => presetApply('this_week')}>
            هذا الأسبوع
          </Button>
          <Button type="button" size="sm" variant={dateRange === 'this_month' ? 'default' : 'outline'} onClick={() => presetApply('this_month')}>
            هذا الشهر
          </Button>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label className="mb-2 block text-xs font-medium text-muted-foreground">الفترة الزمنية</Label>
            <Select value={dateRange} onValueChange={handleRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="yesterday">أمس</SelectItem>
                <SelectItem value="this_week">هذا الأسبوع</SelectItem>
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
                <SelectContent dir="rtl">
                  <SelectItem value="all">كافة الفروع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showWarehouse && (
            <div className="w-48">
              <Label className="mb-2 block text-xs font-medium text-muted-foreground">المستودع</Label>
              <Select disabled>
                <SelectTrigger className="opacity-80">
                  <SelectValue placeholder="قريبًا" />
                </SelectTrigger>
              </Select>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 ms-auto">
            <Button type="button" onClick={applyFilters} className="bg-primary hover:bg-primary/90">
              <Filter className="w-4 h-4 ms-2" />
              تطبيق
            </Button>

            <Button type="button" variant="outline" onClick={resetFilters} title="إعادة ضبط الفلاتر">
              <RefreshCw className="w-4 h-4 ms-2" />
              تصفية
            </Button>

            {onExport && (
              <Button type="button" variant="secondary" onClick={handleExportClick} disabled={exporting}>
                <FileDown className="w-4 h-4 ms-2" />
                {exporting ? 'جاري تجهيز الملف…' : 'تصدير'}
              </Button>
            )}
          </div>
        </div>

        {dateError && (
          <p className="text-sm text-destructive" role="alert">
            {dateError}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default ReportFilters;
