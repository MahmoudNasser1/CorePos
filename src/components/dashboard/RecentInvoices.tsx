"use client"

import Link from "next/link"
import { Eye, ReceiptText } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RecentInvoicesProps {
  invoices: any[]
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <div className="space-y-4">
      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <p>لا توجد فواتير مؤخرًا</p>
        </div>
      ) : (
        invoices.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm">{inv.invoice_number || 'مسودة'}</span>
                <span className="text-xs text-muted-foreground">
                  {inv.customer_name || 'عميل نقدي'} • {format(new Date(inv.created_at), "p", { locale: ar })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-left">
                <div className="font-black text-sm">{inv.total.toLocaleString()} ج.م</div>
                <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'} className="text-[10px] h-4">
                  {inv.status === 'paid' ? 'مدفوع' : 'آجل'}
                </Badge>
              </div>
              <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                <Link href={`/dashboard/sales/invoices/${inv.id}`}>
                  <Eye className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))
      )}
      
      <Button variant="link" className="w-full text-xs font-bold text-muted-foreground hover:text-primary" asChild>
        <Link href="/dashboard/sales/invoices">عرض كل الفواتير</Link>
      </Button>
    </div>
  )
}
