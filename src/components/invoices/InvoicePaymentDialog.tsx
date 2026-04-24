"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createPayment } from "@/lib/actions/payments"
import { BackendApiError } from "@/lib/api/backend-client"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

const schema = z.object({
  treasury_id: z.string().min(1, "يجب اختيار الخزينة"),
  amount: z.coerce.number().min(0.01, "المبلغ يجب أن يكون أكبر من صفر"),
  method: z.enum(["cash", "card", "bank"]),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type TreasuryRow = { id: string; name: string }

export function InvoicePaymentDialog(props: {
  invoiceId: string
  customerId?: string | null
  remaining: number
  treasuries: TreasuryRow[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      treasury_id: props.treasuries[0]?.id ?? "",
      amount: props.remaining,
      method: "cash",
      notes: "",
    },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const result = await createPayment({
        ...values,
        invoice_id: props.invoiceId,
        customer_id: props.customerId ?? undefined,
        type: "in",
      })

      if (result?.success) {
        toast.success("تم تسجيل الدفع")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result?.error || "فشل تسجيل السداد")
      }
    } catch (err) {
      if (err instanceof BackendApiError) {
        if (err.code === 'PAYMENT_EXCEEDS_REMAINING') {
          toast.error("المبلغ أكبر من المتبقي على الفاتورة")
        } else if (err.code === 'NOT_FOUND') {
          toast.error("الفاتورة غير موجودة")
        } else {
          toast.error(err.message || "فشل تسجيل السداد")
        }
      } else {
        toast.error("حدث خطأ غير متوقع أثناء تسجيل السداد")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="gap-2" disabled={props.remaining <= 0}>
          تسجيل دفع
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-black">تسجيل دفع للفاتورة</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            أدخل المبلغ المحصّل. لن يُقبل مبلغ أكبر من المتبقي.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      {props.treasuries.map((t) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="cash">نقداً</SelectItem>
                        <SelectItem value="card">بطاقة</SelectItem>
                        <SelectItem value="bank">تحويل/بنك</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" inputMode="decimal" {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      المتبقي:{" "}
                      <span className="font-semibold text-foreground tabular-nums">
                        {formatCurrency(props.remaining)}
                      </span>
                    </p>
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
                    <Textarea className="resize-none" placeholder="اختياري..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full font-black" disabled={loading}>
              {loading ? "جاري التسجيل..." : "تأكيد الدفع"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

