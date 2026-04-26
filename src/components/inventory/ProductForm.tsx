"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { saveProduct } from "@/lib/actions/inventory.actions"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { generateEAN13 } from "@/lib/utils"
import { isBarcodeUnique } from "@/lib/actions/inventory.actions"
import { AlertCircle, Barcode, Wand2, LayoutGrid, DollarSign, Package, ImageIcon } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "الاسم مطلوب"),
  barcode: z.string().optional(),
  category_id: z.string().optional(),
  unit_id: z.string().optional(),
  cost_price: z.coerce.number().min(0).default(0),
  price1: z.coerce.number().min(0).default(0),
  price2: z.coerce.number().min(0).default(0),
  price3: z.coerce.number().min(0).default(0),
  min_qty: z.coerce.number().min(0).default(0),
  initial_stock: z.coerce.number().min(0).optional(),
  image_url: z
    .string()
    .optional()
    .refine(
      (v) => {
        const t = (v ?? "").trim()
        return t === "" || /^https?:\/\/.+/i.test(t)
      },
      { message: "أدخل رابطًا يبدأ بـ https:// أو http://" },
    ),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: any
  categories: any[]
  units: any[]
}

export function ProductForm({ initialData, categories, units }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      barcode: "",
      cost_price: 0,
      price1: 0,
      price2: 0,
      price3: 0,
      min_qty: 0,
      initial_stock: 0,
      image_url: "",
    },
  })

  const [barcodeStatus, setBarcodeStatus] = useState<'idle' | 'checking' | 'exists' | 'unique'>('idle')
  const costPrice = form.watch("cost_price")
  const salesPrice = form.watch("price1")
  const watchedBarcode = form.watch("barcode")
  const watchedImageUrl = form.watch("image_url")
  const debouncedBarcode = useDebounce(watchedBarcode, 500)

  // Calculate profit margin
  const profit = salesPrice - costPrice
  const profitMargin = costPrice > 0 ? (profit / costPrice) * 100 : 0

  // Check barcode uniqueness
  useEffect(() => {
    async function checkBarcode() {
      if (!debouncedBarcode || debouncedBarcode === initialData?.barcode) {
        setBarcodeStatus('idle')
        return
      }
      
      setBarcodeStatus('checking')
      const isUnique = await isBarcodeUnique(debouncedBarcode, initialData?.id)
      setBarcodeStatus(isUnique ? 'unique' : 'exists')
      
      if (!isUnique) {
        form.setError("barcode", { message: "هذا الباركود مستخدم بالفعل لمنتج آخر" })
      } else {
        form.clearErrors("barcode")
      }
    }
    checkBarcode()
  }, [debouncedBarcode, initialData?.id, initialData?.barcode, form])

  async function onSubmit(data: ProductFormValues) {
    try {
      setLoading(true)
      await saveProduct(data)
      toast.success("تم حفظ المنتج بنجاح")
      router.push("/dashboard/inventory/products")
      router.refresh()
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-8 pb-28">
        <h2 className="text-3xl font-bold tracking-tight">
          {initialData ? "تعديل منتج" : "إضافة منتج جديد"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">البيانات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المنتج</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: آيفون 15 برو" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Barcode className="w-4 h-4" />
                      الباركود
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input 
                            placeholder="امسح أو أدخل الباركود" 
                            {...field} 
                            className={`flex-1 ${barcodeStatus === 'exists' ? 'border-destructive' : barcodeStatus === 'unique' ? 'border-success text-success' : ''}`} 
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            title="توليد باركود آلي"
                            onClick={() => form.setValue("barcode", generateEAN13())}
                          >
                            <Wand2 className="h-4 w-4 text-primary" />
                          </Button>
                        </div>
                        {barcodeStatus === 'checking' && <p className="text-xs text-muted-foreground">جاري التحقق من الباركود...</p>}
                        {barcodeStatus === 'exists' && (
                          <div className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="w-3 h-3" />
                            <span>هذا الباركود مكرر!</span>
                          </div>
                        )}
                        {barcodeStatus === 'unique' && (
                          <p className="text-xs text-success">هذا الباركود متاح</p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" />
                      الفئة
                    </FormLabel>
                    <select 
                      {...field}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">عام</option>
                      {(Array.isArray(categories) ? categories : []).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                       <Package className="me-1 h-4 w-4" />
                        وحدة القياس
                    </FormLabel>
                    <select 
                      {...field}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">اختر الوحدة</option>
                      {(Array.isArray(units) ? units : []).map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" aria-hidden />
                      صورة المنتج (رابط)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        inputMode="url"
                        dir="ltr"
                        className="text-start font-mono text-sm"
                        placeholder="https://…"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      لا يوجد رفع ملف من الجهاز حاليًا: الصق رابط صورة عامة (مثل تخزين سحابي أو موقعك). تظهر الصورة في شبكة نقطة البيع عند توفر الرابط.
                    </p>
                    {watchedImageUrl?.trim() && /^https?:\/\/.+/i.test(watchedImageUrl.trim()) ? (
                      <div className="mt-2 overflow-hidden rounded-md border bg-muted/30 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element -- user-supplied arbitrary URL */}
                        <img
                          src={watchedImageUrl.trim()}
                          alt=""
                          className="mx-auto max-h-36 w-auto max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Stock Info */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Package className="w-5 h-5 text-success" />
              <CardTitle className="text-lg">المخزون والحدود</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!initialData && (
                <FormField
                  control={form.control}
                  name="initial_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الكمية الافتتاحية</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="decimal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="min_qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حد الطلب الأدنى</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="decimal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing Info */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2">
              <DollarSign className="w-5 h-5 text-warning" />
              <CardTitle className="text-lg">بيانات الأسعار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="cost_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سعر التكلفة</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="decimal" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سعر البيع (قطاعي)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          {...field}
                          className="border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سعر البيع (جملة)</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="decimal" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سعر خاص</FormLabel>
                      <FormControl>
                        <Input type="number" inputMode="decimal" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Profit Helper UI */}
              <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">مستشار التسعير الذكي</p>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-success">{profit.toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground">صافي الربح المتوقع</span>
                      </div>
                      <Separator orientation="vertical" className="h-10 mx-2" />
                      <div className="flex flex-col">
                        <span className={`text-2xl font-bold ${profitMargin >= 20 ? 'text-success' : profitMargin > 0 ? 'text-warning' : 'text-destructive'}`}>
                          {profitMargin.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">هامش الربح</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                     <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          const suggested = costPrice * 1.25 // Suggesting 25% profit
                          form.setValue("price1", Number(suggested.toFixed(2)))
                        }}
                     >
                        اقتراح ربح 25%
                     </Button>
                     <Button 
                        type="button" 
                        variant="secondary" 
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          const suggested = costPrice * 1.50 // Suggesting 50% profit
                          form.setValue("price1", Number(suggested.toFixed(2)))
                        }}
                     >
                        اقتراح ربح 50%
                     </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="sticky bottom-0 z-30 flex flex-col gap-3 border-t bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" disabled={loading} aria-busy={loading} className="min-w-[10rem]">
            {loading ? "جاري الحفظ…" : "حفظ المنتج"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
