"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { saveCustomer, saveSupplier, updateCustomerRecord, updateSupplierRecord } from "@/lib/actions/customers.actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const contactSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("بريد غير صالح").optional().or(z.literal("")),
  taxNumber: z.string().optional(),
})

type Values = z.infer<typeof contactSchema>

type Props = {
  kind: "customer" | "supplier"
  id?: string
  initialData?: {
    name?: string
    phone?: string | null
    address?: string | null
    email?: string | null
    taxNumber?: string | null
  }
  title: string
  onSuccess?: (data: any) => void
}

function mapPayload(v: Values) {
  return {
    name: v.name.trim(),
    phone: v.phone?.trim() || undefined,
    address: v.address?.trim() || undefined,
    email: v.email?.trim() || undefined,
    taxNumber: v.taxNumber?.trim() || undefined,
  }
}

export function PartnerContactForm({ kind, id, initialData, title, onSuccess }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(id)

  const form = useForm<Values>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "",
      address: initialData?.address ?? "",
      email: initialData?.email ?? "",
      taxNumber: (initialData as { taxNumber?: string })?.taxNumber ?? (initialData as { tax_number?: string })?.tax_number ?? "",
    },
  })

  async function onSubmit(v: Values) {
    setSaving(true)
    try {
      const payload = mapPayload(v)
      let result: any

      if (isEdit && id) {
        if (kind === "customer") {
          result = await updateCustomerRecord(id, payload)
        } else {
          result = await updateSupplierRecord(id, payload)
        }

        if (!result.success) {
          toast.error(result.error || "تعذّر حفظ التعديلات")
          return
        }

        toast.success("تم حفظ التعديلات")
        if (onSuccess) {
          onSuccess(result.data || { id, ...payload })
        } else {
          router.push(kind === "customer" ? `/dashboard/customers/${id}` : `/dashboard/suppliers/${id}`)
        }
      } else {
        if (kind === "customer") {
          result = await saveCustomer(payload)
        } else {
          result = await saveSupplier(payload)
        }

        if (!result.success) {
          toast.error(result.error || "تعذّر إضافة البيانات")
          return
        }

        toast.success("تمت الإضافة")
        if (onSuccess) {
          onSuccess(result.data)
        } else {
          router.push(kind === "customer" ? "/dashboard/customers" : "/dashboard/suppliers")
        }
      }
      if (!onSuccess) router.refresh()
    } catch (e) {
      console.error(e)
      toast.error("حدث خطأ غير متوقع")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input dir="auto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الهاتف</FormLabel>
                  <FormControl>
                    <Input className="tabular-nums" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Input dir="auto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد (اختياري)</FormLabel>
                  <FormControl>
                    <Input type="email" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الرقم الضريبي (اختياري)</FormLabel>
                  <FormControl>
                    <Input dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                إلغاء
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />}
                {isEdit ? "حفظ" : "إضافة"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
