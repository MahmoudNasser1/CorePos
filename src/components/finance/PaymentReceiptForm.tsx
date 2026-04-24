"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { createPayment } from "@/lib/actions/payments"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const receiptSchema = z.object({
  partner_id: z.string().min(1, "يجب اختيار العميل أو المورد"),
  treasury_id: z.string().min(1, "يجب اختيار الخزينة"),
  amount: z.coerce.number().min(1, "المبلغ يجب أن يكون أكبر من صفر"),
  type: z.enum(['in', 'out']),
  payment_method: z.enum(['cash', 'card', 'bank_transfer']),
  notes: z.string().optional(),
})

interface PaymentReceiptFormProps {
  partners: any[]
  treasuries: any[]
  defaultType?: 'in' | 'out'
}

export function PaymentReceiptForm({ partners, treasuries, defaultType = 'in' }: PaymentReceiptFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof receiptSchema>>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      partner_id: "",
      treasury_id: treasuries[0]?.id || "",
      amount: 0,
      type: defaultType,
      payment_method: 'cash',
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof receiptSchema>) {
    setLoading(true)
    try {
      const result = await createPayment(values)
      if (result.success) {
        toast.success(values.type === 'in' ? "تم تسجيل سند القبض بنجاح" : "تم تسجيل سند الصرف بنجاح")
        form.reset()
        router.refresh()
      } else {
        toast.error(result.error || "فشل في تسجيل السند")
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع السند</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="in">سند قبض (استلام مالي)</SelectItem>
                    <SelectItem value="out">سند صرف (دفع مالي)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_method"
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
                    <SelectItem value="cash">نقداً</SelectItem>
                    <SelectItem value="card">بطاقة بنكية</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="partner_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>العميل / المورد</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر جهة التعامل" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {partners.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.balance > 0 ? `عليه ${p.balance}` : p.balance < 0 ? `له ${Math.abs(p.balance)}` : 'رصيد صفر'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المبلغ</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} />
                </FormControl>
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
                    {treasuries.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <FormLabel>ملاحظات إضافية</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="بيان الحركة أو ملاحظات المراجعة..." 
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full gap-2 font-bold" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />}
          تأكيد تسجيل السند
        </Button>
      </form>
    </Form>
  )
}
