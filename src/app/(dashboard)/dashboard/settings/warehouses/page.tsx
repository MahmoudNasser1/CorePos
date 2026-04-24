"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { SettingsNav } from "@/components/settings/SettingsNav"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Package2, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function WarehousesPage() {
  const queryClient = useQueryClient()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const supabase = createClient()

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("warehouses").select("*, branches(name)").order("created_at")
      if (error) throw error
      return data as any[]
    }
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-black text-right">الإعدادات الإدارية</h1>
          <p className="text-muted-foreground font-bold text-right">إدارة المستودعات والمخازن التابعة للفروع</p>
        </div>
        <div className="flex justify-end">
          <SettingsNav />
        </div>
      </div>

      <div className="flex items-center justify-between flex-row-reverse">
        <h2 className="text-xl font-black">إدارة المستودعات</h2>
        <Button className="font-black gap-2" disabled>
          <Plus className="w-4 h-4" />
          إضافة مستودع جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
        {isLoading ? (
          [1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-secondary/20" />)
        ) : warehouses?.length === 0 ? (
          <div className="col-span-full h-40 flex items-center justify-center border-2 border-dashed rounded-3xl text-muted-foreground font-bold">
            لا توجد مستودعات حالياً
          </div>
        ) : warehouses?.map((warehouse) => (
          <Card key={warehouse.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between flex-row-reverse">
                <CardTitle className="text-lg font-black">{warehouse.name}</CardTitle>
                <Badge variant={warehouse.is_default ? "default" : "outline"} className="font-black text-[10px]">
                  {warehouse.is_default ? "افتراضي" : "فرعي"}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 font-bold justify-start">
                <MapPin className="w-3 h-3" />
                {warehouse.branches?.name || "فرع غير غير معروف"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 pt-4 border-t border-dashed flex justify-between items-center flex-row-reverse">
                <span className="text-[10px] font-black uppercase text-secondary-foreground/50 tracking-widest">
                  ID: {warehouse.id.slice(0, 8)}
                </span>
                <Badge variant="outline" className="text-[10px] h-5 font-black">نشط</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
