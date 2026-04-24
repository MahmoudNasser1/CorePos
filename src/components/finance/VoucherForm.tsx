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

const voucherSchema = z.object({
  type: z.enum(['receipt', 'payment']),
  customer_id: z.string().optional().nullable(),
  supplier_id: z.string().optional().nullable(),
  treasury_id: z.string().min(1, "يجب اختيار الخزينة"),
  amount: z.number().min(0.01, "يجب إدخال مبلغ صحيح"),
  method: z.enum(['cash', 'card', 'bank']),
  date: z.string(),
  notes: z.string().optional(),
})

interface VoucherFormProps {
  type: 'receipt' | 'payment'
}

export function VoucherForm({ type }: VoucherFormProps) {
  const router = useRouter()
  const [parties, setParties] = useState<any[]>([])
  const [treasuries, setTreasuries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof voucherSchema>>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      type: type,
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      method: "cash",
      notes: ""
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      const [partyList, treas] = await Promise.all([
        type === 'receipt' ? getCustomers() : getSuppliers(),
        getTreasuries()
      ])
      setParties(partyList)
      setTreasuries(treas)
      if (treas.length > 0) form.setValue("treasury_id", treas[0].id)
    }
    fetchData()
  }, [type])

  async function onSubmit(values: z.infer<typeof voucherSchema>) {
    setLoading(true)
    try {
      await createPayment(values)
      toast.success(type === 'receipt' ? "تم تسجيل سند القبض بنجاح" : "تم تسجيل سند الصرف بنجاح")
      router.push('/dashboard/finance/treasury')
      router.refresh()
    } catch (error: any) {
      toast.error("خطأ: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name={type === 'receipt' ? "customer_id" : "supplier_id"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{type === 'receipt' ? "العميل" : "المورد"}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={type === 'receipt' ? "اختر العميل" : "اختر المورد"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {parties.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الخزينة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الطريقة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                      <Input type="date" {...field} />
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
                    <Textarea placeholder="أضف أي تفاصيل إضافية هنا..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                إلغاء
              </Button>
              <Button type="submit" className="px-8" disabled={loading}>
                {loading ? "جاري الحفظ..." : "حفظ السند"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
