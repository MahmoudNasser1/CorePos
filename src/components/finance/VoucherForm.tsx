"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createPayment, getTreasuries } from "@/lib/actions/payments"
import { getCustomers, getSuppliers } from "@/lib/actions/customers.actions"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const voucherSchema = z
  .object({
    type: z.enum(["receipt", "payment"]),
    customer_id: z.string().optional().nullable(),
    supplier_id: z.string().optional().nullable(),
    treasury_id: z.string().min(1, "يجب اختيار الخزينة"),
    amount: z.coerce.number().min(0.01, "أدخل مبلغًا أكبر من صفر"),
    method: z.enum(["cash", "card", "bank"]),
    date: z.string(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "receipt" && !data.customer_id) {
      ctx.addIssue({ code: "custom", message: "اختر العميل", path: ["customer_id"] })
    }
    if (data.type === "payment" && !data.supplier_id) {
      ctx.addIssue({ code: "custom", message: "اختر المورد", path: ["supplier_id"] })
    }
  })

interface VoucherFormProps {
  type: "receipt" | "payment"
}

export function VoucherForm({ type }: VoucherFormProps) {
  const router = useRouter()
  const [parties, setParties] = useState<{ id: string; name: string }[]>([])
  const [treasuries, setTreasuries] = useState<{ id: string; name: string }[]>([])
  const [partyOpen, setPartyOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof voucherSchema>>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      type,
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      method: "cash",
      notes: "",
      customer_id: null,
      supplier_id: null,
      treasury_id: "",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      const [partyList, treas] = await Promise.all([
        type === "receipt" ? getCustomers() : getSuppliers(),
        getTreasuries(),
      ])
      setParties((partyList as { id: string; name: string }[]) || [])
      setTreasuries((treas as { id: string; name: string }[]) || [])
      if (treas.length > 0) {
        const current = form.getValues("treasury_id")
        if (!current) form.setValue("treasury_id", treas[0].id)
      }
    }
    void fetchData()
    // form methods stable; only refetch when voucher type changes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form.setValue after treasuries load
  }, [type])

  async function onSubmit(values: z.infer<typeof voucherSchema>) {
    setLoading(true)
    try {
      const res = await createPayment(values)
      if (res && typeof res === "object" && "success" in res && !(res as { success: boolean }).success) {
        toast.error("تعذّر تسجيل العملية. أعد المحاولة.")
        return
      }
      toast.success(type === "receipt" ? "تم تسجيل سند القبض" : "تم تسجيل سند الصرف")
      router.push("/dashboard/finance/treasury")
      router.refresh()
    } catch {
      toast.error("تعذّر تسجيل العملية. أعد المحاولة.")
    } finally {
      setLoading(false)
    }
  }

  const partyFieldName = type === "receipt" ? ("customer_id" as const) : ("supplier_id" as const)

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name={partyFieldName}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{type === "receipt" ? "العميل" : "المورد"}</FormLabel>
                    <Popover open={partyOpen} onOpenChange={setPartyOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={partyOpen}
                            className={cn(
                              "h-11 justify-between font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? parties.find((p) => p.id === field.value)?.name
                              : type === "receipt"
                                ? "اختر العميل…"
                                : "اختر المورد…"}
                            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command dir="rtl">
                          <CommandInput placeholder="بحث بالاسم…" />
                          <CommandList>
                            <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                            <CommandGroup>
                              {parties.map((p) => (
                                <CommandItem
                                  key={p.id}
                                  value={p.name}
                                  onSelect={() => {
                                    form.setValue(partyFieldName, p.id)
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="treasury_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الخزينة</FormLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="اختر الخزينة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl">
                        {treasuries.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        dir="ltr"
                        className="h-11 text-end tabular-nums"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>طريقة الدفع</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="اختر الطريقة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl">
                        <SelectItem value="cash">نقدي</SelectItem>
                        <SelectItem value="card">بطاقة</SelectItem>
                        <SelectItem value="bank">تحويل بنكي</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التاريخ</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea placeholder="تفاصيل إضافية (اختياري)…" className="min-h-[88px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                إلغاء
              </Button>
              <Button type="submit" className="px-8" disabled={loading} aria-busy={loading}>
                {loading ? "جاري التسجيل…" : "حفظ السند"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
