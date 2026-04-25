"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveProduct } from "@/lib/actions/inventory.actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export type QuickCreatedProduct = {
  id: string
  name: string
  barcode?: string | null
  price1?: number
  cost_price?: number
}

function mapCreatedRow(res: unknown): QuickCreatedProduct | null {
  const r = res as Record<string, unknown> | null
  if (!r || typeof r.id !== "string") return null
  return {
    id: r.id,
    name: String(r.name ?? ""),
    barcode: (r.barcode as string | null) ?? null,
    price1: Number(r.price1 ?? r.price_1 ?? 0),
    cost_price: Number(r.costPrice ?? r.cost_price ?? 0),
  }
}

export function QuickProductDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** يُملأ عند فتح الحوار من نص البحث */
  initialName: string
  onCreated: (product: QuickCreatedProduct) => void
}) {
  const { open, onOpenChange, initialName, onCreated } = props
  const [name, setName] = useState("")
  const [barcode, setBarcode] = useState("")
  const [costPrice, setCostPrice] = useState<string>("0")
  const [salePrice, setSalePrice] = useState<string>("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName((initialName || "").trim())
    setBarcode("")
    setCostPrice("0")
    setSalePrice("")
  }, [open, initialName])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = name.trim()
    if (n.length < 2) {
      toast.error("أدخل اسمًا للصنف (حرفان على الأقل)")
      return
    }
    const cost = parseFloat(costPrice.replace(/,/g, ".")) || 0
    const saleParsed =
      salePrice.trim() === "" ? cost : parseFloat(salePrice.replace(/,/g, ".")) || cost

    setSaving(true)
    try {
      const res = await saveProduct({
        name: n,
        barcode: barcode.trim() || undefined,
        cost_price: cost,
        price1: saleParsed,
        price2: 0,
        price3: 0,
        min_qty: 0,
      })
      const row = mapCreatedRow(res)
      if (!row) {
        toast.error("تم الحفظ لكن تعذر قراءة بيانات المنتج الجديد")
        return
      }
      toast.success("تم إنشاء الصنف")
      onCreated(row)
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error("تعذّر حفظ المنتج — تحقق من الاتصال أو البيانات")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة صنف جديد</DialogTitle>
          <DialogDescription className="text-start text-sm leading-relaxed">
            يُنشأ المنتج في المخزون ثم يُضاف كبند في الفاتورة. يمكنك لاحقًا تعديل التفاصيل من صفحة المنتجات.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qp-name">اسم الصنف</Label>
            <Input
              id="qp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: شاحن USB"
              className="h-10"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qp-barcode">الباركود (اختياري)</Label>
            <Input
              id="qp-barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="للمسح الضوئي لاحقًا"
              className="h-10 font-mono text-start"
              dir="ltr"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="qp-cost">سعر التكلفة (شراء)</Label>
              <Input
                id="qp-cost"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="h-10 tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qp-sale">سعر البيع (قطاعي)</Label>
              <Input
                id="qp-sale"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="افتراضي = التكلفة"
                className="h-10 tabular-nums"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />
                  جاري الحفظ…
                </>
              ) : (
                "حفظ وإضافة للفاتورة"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
