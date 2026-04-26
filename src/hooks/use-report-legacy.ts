import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { exportToExcel as doExportToExcel, formatDataForExport } from '@/lib/excel-export';
import { toast } from 'sonner';

interface OldUseReportOptions {
  queryKey: string[];
  queryFn: (filters: any) => Promise<any>;
}

export function useReportLegacy({ queryKey, queryFn }: OldUseReportOptions) {
  const [filters, setFilters] = useState<any>({});
  const [isExporting, setIsExporting] = useState(false);

  const { data: qData, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKey, filters],
    queryFn: () => queryFn(filters),
  });

  const isObject = qData && !Array.isArray(qData) && (qData as any).data !== undefined;
  const data = isObject ? (qData as any).data : (qData || []);
  const totals = isObject ? (qData as any).totals : null;

  const exportToExcel = useCallback(
    async (columns: any[], filename: string) => {
      if (!data || data.length === 0) {
        toast.error('لا يوجد بيانات للتصدير');
        return;
      }

      setIsExporting(true);
      try {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
        const formattedData = formatDataForExport(data, columns);
        doExportToExcel(formattedData, `${filename}_${new Date().toISOString().split('T')[0]}`);
        toast.success('تم تصدير التقرير بنجاح');
      } catch (err) {
        console.error('Export error:', err);
        toast.error('حدث خطأ أثناء تصدير التقرير');
      } finally {
        setIsExporting(false);
      }
    },
    [data]
  );

  return {
    data,
    isLoading,
    error,
    totals,
    filters,
    setFilters,
    exportToExcel,
    isExporting,
    refetch,
  };
}
