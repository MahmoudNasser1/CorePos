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
import { Plus, Edit2, CheckCircle2, XCircle, Landmark, Banknote, UserRound } from "lucide-react"
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
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"

function normalizeTreasuryRow(raw: Record<string, unknown>) {
  const r = raw as Record<string, any>
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    balance: Number(r.balance ?? 0),
    branch_id: r.branch_id ?? r.branchId ?? null,
    type: (r.type as string) || "cash",
    is_default: Boolean(r.is_default ?? r.isDefault),
    is_active: r.is_active !== false && r.isActive !== false,
  }
}

export function TreasuryList({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingTreasury, setEditingTreasury] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const rows = Array.isArray(initialData) ? initialData.map((x) => normalizeTreasuryRow(x)) : []

  const [formData, setFormData] = useState<{
    name: string
    type: string
    is_default: boolean
    is_active: boolean
  }>({
    name: "",
    type: "cash",
    is_default: false,
    is_active: true,
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
      case "bank":
        return <Landmark className="h-4 w-4 text-muted-foreground" aria-hidden />
      case "cash":
        return <Banknote className="h-4 w-4 text-muted-foreground" aria-hidden />
      default:
        return <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden />
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
            <Button type="button" className="gap-2 font-black">
              <Plus className="h-5 w-5" aria-hidden />
              إضافة خزينة
            </Button>
          </DialogTrigger>
          <DialogContent className="font-cairo">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">
                {editingTreasury ? "تعديل بيانات الخزينة" : "إضافة خزينة جديدة"}
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
                <Label className="font-bold">نوع الخزينة</Label>
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
              <Button type="button" onClick={handleSubmit} disabled={loading} className="font-black">
                {loading ? "جاري الحفظ…" : "حفظ"}
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
                <TableHead className="font-black text-primary">الخزينة / الحساب</TableHead>
                <TableHead className="font-black text-primary">النوع</TableHead>
                <TableHead className="font-black text-primary">الرصيد الحالي</TableHead>
                <TableHead className="font-black text-primary">الحالة</TableHead>
                <TableHead className="text-end font-black text-primary">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                    لا توجد خزائن مسجّلة. استخدم «إضافة خزينة» أو أكمل الإعداد من شاشة الشركة.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((t) => (
                <TableRow key={t.id} className="hover:bg-primary/5 transition-colors group">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-base font-black">
                        {t.name}
                        {t.is_default && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            الافتراضية
                          </Badge>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {getTypeIcon(t.type)}
                      {getTypeLabel(t.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-2xl font-bold tabular-nums text-primary">
                      <CurrencyDisplay amount={Number(t.balance) || 0} />
                    </div>
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
                  <TableCell className="text-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="تعديل الخزينة"
                      onClick={() => {
                        setEditingTreasury(t)
                        setFormData({
                          name: t.name,
                          type: t.type || "cash",
                          is_default: Boolean(t.is_default),
                          is_active: t.is_active !== false,
                        })
                        setOpen(true)
                      }}
                    >
                       <Edit2 className="w-4 h-4" />
                     </Button>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
