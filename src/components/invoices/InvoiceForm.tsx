"use client"

import { useState, useEffect, useMemo, Suspense, useCallback, useRef } from "react"
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form"
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
  Calendar as CalendarIcon,
  PackagePlus,
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
import { cn, formatCurrency } from "@/lib/utils"
import { ProductSearchInput } from "@/components/products/ProductSearchInput"
import { QuickProductDialog } from "@/components/invoices/QuickProductDialog"
import { getInventoryProducts } from "@/lib/actions/inventory.actions"
import { getCustomers, getSuppliers } from "@/lib/actions/customers.actions"
import { createSaleInvoice, createPurchaseInvoice, createQuotation, createSaleReturn, createPurchaseOrder, createPurchaseReturn } from "@/lib/actions/invoices"
import { getOperationReasons, type OperationReasonRow } from "@/lib/actions/finance-variables.actions"
import { getTreasuries } from "@/lib/actions/payments"
import { getCompanyProfile, getWarehouses } from "@/lib/actions/settings.actions"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { getInvoiceById } from "@/lib/actions/invoices"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const invoiceSchemaBase = z.object({
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
  items: z
    .array(
      z.object({
        product_id: z.string(),
        name: z.string(),
        qty: z.number().min(0.01, "الكمية يجب أن تكون أكبر من صفر"),
        unit_price: z.number(),
        cost_price: z.number().optional(),
        total_line: z.number(),
        discount_amount: z.number().default(0),
      }),
    )
    .min(1, "أضف بندًا واحدًا على الأقل"),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchemaBase>

export type InvoiceFormType =
  | "sale"
  | "purchase"
  | "quotation"
  | "sale_return"
  | "purchase_order"
  | "purchase_return"

interface InvoiceFormProps {
  type: InvoiceFormType
  initialData?: any
}

function createInvoiceSchema(type: InvoiceFormType) {
  return invoiceSchemaBase.superRefine((data, ctx) => {
    if (type === "purchase" || type === "purchase_order" || type === "purchase_return") {
      const sid = data.supplier_id?.trim()
      if (!sid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "اختر المورد أولًا",
          path: ["supplier_id"],
        })
      }
    }
  })
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
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [partyOpen, setPartyOpen] = useState(false)
  const [productPickerOpen, setProductPickerOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [purchaseReturnConfirmOpen, setPurchaseReturnConfirmOpen] = useState(false)
  const purchaseReturnDraftRef = useRef<InvoiceFormValues | null>(null)
  const [quickProductOpen, setQuickProductOpen] = useState(false)
  const [quickProductNameSeed, setQuickProductNameSeed] = useState("")

  const invoiceSchema = useMemo(() => createInvoiceSchema(type), [type])

  const form = useForm<InvoiceFormValues>({
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

  const watchedItems = useWatch({ control: form.control, name: "items", defaultValue: [] })

  useEffect(() => {
    const fetchData = async () => {
      const [prods, partyList, treasuryList, warehouseList, company] = await Promise.all([
        getInventoryProducts(),
        (type === 'sale' || type === 'quotation' || type === 'sale_return') ? getCustomers() : getSuppliers(),
        getTreasuries(),
        getWarehouses(),
        getCompanyProfile(),
      ])
      setProducts(prods as any[])
      setParties(partyList as any[])
      setTreasuries(treasuryList as any[])
      setWarehouses((warehouseList as any[]) || [])
      
      if (treasuryList.length > 0) {
        form.setValue("treasury_id", treasuryList[0].id)
      }

      if (Array.isArray(warehouseList) && warehouseList.length > 0) {
        const preferredBranchId = (company as any)?.defaultBranchId ?? (company as any)?.default_branch_id ?? null
        const defaultWh =
          (preferredBranchId
            ? warehouseList.find((w: any) => w?.isDefault && w?.branchId === preferredBranchId)
            : null) ??
          warehouseList.find((w: any) => w?.isDefault) ??
          warehouseList[0]
        if (defaultWh?.id) form.setValue("warehouse_id", defaultWh.id)
      }

      // فاتورة جديدة: الضريبة الافتراضية 0% (لا تُفرض من إعدادات الشركة على هذه الشاشة)
      if (!initialData && !referenceId) {
        form.setValue("tax_rate", 0)
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

  const watchedDiscount = form.watch("discount_amount")
  const watchedTaxRate = form.watch("tax_rate")
  const watchedPaid = form.watch("paid")

  useEffect(() => {
    const rows = Array.isArray(watchedItems) ? watchedItems : []
    let subtotal = 0
    rows.forEach((item, i) => {
      const qty = Number(item?.qty)
      const unit = Number(item?.unit_price)
      const safeQty = Number.isFinite(qty) ? qty : 0
      const safeUnit = Number.isFinite(unit) ? unit : 0
      const lineTotal = safeQty * safeUnit
      subtotal += lineTotal
      if (Math.abs(Number(item?.total_line ?? 0) - lineTotal) > 1e-6) {
        form.setValue(`items.${i}.total_line`, lineTotal, { shouldValidate: false, shouldDirty: true })
      }
    })

    const taxAmount = (subtotal - watchedDiscount) * (watchedTaxRate / 100)
    const total = subtotal - watchedDiscount + taxAmount
    const remaining = total - watchedPaid

    form.setValue("subtotal", subtotal)
    form.setValue("tax_amount", taxAmount)
    form.setValue("total", total)
    form.setValue("remaining", remaining > 0 ? remaining : 0)
  }, [watchedItems, watchedDiscount, watchedTaxRate, watchedPaid, form])

  const handleAddProduct = (product: any) => {
    const saleSide = type === "sale" || type === "quotation"
    const unit = saleSide
      ? Number(product.price1 ?? product.price_1 ?? 0)
      : Number(product.cost_price ?? product.costPrice ?? product.price1 ?? 0)
    const cost = Number(product.cost_price ?? product.costPrice ?? 0)
    const safeUnit = Number.isFinite(unit) ? unit : 0
    const safeCost = Number.isFinite(cost) ? cost : safeUnit

    const itemsNow = form.getValues("items")
    const existingIndex = itemsNow.findIndex((f) => f.product_id === product.id)
    if (existingIndex > -1) {
      const item = itemsNow[existingIndex]!
      const newQty = Number(item.qty) + 1
      const up = Number.isFinite(Number(item.unit_price)) ? Number(item.unit_price) : safeUnit
      update(existingIndex, {
        ...item,
        qty: newQty,
        unit_price: up,
        total_line: newQty * up,
      })
    } else {
      append({
        product_id: product.id,
        name: product.name,
        qty: 1,
        unit_price: safeUnit,
        cost_price: safeCost,
        total_line: safeUnit,
        discount_amount: 0,
      })
    }
  }

  const executeSubmit = useCallback(
    async (values: InvoiceFormValues) => {
      setLoading(true)
      try {
        let res
        if (type === "sale") {
          res = await createSaleInvoice(values, values.items, [
            {
              method: values.paid >= values.total ? "cash" : "deferred",
              amount: values.paid,
              treasury_id: values.treasury_id,
            },
          ])
        } else if (type === "purchase") {
          res = await createPurchaseInvoice(values, values.items, [
            {
              method: values.paid >= values.total ? "cash" : "deferred",
              amount: values.paid,
              treasury_id: values.treasury_id,
            },
          ])
        } else if (type === "quotation") {
          res = await createQuotation({ invoice: values, items: values.items })
        } else if (type === "sale_return") {
          res = await createSaleReturn({
            invoice: values,
            items: values.items,
            treasury_id: values.treasury_id,
          })
        } else if (type === "purchase_order") {
          res = await createPurchaseOrder({ invoice: values, items: values.items })
        } else if (type === "purchase_return") {
          res = await createPurchaseReturn({
            invoice: values,
            items: values.items,
            treasury_id: values.treasury_id,
          })
        }

        if (res?.success) {
          if (type === "purchase_return") {
            toast.success("تم تسجيل المرتجع")
            router.push("/dashboard/purchases/returns")
            return
          }
          toast.success("تم تنفيذ العملية بنجاح")
          const redirectType =
            type === "quotation"
              ? "sales/quotations"
              : type === "purchase_order"
                ? "purchases/orders"
                : type === "sale_return" || type === "sale"
                  ? "sales/invoices"
                  : "purchases/invoices"
          router.push(`/dashboard/${redirectType}/${(res as any).id || ""}`)
        } else {
          throw new Error((res as any)?.error || "حدث خطأ غير معروف")
        }
      } catch (error: any) {
        toast.error("خطأ: " + error.message)
      } finally {
        setLoading(false)
        setPurchaseReturnConfirmOpen(false)
      }
    },
    [type, router],
  )

  const submitAfterValidation = useCallback(
    (values: InvoiceFormValues) => {
      if (type === "purchase_return") {
        purchaseReturnDraftRef.current = values
        setPurchaseReturnConfirmOpen(true)
        return
      }
      void executeSubmit(values)
    },
    [type, executeSubmit],
  )

  const handleSave = form.handleSubmit(submitAfterValidation)

  const isPurchasesModule =
    type === "purchase" || type === "purchase_order" || type === "purchase_return"

  const isReturn = type === "sale_return" || type === "purchase_return"
  const [reasons, setReasons] = useState<OperationReasonRow[]>([])

  useEffect(() => {
    if (!isReturn) return
    const scope = type === "sale_return" ? "sale_return" : "purchase_return"
    const load = async () => {
      try {
        const list = await getOperationReasons(scope)
        setReasons(Array.isArray(list) ? list : [])
      } catch {
        setReasons([])
      }
    }
    void load()
  }, [isReturn, type])

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-6 p-1 lg:grid-cols-4",
          isPurchasesModule &&
            "rounded-2xl border border-amber-500/20 border-s-4 border-s-amber-500/50 bg-amber-50/25 p-3 md:p-5 dark:bg-amber-950/15",
        )}
      >
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
              <Button size="sm" type="button" onClick={handleSave} disabled={loading}>
                {loading ? "جاري الحفظ..." : "حفظ"}
                <Save className="me-2 h-4 w-4" aria-hidden />
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
                                const supplierSide =
                                  type === "purchase" ||
                                  type === "purchase_order" ||
                                  type === "purchase_return"
                                form.setValue(supplierSide ? "supplier_id" : "customer_id", p.id)
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
                {(type === "purchase" ||
                  type === "purchase_order" ||
                  type === "purchase_return") &&
                  form.formState.errors.supplier_id?.message && (
                    <p className="text-sm font-medium text-destructive" role="alert">
                      {String(form.formState.errors.supplier_id.message)}
                    </p>
                  )}
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
                <div className="relative">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register("warehouse_id")}
                    disabled={warehouses.length === 0}
                  >
                    {warehouses.length === 0 ? (
                      <option value="00000000-0000-0000-0000-000000000000">لا توجد مستودعات</option>
                    ) : (
                      warehouses.map((w: any) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))
                    )}
                  </select>
                  <Store className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {isReturn && (
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-dashed bg-muted/20 p-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">سبب المرتجع (اختياري)</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue=""
                    onChange={(e) => {
                      const v = e.target.value
                      if (!v) return
                      const current = (form.getValues("notes") || "").trim()
                      form.setValue("notes", current ? `${current}\n${v}` : v, { shouldDirty: true })
                      e.currentTarget.value = ""
                    }}
                  >
                    <option value="">اختر سببًا لإضافته للملاحظات…</option>
                    {reasons
                      .filter((r) => (r as any)?.is_active !== false)
                      .sort((a, b) => Number((a as any).sort_order ?? 0) - Number((b as any).sort_order ?? 0))
                      .map((r) => (
                        <option key={r.id} value={r.label}>
                          {r.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">ملاحظات</Label>
                  <Input {...form.register("notes")} placeholder="اكتب ملاحظة مختصرة… (تظهر في السجل والتقارير)" />
                </div>
              </div>
            )}

            {/* Product Search */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <div className="min-w-0 flex-1">
                <ProductSearchInput
                  products={products}
                  onSelect={handleAddProduct}
                  saleMode={type === 'sale' || type === 'quotation' || type === 'sale_return'}
                  open={productPickerOpen}
                  onOpenChange={setProductPickerOpen}
                  onQuickCreate={
                    isPurchasesModule
                      ? (q) => {
                          setQuickProductNameSeed(q)
                          setQuickProductOpen(true)
                        }
                      : undefined
                  }
                />
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-nowrap">
                {isPurchasesModule && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 border-dashed"
                    onClick={() => {
                      setQuickProductNameSeed("")
                      setQuickProductOpen(true)
                    }}
                  >
                    <PackagePlus className="me-2 h-4 w-4" aria-hidden />
                    صنف جديد
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 shrink-0 border-dashed sm:w-auto"
                  onClick={() => setProductPickerOpen(true)}
                >
                  <Plus className="me-2 h-4 w-4" aria-hidden />
                  إضافة بند
                </Button>
              </div>
            </div>

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
                        <Controller
                          control={form.control}
                          name={`items.${index}.qty`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              step="0.01"
                              min={0.01}
                              className="h-8 text-center tabular-nums"
                              value={field.value === undefined || field.value === null ? "" : String(field.value)}
                              onChange={(e) => {
                                const raw = e.target.value
                                if (raw === "") {
                                  field.onChange(0)
                                  return
                                }
                                const n = parseFloat(raw)
                                field.onChange(Number.isFinite(n) ? n : 0)
                              }}
                              onBlur={field.onBlur}
                              ref={field.ref}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={form.control}
                          name={`items.${index}.unit_price`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              className="h-8 text-center tabular-nums"
                              value={field.value === undefined || field.value === null ? "" : String(field.value)}
                              onChange={(e) => {
                                const raw = e.target.value
                                if (raw === "") {
                                  field.onChange(0)
                                  return
                                }
                                const n = parseFloat(raw)
                                field.onChange(Number.isFinite(n) ? n : 0)
                              }}
                              onBlur={field.onBlur}
                              ref={field.ref}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-start font-bold text-gray-700 tabular-nums">
                        {formatCurrency(
                          (() => {
                            const row = watchedItems?.[index]
                            const q = Number(row?.qty)
                            const p = Number(row?.unit_price)
                            const lt = (Number.isFinite(q) ? q : 0) * (Number.isFinite(p) ? p : 0)
                            return Number.isFinite(lt) ? lt : 0
                          })(),
                        )}
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
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        لا توجد بنود بعد. اضغط «إضافة بند» أو ابحث أعلاه لإضافة أصناف.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {form.formState.errors.items?.message && (
              <p className="text-sm font-medium text-destructive" role="alert">
                {String(form.formState.errors.items.message)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Totals Sidebar */}
      <div className="space-y-6">
        <Card className="sticky top-6 border-none bg-white/90 shadow-sm backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-bold flex items-center gap-2">
              <Calculator className="h-4 w-4" /> ملخص الفاتورة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/40 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع قبل الضريبة</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(Number(form.watch("subtotal") || 0))}
                </span>
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
                <Label className="text-xs">الخصم الإجمالي</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  {...form.register("discount_amount", { valueAsNumber: true })}
                  className="h-8 text-start font-mono tabular-nums"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-2">
                <Label className="text-xs">الضريبة (%)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  {...form.register("tax_rate", { valueAsNumber: true })}
                  className="h-8 text-start font-mono tabular-nums"
                />
              </div>
              {Number(form.watch("tax_amount") || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">مبلغ الضريبة</span>
                  <span className="tabular-nums font-medium">
                    {formatCurrency(Number(form.watch("tax_amount") || 0))}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-border/60 pt-3 text-lg font-bold text-primary">
                <span>الإجمالي بعد الضريبة</span>
                <span className="tabular-nums">{formatCurrency(Number(form.watch("total") || 0))}</span>
              </div>
            </div>

            {type !== 'quotation' && (
              <div className="space-y-3 border-t border-dashed pt-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-green-600">
                    {type === 'sale_return' ? "المبلغ المسترد نقداً" : "المدفوع نقداً / بطاقة"}
                  </Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    {...form.register("paid", { valueAsNumber: true })}
                    className="h-10 border-green-100 bg-green-50/30 text-start text-lg font-bold text-green-600 tabular-nums"
                  />
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold text-red-600">
                  <span>{type === 'sale_return' ? "خصم من المديونية" : "المتبقي (آجل)"}</span>
                  <span className="tabular-nums">{formatCurrency(Number(form.watch("remaining") || 0))}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
             <Button type="button" className="h-11 w-full text-lg font-bold" onClick={handleSave} disabled={loading}>
                {loading ? "جاري المعالجة..." : "تأكيد وحفظ"}
                <Save className="me-2 h-5 w-5" aria-hidden />
             </Button>
             <Button variant="outline" className="w-full gap-2 h-10 border-primary text-primary hover:bg-primary/5">
                <Printer className="h-4 w-4" /> حفظ وطباعة
             </Button>
          </CardFooter>
        </Card>
      </div>
    </div>

      {isPurchasesModule && (
        <QuickProductDialog
          open={quickProductOpen}
          onOpenChange={setQuickProductOpen}
          initialName={quickProductNameSeed}
          onCreated={async (row) => {
            const list = (await getInventoryProducts()) as any[]
            setProducts(list)
            const full =
              list.find((p: any) => p.id === row.id) ??
              ({
                id: row.id,
                name: row.name,
                barcode: row.barcode ?? null,
                price1: row.price1 ?? 0,
                cost_price: row.cost_price ?? row.price1 ?? 0,
              } as any)
            const itemsNow = form.getValues("items")
            const existingIndex = itemsNow.findIndex((it) => it.product_id === full.id)
            if (existingIndex > -1) {
              const item = itemsNow[existingIndex]!
              const newQty = item.qty + 1
              update(existingIndex, {
                ...item,
                qty: newQty,
                total_line: newQty * item.unit_price,
              })
            } else {
              const unitPrice = Number(full.cost_price ?? full.costPrice ?? 0)
              append({
                product_id: full.id,
                name: full.name,
                qty: 1,
                unit_price: unitPrice,
                cost_price: Number(full.cost_price ?? full.costPrice ?? 0),
                total_line: unitPrice,
                discount_amount: 0,
              })
            }
          }}
        />
      )}

      <AlertDialog
        open={purchaseReturnConfirmOpen}
        onOpenChange={(open) => {
          setPurchaseReturnConfirmOpen(open)
          if (!open) purchaseReturnDraftRef.current = null
        }}
      >
        <AlertDialogContent dir="rtl" className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد مرتجع المشتريات</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
              لن يمكن التراجع تلقائيًا عن هذا السجل من الواجهة. قد تتغير كميات المخزون والمستحقات للمورد وفق
              إعدادات النظام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel type="button">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="bg-primary text-primary-foreground"
              onClick={() => {
                const draft = purchaseReturnDraftRef.current
                if (draft) void executeSubmit(draft)
              }}
            >
              تأكيد وتسجيل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
