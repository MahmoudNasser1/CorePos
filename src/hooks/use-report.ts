import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { exportToExcel, formatDataForExport } from '@/lib/excel-export';
import { toast } from 'sonner';

interface UseReportOptions {
  reportType: string;
  filters: any;
  fetchFn: (filters: any) => Promise<any[]>;
  columns: { key: string; label: string }[];
  exportFileName?: string;
}

export function useReport({
  reportType,
  filters,
  fetchFn,
  columns,
  exportFileName = 'report'
}: UseReportOptions) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['report', reportType, filters],
    queryFn: () => fetchFn(filters),
    enabled: !!filters,
  });

  const exportData = useCallback(() => {
    if (!data || data.length === 0) {
      toast.error('لا يوجد بيانات للتصدير');
      return;
    }

    try {
      const formattedData = formatDataForExport(data, columns);
      exportToExcel(formattedData, `${exportFileName}_${new Date().toISOString().split('T')[0]}`);
      toast.success('تم تصدير التقرير بنجاح');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('حدث خطأ أثناء تصدير التقرير');
    }
  }, [data, columns, exportFileName]);

  return {
    data: data || [],
    isLoading,
    error,
    exportData,
    refetch
  };
}
