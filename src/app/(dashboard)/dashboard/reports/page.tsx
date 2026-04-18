'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  AlertCircle
} from 'lucide-react';

const reportGroups = [
  {
    title: 'تقارير المبيعات والأرباح',
    description: 'تتبع المبيعات والربحية والأداء اليومي',
    reports: [
      { name: 'تقرير المبيعات التفصيلي', href: '/dashboard/reports/sales', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-100' },
      { name: 'تحليل الأرباح الهامشية', href: '/dashboard/reports/profit-loss', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
      { name: 'التقرير اليومي', href: '/dashboard/reports/daily', icon: History, color: 'text-purple-600', bg: 'bg-purple-100' },
    ]
  },
  {
    title: 'تقارير المخزون',
    description: 'مراقبة حركة الأصناف وتوافرها في المخازن',
    reports: [
      { name: 'حالة المخزون الحالي', href: '/dashboard/reports/inventory', icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
      { name: 'نواقص المخزون', href: '/dashboard/reports/inventory?lowStock=true', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
      { name: 'حركة الأصناف', href: '/dashboard/reports/stock-movement', icon: Receipt, color: 'text-teal-600', bg: 'bg-teal-100' },
    ]
  },
  {
    title: 'التقارير المالية',
    description: 'كشوفات الخزينة والمصروفات والضرائب',
    reports: [
      { name: 'كشف حركة الخزينة', href: '/dashboard/reports/treasury', icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-100' },
      { name: 'تقرير المصروفات', href: '/dashboard/reports/expenses', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
      { name: 'التقرير الضريبي (VAT)', href: '/dashboard/reports/tax', icon: PieChart, color: 'text-rose-600', bg: 'bg-rose-100' },
    ]
  },
  {
    title: 'تقارير العملاء والموردين',
    description: 'أرصدة الحسابات وتعاملات الكيانات',
    reports: [
      { name: 'أرصدة العملاء (مديونيات)', href: '/dashboard/reports/customers', icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-100' },
      { name: 'أرصدة الموردين', href: '/dashboard/reports/suppliers', icon: Truck, color: 'text-slate-600', bg: 'bg-slate-100' },
    ]
  }
];

export default function ReportsHubPage() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight">مركز التقارير</h1>
        <p className="text-muted-foreground font-bold">كل إحصائيات عملك في مكان واحد</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {reportGroups.map((group, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-lg font-black">{group.title}</h2>
              <p className="text-xs text-muted-foreground">{group.description}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.reports.map((report, rIdx) => (
                <Link key={rIdx} href={report.href}>
                  <Card className="hover:border-primary/50 transition-all cursor-pointer group h-full border-none shadow-sm shadow-black/5 hover:shadow-black/10">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${report.bg} ${report.color}`}>
                        <report.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black group-hover:text-primary transition-colors">{report.name}</div>
                        <div className="text-[10px] text-muted-foreground">عرض التقرير الآن</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Summary Card at bottom */}
      <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <TrendingUp className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="text-xl font-black">تحتاج تقرير مخصص؟</CardTitle>
          <CardDescription className="text-primary-foreground/80 font-bold">
            يمكنك دائماً فلترة أي تقرير وتصديره بصيغة Excel لمزيد من التحليل.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Link href="/dashboard/reports/sales">
              <span className="text-sm font-black underline underline-offset-4 decoration-2">ابدأ بتقرير المبيعات ←</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
