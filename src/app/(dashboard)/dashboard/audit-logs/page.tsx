'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { adminApi, AdminAuditLog } from '@/lib/api/admin'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { History, User, Activity, Globe, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const res = await adminApi.listAuditLogs()
      setLogs(res)
    } catch (error) {
      console.error('Failed to load audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'user.create':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">إنشاء مستخدم</Badge>
      case 'user.update':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">تعديل بيانات</Badge>
      case 'user.activate':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">تفعيل حساب</Badge>
      case 'user.deactivate':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">تعطيل حساب</Badge>
      case 'user.password_reset':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">إعادة كلمة المرور</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6 text-right" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
            <History className="w-8 h-8 text-primary" />
            سجل النشاطات
          </h1>
          <p className="text-muted-foreground mt-1">تتبع كافة العمليات الحساسة التي تمت في النظام</p>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                آخر العمليات
              </CardTitle>
              <CardDescription>عرض آخر 200 عملية مسجلة في سجل التدقيق</CardDescription>
            </div>
            <Badge variant="outline" className="bg-slate-50">
              {logs.length} سجل
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <Table>
              <TableHeader className="bg-slate-50/80 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="text-right">التوقيت</TableHead>
                  <TableHead className="text-right">المسؤول</TableHead>
                  <TableHead className="text-right">الإجراء</TableHead>
                  <TableHead className="text-right">الهدف</TableHead>
                  <TableHead className="text-right">السبب / التفاصيل</TableHead>
                  <TableHead className="text-right text-center">البيانات</TableHead>
                  <TableHead className="text-right">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell colSpan={7} className="h-16 bg-slate-50/30 rounded-md my-2" />
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                      لا توجد سجلات حالياً
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium whitespace-nowrap text-slate-600">
                        {format(new Date(log.createdAt), 'yyyy/MM/dd HH:mm', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {log.actorName}
                          </span>
                          <span className="text-xs text-muted-foreground">{log.actorEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100 text-slate-600">
                          {log.targetType}:{log.targetId?.slice(0, 8)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-slate-600">
                        {log.reason || <span className="text-slate-300 italic">بدون سبب</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {log.metaJson ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="p-1 hover:bg-slate-100 rounded transition-colors inline-flex">
                                  <Info className="w-4 h-4 text-blue-400 hover:text-blue-600 cursor-help" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs bg-slate-900 text-white p-3 font-mono text-xs rounded-lg shadow-xl border-slate-700">
                                <pre className="whitespace-pre-wrap leading-relaxed text-left" dir="ltr">
                                  {JSON.stringify(JSON.parse(log.metaJson), null, 2)}
                                </pre>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {log.ip || '0.0.0.0'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
