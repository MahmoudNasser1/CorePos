"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { updateCompanyProfile } from "@/lib/actions/settings.actions"
import { Globe2, Save } from "lucide-react"
import { CURRENCY_CHOICES, REGIONAL_COUNTRIES, TIMEZONE_CHOICES, getRegionalDefaults } from "@/lib/company-regional"

const schema = z.object({
  currency: z.string().min(1),
  countryCode: z.string().min(2).max(2),
  timezone: z.string().min(1).max(64),
})

type FormValues = z.infer<typeof schema>

type CompanyRow = {
  currency?: string | null
  countryCode?: string | null
  country_code?: string | null
  timezone?: string | null
}

function pickCountryCode(c: CompanyRow) {
  return (c.countryCode ?? c.country_code ?? "EG").toString().slice(0, 2).toUpperCase() || "EG"
}

export function CompanyRegionalForm({ initialData }: { initialData: CompanyRow | null }) {
  const [loading, setLoading] = useState(false)
  const defaults = useMemo(() => getRegionalDefaults(pickCountryCode(initialData ?? {})), [initialData])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: (initialData?.currency ?? defaults.suggestedCurrency).toString(),
      countryCode: pickCountryCode(initialData ?? {}),
      timezone: (initialData?.timezone ?? defaults.defaultTimezone).toString(),
    },
  })

  const countryCode = form.watch("countryCode")

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true)
    try {
      await updateCompanyProfile({
        currency: values.currency,
        countryCode: values.countryCode.trim().toUpperCase(),
        timezone: values.timezone.trim(),
      })
      toast.success("تم حفظ إعدادات الشركة والمنطقة")
    } catch {
      toast.error("تعذّر الحفظ. أعد المحاولة.")
    } finally {
      setLoading(false)
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Globe2 className="h-4 w-4 text-primary" aria-hidden />
            الشركة والمنطقة
          </CardTitle>
          <CardDescription>
            العملة والبلد والتوقيت تُستخدم كأساس للعرض والتقارير اليومية. تعديل الفروع والمخازن من القائمة أعلاه.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label>البلد</Label>
            <Select
              value={countryCode}
              onValueChange={(v) => {
                form.setValue("countryCode", v)
                const d = getRegionalDefaults(v)
                form.setValue("timezone", d.defaultTimezone)
                form.setValue("currency", d.suggestedCurrency)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر البلد" />
              </SelectTrigger>
              <SelectContent>
                {REGIONAL_COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tz">المنطقة الزمنية</Label>
            <Select value={form.watch("timezone")} onValueChange={(v) => form.setValue("timezone", v)}>
              <SelectTrigger id="tz">
                <SelectValue placeholder="اختر التوقيت" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_CHOICES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>العملة الافتراضية</Label>
            <Select value={form.watch("currency")} onValueChange={(v) => form.setValue("currency", v)}>
              <SelectTrigger>
                <SelectValue placeholder="العملة" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_CHOICES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="h-4 w-4" aria-hidden />
            {loading ? "جاري الحفظ…" : "حفظ"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
