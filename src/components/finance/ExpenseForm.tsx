"use client"

import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createExpense, getExpenseCategories, getTreasuries } from "@/lib/actions/payments"
import { toast } from "sonner"
import { getBackendSession } from "@/lib/api/user"

const expenseSchema = z.object({
  category_id: z.string().min(1, "يجب اختيار التصنيف"),
  treasury_id: z.string().min(1, "يجب اختيار الخزينة"),
  amount: z.coerce.number().min(0.01, "أدخل مبلغًا أكبر من صفر"),
  date: z.string(),
  notes: z.string().optional(),
})

export function ExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const [categories, setCategories] = useState<any[]>([])
  const [treasuries, setTreasuries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      notes: ""
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      const [cats, treas] = await Promise.all([
        getExpenseCategories(),
        getTreasuries()
      ])
      setCategories(cats)
      setTreasuries(treas)
      if (treas.length > 0) form.setValue("treasury_id", treas[0].id)
    }
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- set treasury default once loaded
  }, [])

  async function onSubmit(values: z.infer<typeof expenseSchema>) {
    setLoading(true)
    try {
      const session = await getBackendSession()
      const createdBy = (session as any)?.user?.id || (session as any)?.userId || null
      if (!createdBy) throw new Error("Unauthorized")

      await createExpense({ ...values, created_by: createdBy })
      toast.success("تم تسجيل المصروف بنجاح")
      form.reset()
      onSuccess?.()
    } catch {
      toast.error("تعذّر تسجيل العملية. أعد المحاولة.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تصنيف المصروف</FormLabel>
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent dir="rtl">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
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
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
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

        <div className="grid grid-cols-2 gap-4">
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
                    className="text-end tabular-nums"
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
          {loading ? "جاري التسجيل…" : "حفظ المصروف"}
        </Button>
      </form>
    </Form>
  )
}
