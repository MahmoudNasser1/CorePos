"use server"

import { getAuditLogs } from "@/lib/actions/settings.actions"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { User, Activity, Clock, Database, Globe } from "lucide-react"

type AuditLogRow = {
  id: string
  action: string
  entity: string
  ip_address?: string | null
  created_at: string
  profiles?: { full_name?: string | null } | null
}

export default async function AuditLogsPage() {
  const logs = (await getAuditLogs({ limit: 50 })) as AuditLogRow[]

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-green-100 text-green-700'
      case 'update': return 'bg-blue-100 text-blue-700'
      case 'delete': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getActionLabel = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'إضافة'
      case 'update': return 'تعديل'
      case 'delete': return 'حذف'
      default: return action
    }
  }

  const getEntityLabel = (entity: string) => {
    const map: Record<string, string> = {
      'sale_invoices': 'فاتورة مبيعات',
      'purchase_invoices': 'فاتورة مشتريات',
      'products': 'منتج',
      'customers': 'عميل',
      'suppliers': 'مورد',
      'treasuries': 'خزينة',
      'expenses': 'مصروف',
      'inventory_transactions': 'حركة مخزون'
    }
    return map[entity] || entity
  }

  return (
    <div className="space-y-6 pt-2 font-cairo">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" /> سجل النشاطات النظام
        </h1>
        <p className="text-muted-foreground font-bold">متابعة كافة العمليات التي تمت في النظام لضمان الأمان والشفافية</p>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-secondary/10 border-b">
          <CardTitle className="text-lg font-black italic">Recent Activities Log</CardTitle>
          <CardDescription className="font-bold underline decoration-primary/30 underline-offset-4">آخر 50 عملية تمت على النظام</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table dir="rtl">
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-black text-primary w-[200px]">المستخدم</TableHead>
                <TableHead className="font-black text-primary">العملية</TableHead>
                <TableHead className="font-black text-primary">الكيان المتأثر</TableHead>
                <TableHead className="font-black text-primary">العنوان الرقمي IP</TableHead>
                <TableHead className="font-black text-primary text-left">الوقت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-primary/5 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{log.profiles?.full_name || "نظام آلي"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-black tracking-widest ${getActionColor(log.action)} border-none shadow-sm px-3`}>
                      {getActionLabel(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground font-bold">
                      <Database className="w-4 h-4" />
                      {getEntityLabel(log.entity)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {log.ip_address || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center justify-end gap-2 text-xs font-black text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(log.created_at), "yyyy-MM-dd HH:mm", { locale: ar })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                       <Activity className="w-12 h-12 opacity-20" />
                       <p className="font-bold italic">لا يوجد سجلات نشاط حالياً</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
