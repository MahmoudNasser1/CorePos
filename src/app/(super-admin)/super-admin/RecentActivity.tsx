"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { History, UserPlus, CreditCard, Building, AlertTriangle } from "lucide-react"

interface RecentActivityProps {
  activities: any[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'user.created': return <UserPlus className="h-4 w-4 text-blue-500" />
      case 'subscription.updated': return <CreditCard className="h-4 w-4 text-emerald-500" />
      case 'company.created': return <Building className="h-4 w-4 text-indigo-500" />
      default: return <History className="h-4 w-4 text-slate-500" />
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'user.created': 'مستخدم جديد',
      'subscription.updated': 'تحديث اشتراك',
      'company.created': 'شركة جديدة',
      'system.alert': 'تنبيه نظام',
    }
    return labels[action] || action
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-500" />
          آخر النشاطات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            لا توجد نشاطات مؤخراً
          </div>
        ) : (
          activities.map((activity, idx) => (
            <div key={activity.id} className="relative flex gap-4 pb-6 last:pb-0">
              {idx !== activities.length - 1 && (
                <div className="absolute top-8 right-4 bottom-0 w-px bg-slate-100" />
              )}
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 border">
                {getActionIcon(activity.action)}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{getActionLabel(activity.action)}</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-normal bg-slate-50">
                    {activity.id.slice(0, 8)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {typeof activity.details === 'string' ? activity.details : JSON.stringify(activity.details)}
                </p>
                <span className="text-xs text-muted-foreground/60 mt-1">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: ar })}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
