'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  BarChart3,
  Package,
  Receipt,
  Users,
  Truck,
  Wallet,
  TrendingUp,
  FileText,
  PieChart,
  History,
  AlertCircle,
} from 'lucide-react';

type ReportItem = {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
};

const reportGroups: { sectionTitle: string; reports: ReportItem[] }[] = [
  {
    sectionTitle: 'مبيعات وأرباح',
    reports: [
      {
        name: 'تقرير المبيعات التفصيلي',
        description: 'فواتير المبيعات والمدفوع والمتبقي ضمن الفترة.',
        href: '/dashboard/reports/sales',
        icon: BarChart3,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
      },
      {
        name: 'تحليل الأرباح الهامشية',
        description: 'صافي الربح والخسارة حسب الفترة المختارة.',
        href: '/dashboard/reports/profit-loss',
        icon: TrendingUp,
        color: 'text-green-600',
        bg: 'bg-green-100',
      },
      {
        name: 'التقرير اليومي',
        description: 'ملخص يومي: مبيعات، مشتريات، وعدد الفواتير.',
        href: '/dashboard/reports/daily',
        icon: History,
        color: 'text-purple-600',
        bg: 'bg-purple-100',
      },
    ],
  },
  {
    sectionTitle: 'مخزون',
    reports: [
      {
        name: 'حالة المخزون الحالي',
        description: 'كميات وأرصدة مخزنية لكل صنف ومستودع.',
        href: '/dashboard/reports/inventory',
        icon: Package,
        color: 'text-amber-600',
        bg: 'bg-amber-100',
      },
      {
        name: 'نواقص المخزون',
        description: 'الأصناف دون الحد الأدنى للتوريد السريع.',
        href: '/dashboard/reports/inventory?lowStock=true',
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-100',
      },
      {
        name: 'حركة الأصناف',
        description: 'وارد وصادر لكل صنف مرتبط بالفواتير.',
        href: '/dashboard/reports/stock-movement',
        icon: Receipt,
        color: 'text-teal-600',
        bg: 'bg-teal-100',
      },
    ],
  },
  {
    sectionTitle: 'مالية وضرائب',
    reports: [
      {
        name: 'كشف حركة الخزينة',
        description: 'إيداعات ومسحوبات مع صافي الحركة.',
        href: '/dashboard/reports/treasury',
        icon: Wallet,
        color: 'text-indigo-600',
        bg: 'bg-indigo-100',
      },
      {
        name: 'تقرير المصروفات',
        description: 'مصروفات حسب التصنيف والفرع.',
        href: '/dashboard/reports/expenses',
        icon: FileText,
        color: 'text-orange-600',
        bg: 'bg-orange-100',
      },
      {
        name: 'التقرير الضريبي (VAT)',
        description: 'مجاميع ضريبية للمراجعة والإقرار.',
        href: '/dashboard/reports/tax',
        icon: PieChart,
        color: 'text-rose-600',
        bg: 'bg-rose-100',
      },
    ],
  },
  {
    sectionTitle: 'عملاء وموردون',
    reports: [
      {
        name: 'أرصدة العملاء (مديونيات)',
        description: 'رصيد كل عميل وإجمالي المستحقات.',
        href: '/dashboard/reports/customers',
        icon: Users,
        color: 'text-cyan-600',
        bg: 'bg-cyan-100',
      },
      {
        name: 'أرصدة الموردين',
        description: 'رصيد كل مورد وما عليكم له.',
        href: '/dashboard/reports/suppliers',
        icon: Truck,
        color: 'text-slate-600',
        bg: 'bg-slate-100',
      },
    ],
  },
];

export default function ReportsHubPage() {
  return (
    <div className="space-y-10 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">مركز التقارير</h1>
        <p className="text-sm text-muted-foreground">اختر تقريرًا ثم اضبط الفترة من شريط الفلترة أعلى النتائج.</p>
      </div>

      <div className="space-y-10">
        {reportGroups.map((group) => (
          <section key={group.sectionTitle} className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">{group.sectionTitle}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.reports.map((report) => (
                <Link key={report.href} href={report.href} className="block h-full">
                  <Card className="h-full border bg-card/80 shadow-sm transition-colors hover:border-primary/40">
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className={`shrink-0 rounded-lg p-2 ${report.bg} ${report.color}`}>
                        <report.icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="font-semibold leading-snug">{report.name}</div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{report.description}</p>
                        <span className="text-xs font-medium text-primary">فتح ←</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card className="border bg-primary/5 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">تصدير للتحليل</CardTitle>
          <CardDescription className="text-muted-foreground">
            من داخل كل تقرير يمكن تصدير النتائج بصيغة Excel بعد تطبيق الفلتر.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/dashboard/reports/sales"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            ابدأ بتقرير المبيعات
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
