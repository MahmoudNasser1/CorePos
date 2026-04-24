"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  User, 
  Store,
  Calculator,
  Calendar as CalendarIcon
} from "lucide-react"
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ProductSearchInput } from "@/components/products/ProductSearchInput"
import { getInventoryProducts } from "@/lib/actions/inventory.actions"
import { getCustomers, getSuppliers } from "@/lib/actions/customers.actions"
import { createSaleInvoice, createPurchaseInvoice, createQuotation, createSaleReturn, createPurchaseOrder, createPurchaseReturn } from "@/lib/actions/invoices"
import { getTreasuries } from "@/lib/actions/payments"
import { getCompanySettings } from "@/lib/actions/settings.actions"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { getInvoiceById } from "@/lib/actions/invoices"

const invoiceSchema = z.object({
  date: z.string(),
  customer_id: z.string().optional(),
  supplier_id: z.string().optional(),
  warehouse_id: z.string(),
  treasury_id: z.string().optional(),
  reference_id: z.string().optional(),
  notes: z.string().optional(),
  subtotal: z.number(),
  discount_amount: z.number().default(0),
  tax_rate: z.number().default(0),
  tax_amount: z.number().default(0),
  total: z.number(),
  paid: z.number().default(0),
  remaining: z.number().default(0),
  items: z.array(z.object({
    product_id: z.string(),
    name: z.string(),
    qty: z.number().min(0.01),
    unit_price: z.number(),
    cost_price: z.number().optional(),
    total_line: z.number(),
    discount_amount: z.number().default(0),
  })).min(1, "يجب إضافة صنف واحد على الأقل")
})

interface InvoiceFormProps {
  type: 'sale' | 'purchase' | 'quotation' | 'sale_return' | 'purchase_order' | 'purchase_return'
  initialData?: any
}

export function InvoiceForm(props: InvoiceFormProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground italic">جاري تحميل النموذج...</div>}>
      <InvoiceFormContent {...props} />
    </Suspense>
  )
}

