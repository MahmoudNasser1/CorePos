"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, CheckCircle2, XCircle, Landmark, Banknote, UserRound, MoreVertical } from "lucide-react"
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { createTreasury, updateTreasury } from "@/lib/actions/settings.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function TreasuryList({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingTreasury, setEditingTreasury] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    type: "cash",
    is_default: false,
    is_active: true
  })

  async function handleSubmit() {
    setLoading(true)
    try {
      if (editingTreasury) {
        await updateTreasury(editingTreasury.id, formData)
        toast.success("تم تحديث الخزينة بنجاح")
      } else {
        await createTreasury(formData)
        toast.success("تم إضافة الخزينة بنجاح")
      }
      setOpen(false)
      setEditingTreasury(null)
      setFormData({ name: "", type: "cash", is_default: false, is_active: true })
      router.refresh()
    } catch (error: any) {
      toast.error("خطأ: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Landmark className="w-4 h-4 text-blue-500" />
      case 'cash': return <Banknote className="w-4 h-4 text-green-500" />
      default: return <UserRound className="w-4 h-4 text-orange-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bank': return 'حساب بنكي'
      case 'cash': return 'خزينة نقدية'
      default: return 'عهدة موظف'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val)
          if (!val) {
            setEditingTreasury(null)
            setFormData({ name: "", type: "cash", is_default: false, is_active: true })
          }
        }}>
          <DialogTrigger asChild>
            <Button className="font-black gap-2">
              <Plus className="w-5 h-5" /> إضافة مورد مالي
            </Button>
          </DialogTrigger>
          <DialogContent className="font-cairo">
            <DialogHeader>
              <DialogTitle className="font-black text-xl">
                {editingTreasury ? "تعديل بيانات الخزينة" : "إضافة مورد مالي جديد"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-bold">اسم الخزينة / الحساب</Label>
                <Input 
                  placeholder="مثال: الخزينة الرئيسية، حساب البنك الأهلي..." 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">نوع المورد</Label>
                <Select 
                  onValueChange={(val) => setFormData({ ...formData, type: val })} 
                  value={formData.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent className="font-cairo">
                    <SelectItem value="cash">خزينة نقدية (كاش)</SelectItem>
                    <SelectItem value="bank">حساب بنكي / فيزا</SelectItem>
                    <SelectItem value="employee">عهدة موظف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_default" className="font-bold">تعيين كخزينة افتراضية للفرع</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={loading} className="font-black">
                {loading ? "جاري الحفظ..." : "حفظ المورد المالي"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table dir="rtl">
            <TableHeader className="bg-secondary/10">
              <TableRow>
                <TableHead className="font-black text-primary">المورد المالي</TableHead>
                <TableHead className="font-black text-primary">النوع</TableHead>
                <TableHead className="font-black text-primary">الرصيد الحالي</TableHead>
                <TableHead className="font-black text-primary">الحالة</TableHead>
                <TableHead className="font-black text-primary text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.map((t) => (
                <TableRow key={t.id} className="hover:bg-primary/5 transition-colors group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-md flex items-center gap-2">
                        {t.name}
                        {t.is_default && <Badge variant="default" className="text-[10px] h-4 px-1">الافتراضية</Badge>}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{t.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {getTypeIcon(t.type)}
                      {getTypeLabel(t.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-black text-lg tracking-tight text-primary">
                      {t.balance?.toLocaleString() || 0} <small className="text-[10px] text-muted-foreground mr-1">ج.م</small>
                    </span>
                  </TableCell>
                  <TableCell>
                    {t.is_active ? (
                      <div className="flex items-center gap-1 text-green-600 font-bold text-xs">
                        <CheckCircle2 className="w-3 h-3" /> نشط
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600 font-bold text-xs">
                        <XCircle className="w-3 h-3" /> معطل
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-left">
                     <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setEditingTreasury(t)
                        setFormData({ 
                          name: t.name, 
                          type: t.type, 
                          is_default: t.is_default, 
                          is_active: t.is_active 
                        })
                        setOpen(true)
                      }}
                    >
                       <Edit2 className="w-4 h-4" />
                     </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
