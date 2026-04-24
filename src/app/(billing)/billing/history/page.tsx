'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  ChevronLeft, 
  Download,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

type SubscriptionHistoryRow = {
  id: string
  status: 'active' | 'trialing' | 'expired' | string
  created_at: string
  current_period_end: string | null
}

export default function BillingHistoryPage() {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<SubscriptionHistoryRow[]>([])

  useEffect(() => {
    async function fetchHistory() {
      // Legacy billing history not implemented yet in backend.
      setInvoices([])
      setLoading(false)
    }
    fetchHistory()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
             <Calendar className="text-primary" size={28} />
             تاريخ المدفوعات
          </h1>
          <p className="text-muted-foreground">عرض سجل الفواتير وحالات الاشتراك السابقة</p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/billing" className="flex items-center gap-2">
            <ChevronLeft size={16} />
            العودة للملخص
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm border-0 bg-transparent ring-1 ring-border">
        <CardHeader className="bg-background rounded-t-lg border-b">
          <CardTitle className="text-lg">الفواتير والعمليات</CardTitle>
          <CardDescription>هذا الجدول يعرض كافة عمليات الاشتراك والترقية</CardDescription>
        </CardHeader>
        <CardContent className="p-0 bg-background overflow-hidden rounded-b-lg">
          {loading ? (
            <div className="p-20 text-center text-muted-foreground animate-pulse">جاري تحميل السجل...</div>
          ) : invoices.length === 0 ? (
            <div className="p-20 text-center space-y-4">
                <FileText className="mx-auto text-muted-foreground/20" size={64} />
                <p className="font-medium text-muted-foreground">لا توجد فواتير فوترة بعد</p>
                <p className="text-sm text-muted-foreground">عند إصدار فواتير الاشتراك ستظهر هنا.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-secondary/50 border-b">
                    <th className="p-4 font-bold">رقم العملية</th>
                    <th className="p-4 font-bold">التاريخ</th>
                    <th className="p-4 font-bold">الحالة</th>
                    <th className="p-4 font-bold">نهاية الفترة</th>
                    <th className="p-4 font-bold">الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b hover:bg-secondary/20 transition-colors">
                      <td className="p-4 font-mono text-xs text-muted-foreground">{inv.id.split('-')[0].toUpperCase()}</td>
                      <td className="p-4">{format(new Date(inv.created_at), 'PPP', { locale: ar })}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inv.status === 'active' || inv.status === 'trialing' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                        }`}>
                          {inv.status === 'active' ? 'مفعل' : inv.status === 'trialing' ? 'تجريبي' : 'منتهي'}
                        </span>
                      </td>
                      <td className="p-4">{inv.current_period_end ? format(new Date(inv.current_period_end), 'P', { locale: ar }) : '-'}</td>
                      <td className="p-4">
                         <Button variant="ghost" size="sm" className="gap-2 text-primary" disabled>
                           <Download size={14} />
                           إيصال
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