function InvoiceFormContent({ type, initialData }: InvoiceFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referenceId = searchParams.get('reference_id')

  const [products, setProducts] = useState<any[]>([])
  const [parties, setParties] = useState<any[]>([])
  const [treasuries, setTreasuries] = useState<any[]>([])
  const [partyOpen, setPartyOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      warehouse_id: "00000000-0000-0000-0000-000000000000", 
      items: [],
      subtotal: 0,
      discount_amount: 0,
      tax_rate: 0,
      tax_amount: 0,
      total: 0,
      paid: 0,
      remaining: 0
    }
  })

  const { fields, append, remove, update, replace } = useFieldArray({
    control: form.control,
    name: "items"
  })

  useEffect(() => {
    const fetchData = async () => {
      const [prods, partyList, treasuryList, companySettings] = await Promise.all([
        getInventoryProducts(),
        (type === 'sale' || type === 'quotation' || type === 'sale_return') ? getCustomers() : getSuppliers(),
        getTreasuries(),
        getCompanySettings()
      ])
      setProducts(prods as any[])
      setParties(partyList as any[])
      setTreasuries(treasuryList as any[])
      
      if (treasuryList.length > 0) {
        form.setValue("treasury_id", treasuryList[0].id)
      }

      // Set default tax rate from settings if this is a NEW invoice
      if (companySettings && !initialData && !referenceId) {
        const vatRate = Number((companySettings as any).vatRate ?? (companySettings as any).vat_rate) || 0
        form.setValue("tax_rate", vatRate)
      }

      // If reference_id is provided (for returns), fetch original invoice
      if (referenceId && (type === 'sale_return' || type === 'purchase_return')) {
        const original = await getInvoiceById(referenceId) as any
        if (original) {
          if (type === 'sale_return') form.setValue("customer_id", original.customer_id)
          else form.setValue("supplier_id", original.supplier_id)
          
          form.setValue("reference_id", original.id)
          form.setValue("notes", `مرتجع للفاتورة رقم ${original.invoice_number}`)
          
          const items = original.invoice_items.map((item: any) => ({
            product_id: item.product_id,
            name: item.products?.name || "صنف مجهول",
            qty: item.qty,
            unit_price: item.unit_price,
            total_line: item.total_line,
            discount_amount: item.discount_amount
          }))
          replace(items)
        }
      }
    }
    fetchData()
  }, [type, form, referenceId, replace])

  const watchedItems = form.watch("items")
  const watchedDiscount = form.watch("discount_amount")
  const watchedTaxRate = form.watch("tax_rate")
  const watchedPaid = form.watch("paid")

  useEffect(() => {
    const subtotal = watchedItems.reduce((acc, item) => acc + (item.total_line || 0), 0)
    const taxAmount = (subtotal - watchedDiscount) * (watchedTaxRate / 100)
    const total = subtotal - watchedDiscount + taxAmount
    const remaining = total - watchedPaid

    form.setValue("subtotal", subtotal)
    form.setValue("tax_amount", taxAmount)
    form.setValue("total", total)
    form.setValue("remaining", remaining > 0 ? remaining : 0)
  }, [watchedItems, watchedDiscount, watchedTaxRate, watchedPaid, form])

  const handleAddProduct = (product: any) => {
    const existingIndex = fields.findIndex(f => f.product_id === product.id)
    if (existingIndex > -1) {
      const item = fields[existingIndex]
      const newQty = item.qty + 1
      update(existingIndex, {
        ...item,
        qty: newQty,
        total_line: newQty * item.unit_price
      })
    } else {
      append({
        product_id: product.id,
        name: product.name,
        qty: 1,
        unit_price: (type === 'sale' || type === 'quotation') ? product.price1 : product.cost_price,
        cost_price: product.cost_price,
        total_line: (type === 'sale' || type === 'quotation') ? product.price1 : product.cost_price,
        discount_amount: 0
      })
    }
  }

  const onSubmit = async (values: z.infer<typeof invoiceSchema>) => {
    setLoading(true)
    try {
      let res;
      if (type === 'sale') {
        res = await createSaleInvoice(values, values.items, [
          { method: values.paid >= values.total ? 'cash' : 'deferred', amount: values.paid, treasury_id: values.treasury_id }
        ])
      } else if (type === 'purchase') {
        res = await createPurchaseInvoice(values, values.items, [
          { method: values.paid >= values.total ? 'cash' : 'deferred', amount: values.paid, treasury_id: values.treasury_id }
        ])
      } else if (type === 'quotation') {
        res = await createQuotation({ invoice: values, items: values.items })
      } else if (type === 'sale_return') {
        res = await createSaleReturn({ invoice: values, items: values.items, treasury_id: values.treasury_id })
      } else if (type === 'purchase_order') {
        res = await createPurchaseOrder({ invoice: values, items: values.items })
      } else if (type === 'purchase_return') {
        res = await createPurchaseReturn({ invoice: values, items: values.items, treasury_id: values.treasury_id })
      }
      
      if (res?.success) {
        toast.success("تم تنفيذ العملية بنجاح")
        const redirectType = type === 'quotation' ? 'sales/quotations' : 
                          type === 'purchase_order' ? 'purchases/orders' : 
                          (type === 'sale_return' || type === 'sale') ? 'sales/invoices' : 
                          'purchases/invoices';
        router.push(`/dashboard/${redirectType}/${(res as any).id || ''}`)
      } else {
        throw new Error((res as any)?.error || "حدث خطأ غير معروف")
      }
    } catch (error: any) {
      toast.error("خطأ: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-1">
      <div className="lg:col-span-3 space-y-6">
        <Card className="shadow-sm border-none bg-white/80 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              {type === 'sale' && "فاتورة مبيعات جديدة"}
              {type === 'purchase' && "فاتورة مشتريات جديدة"}
              {type === 'quotation' && "عرض سعر جديد"}
              {type === 'purchase_order' && "أمر شراء جديد"}
              {type === 'purchase_return' && "مرتجع مشتريات جديد"}
              {type === 'sale_return' && "مرتجع مبيعات جديد"}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => router.back()}>إلغاء</Button>
              <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                {loading ? "جاري الحفظ..." : "حفظ"}
                <Save className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50/50">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{(type === 'purchase' || type === 'purchase_order' || type === 'purchase_return') ? "المورد" : "العميل"}</Label>
                <Popover open={partyOpen} onOpenChange={setPartyOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-10 border-gray-200">
                      {form.watch(type === 'purchase' || type === 'purchase_order' || type === 'purchase_return' ? "supplier_id" : "customer_id") 
                        ? parties.find(p => p.id === form.watch(type === 'purchase' || type === 'purchase_order' || type === 'purchase_return' ? "supplier_id" : "customer_id"))?.name 
                        : `اختر ${(type === 'purchase' || type === 'purchase_order' || type === 'purchase_return') ? "مورد" : "عميل"}...`}
                      <User className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 pointer-events-auto">
                    <Command dir="rtl">
                      <CommandInput placeholder={`بحث عن ${(type === 'sale' || type === 'quotation' || type === 'sale_return') ? "عميل" : "مورد"}...`} />
                      <CommandList>
                        <CommandEmpty>لا يوجد نتائج.</CommandEmpty>
                        <CommandGroup>
                          {parties.map((p) => (
                            <CommandItem
                              key={p.id}
                              onSelect={() => {
                                form.setValue(type === 'purchase' ? "supplier_id" : "customer_id", p.id)
                                setPartyOpen(false)
                              }}
                            >
                              {p.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">التاريخ</Label>
                <Input type="date" {...form.register("date")} className="h-10 border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">الخزينة</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...form.register("treasury_id")}
                >
                  {treasuries.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">المخزن</Label>
                <div className="relative group">
                   <Input value="المخزن الرئيسي" disabled className="h-10 bg-gray-100 pr-10" />
                   <Store className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Product Search */}
            <ProductSearchInput
              products={products}
              onSelect={handleAddProduct}
              saleMode={type === 'sale' || type === 'quotation' || type === 'sale_return'}
            />

            {/* Items Table */}
            <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <Table dir="rtl">
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>الصنف</TableHead>
                    <TableHead className="w-24">الكمية</TableHead>
                    <TableHead className="w-32">السعر</TableHead>
                    <TableHead className="w-32 text-left">الإجمالي</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id} className="hover:bg-gray-50/30 transition-colors">
                      <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{field.name}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...form.register(`items.${index}.qty`, { valueAsNumber: true })}
                          className="h-8 text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...form.register(`items.${index}.unit_price`, { valueAsNumber: true })}
                          className="h-8 text-center"
                        />
                      </TableCell>
                      <TableCell className="text-left font-bold text-gray-700">
                        {form.watch(`items.${index}.qty`) * form.watch(`items.${index}.unit_price`)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-400 hover:text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {fields.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                        لا يوجد أصناف مضافة حالياً. استخدم محرك البحث أعلاه لإضافة منتجات.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Totals Sidebar */}
      <div className="space-y-6">
        <Card className="shadow-sm border-none bg-white/90 backdrop-blur-md sticky top-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-bold flex items-center gap-2">
              <Calculator className="h-4 w-4" /> ملخص الفاتورة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>المجموع</span>
                <span>{form.watch("subtotal")} ج.م</span>
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-xs">الخصم الإجمالي</Label>
                <Input 
                  type="number" 
                  {...form.register("discount_amount", { valueAsNumber: true })} 
                  className="h-8 text-left font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-xs">الضريبة (%)</Label>
                <Input 
                  type="number" 
                  {...form.register("tax_rate", { valueAsNumber: true })} 
                  className="h-8 text-left font-mono"
                />
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t text-primary">
                <span>الإجمالي</span>
                <span>{form.watch("total")} ج.م</span>
              </div>
            </div>

            {type !== 'quotation' && (
              <div className="space-y-3 pt-4 border-t border-dashed">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-green-600">
                    {type === 'sale_return' ? "المبلغ المسترد نقداً" : "المدفوع نقداً / بطاقة"}
                  </Label>
                  <Input 
                    type="number" 
                    {...form.register("paid", { valueAsNumber: true })} 
                    className="h-10 text-lg font-bold text-green-600 text-left bg-green-50/30 border-green-100"
                  />
                </div>
                <div className="flex justify-between font-bold text-red-500 pt-1">
                  <span className="text-sm">
                    {type === 'sale_return' ? "خصم من المديونية" : "المتبقي (آجل)"}
                  </span>
                  <span>{form.watch("remaining")} ج.م</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
             <Button className="w-full h-11 text-lg font-bold" onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                {loading ? "جاري المعالجة..." : "تأكيد وحفظ"}
                <Save className="mr-2 h-5 w-5" />
             </Button>
             <Button variant="outline" className="w-full gap-2 h-10 border-primary text-primary hover:bg-primary/5">
                <Printer className="h-4 w-4" /> حفظ وطباعة
             </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
