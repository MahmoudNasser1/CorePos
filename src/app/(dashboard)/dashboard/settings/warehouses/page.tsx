"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin"
import { fetchBackendSessionAction } from "@/lib/actions/auth-session.actions"
import { Button } from "@/components/ui/button"
import { Plus, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function WarehousesPage() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const session = await fetchBackendSessionAction()
      if (mounted) setReady(!!session?.user?.id)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["warehouses"],
    enabled: ready,
    queryFn: async () => {
      return await adminApi.listWarehouses()
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">المخازن</h1>
          <p className="text-sm text-muted-foreground">المستودعات المرتبطة بكل فرع.</p>
        </div>
        <Button className="gap-2 self-start sm:self-auto" disabled title="سيتاح إضافة المستودع من لوحة الإدارة قريبًا">
          <Plus className="h-4 w-4" />
          إضافة مستودع
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {!ready || isLoading ? (
          <>
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </>
        ) : warehouses?.length === 0 ? (
          <div className="col-span-full flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground">
            لا توجد مستودعات مسجّلة حاليًا
          </div>
        ) : (
          warehouses?.map((warehouse) => (
            <Card key={warehouse.id} className="flex h-full flex-col border bg-card shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-semibold">{warehouse.name}</CardTitle>
                  <Badge variant={warehouse.isDefault ? "default" : "outline"} className="shrink-0 text-xs font-normal">
                    {warehouse.isDefault ? "افتراضي" : "فرعي"}
                  </Badge>
                </div>
                <CardDescription className="flex items-start gap-2 pt-1 text-sm">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{warehouse.branchName || "—"}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto border-t border-border/60 pt-4">
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  مرجع داخلي: {warehouse.id.slice(0, 8)}…
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
