"use client"

import { useState } from "react"
import { useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin"
import { getBackendSession } from "@/lib/api/user"
import { SettingsNav } from "@/components/settings/SettingsNav"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, MapPin, Phone } from "lucide-react"
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

export default function BranchesPage() {
  const queryClient = useQueryClient()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      if (!isMounted) return
      const session = await getBackendSession()
      setReady(!!session?.user?.id)
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches"],
    enabled: ready,
    queryFn: async () => {
      return await adminApi.listBranches()
    }
  })

  const addBranch = useMutation({
    mutationFn: async (formData: any) => {
      await adminApi.createBranch({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
      setIsAddOpen(false)
      toast.success("تم إضافة الفرع بنجاح")
    },
    onError: (err) => toast.error(`خطأ: ${err.message}`)
  })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-black">الإعدادات الإدارية</h1>
          <p className="text-muted-foreground font-bold">إدارة البنية التحتية لمنظومة CorePOS الخاصة بك</p>
        </div>
        <SettingsNav />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">إدارة الفروع</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="font-black gap-2">
              <Plus className="w-4 h-4" />
              إضافة فرع جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="font-cairo">
            <DialogHeader>
              <DialogTitle className="font-black">إضافة فرع جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e: any) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              addBranch.mutate(Object.fromEntries(formData))
            }} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold">اسم الفرع</Label>
                <Input name="name" placeholder="مثال: فرع القاهرة - وسط البلد" required />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">العنوان</Label>
                <Input name="address" placeholder="العنوان بالتفصيل" required />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">رقم الهاتف</Label>
                <Input name="phone" placeholder="01xxxxxxxxx" required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addBranch.isPending} className="w-full font-black">
                  {addBranch.isPending ? "جاري الحفظ..." : "حفظ الفرع"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-secondary/20" />)
        ) : branches?.map((branch) => (
          <Card key={branch.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-black">{branch.name}</CardTitle>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2 font-bold">
                <MapPin className="w-3 h-3" />
                {branch.address}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
                <Phone className="w-3 h-3" />
                {branch.phone}
              </div>
              <div className="mt-4 pt-4 border-t border-dashed flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-secondary-foreground/50 tracking-widest">
                  Branch ID: {branch.id.slice(0, 8)}
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

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
