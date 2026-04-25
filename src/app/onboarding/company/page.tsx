'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthStore } from '@/stores/authStore'
import { createInitialCompany } from '@/lib/actions/onboarding.actions'
import {
  CURRENCY_CHOICES,
  REGIONAL_COUNTRIES,
  TIMEZONE_CHOICES,
  getRegionalDefaults,
} from '@/lib/company-regional'

const companySchema = z.object({
  name: z.string().min(3, 'اسم المحل أو الشركة يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().min(8, 'رقم التليفون غير صحيح'),
  address: z.string().optional(),
  businessType: z.string().optional(),
  countryCode: z.string().length(2, 'اختر البلد'),
  timezone: z.string().min(1, 'اختر المنطقة الزمنية'),
  currency: z.string().min(1, 'اختر العملة'),
  defaultBranchName: z.string().max(120).optional(),
  defaultWarehouseName: z.string().max(120).optional(),
  applyTax: z.boolean(),
  vatRate: z.coerce.number().min(0, 'النسبة يجب أن تكون 0 أو أكثر'),
})

type CompanyForm = z.infer<typeof companySchema>

export default function OnboardingCompanyPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const setCompanyStore = useAuthStore((state) => state.setCompany)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      countryCode: 'EG',
      timezone: 'Africa/Cairo',
      currency: 'EGP',
      businessType: 'mobile',
      applyTax: false,
      vatRate: 14,
      defaultBranchName: '',
      defaultWarehouseName: '',
    },
  })

  const applyTax = watch('applyTax')
  const countryCode = watch('countryCode')
  const timezone = watch('timezone')
  const currency = watch('currency')

  const onSubmit = async (data: CompanyForm) => {
    setError(null)

    const result = await createInitialCompany({
      name: data.name,
      phone: data.phone,
      address: data.address,
      currency: data.currency,
      vatRate: data.applyTax ? data.vatRate : 0,
      countryCode: data.countryCode,
      timezone: data.timezone,
      defaultBranchName: data.defaultBranchName?.trim() || undefined,
      defaultWarehouseName: data.defaultWarehouseName?.trim() || undefined,
    })

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.success && result.company) {
      setCompanyStore(result.company as any)
      try {
        await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include', cache: 'no-store' })
      } catch {
        /* تجاهل */
      }
      router.push('/onboarding/warehouse')
      router.refresh()
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">بيانات الشركة</h1>
        <p className="mx-auto w-full max-w-sm text-balance text-sm leading-relaxed text-muted-foreground">
          الاسم والتواصل، ثم البلد والعملة والتوقيت، وأول فرع ومخزن. يمكنك تعديلها لاحقاً من الإعدادات.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 mt-4">
        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="name">اسم المحل / الشركة</Label>
          <Input id="name" disabled={isSubmitting} {...register('name')} />
          {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">رقم التليفون</Label>
          <Input id="phone" dir="ltr" className="text-right" disabled={isSubmitting} {...register('phone')} />
          {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">العنوان (اختياري)</Label>
          <Input id="address" disabled={isSubmitting} {...register('address')} />
        </div>

        <div className="grid gap-2">
          <Label>نوع النشاط (مرجعي)</Label>
          <Select disabled={isSubmitting} onValueChange={(val) => setValue('businessType', val)} defaultValue="mobile">
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع النشاط" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mobile">موبايلات وقطع غيار</SelectItem>
              <SelectItem value="retail">تجزئة عامة</SelectItem>
              <SelectItem value="clothes">ملابس</SelectItem>
              <SelectItem value="electronics">إلكترونيات</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label>البلد</Label>
            <Select
              disabled={isSubmitting}
              value={countryCode}
              onValueChange={(v) => {
                setValue('countryCode', v)
                const d = getRegionalDefaults(v)
                setValue('timezone', d.defaultTimezone)
                setValue('currency', d.suggestedCurrency)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="البلد" />
              </SelectTrigger>
              <SelectContent>
                {REGIONAL_COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.countryCode && (
              <span className="text-xs text-destructive">{errors.countryCode.message}</span>
            )}
          </div>

          <div className="grid gap-2">
            <Label>المنطقة الزمنية</Label>
            <Select disabled={isSubmitting} value={timezone} onValueChange={(v) => setValue('timezone', v)}>
              <SelectTrigger>
                <SelectValue placeholder="التوقيت" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_CHOICES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timezone && <span className="text-xs text-destructive">{errors.timezone.message}</span>}
          </div>
        </div>

        <div className="grid gap-2">
          <Label>العملة</Label>
          <Select disabled={isSubmitting} value={currency} onValueChange={(v) => setValue('currency', v)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر العملة" />
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

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="branchName">اسم الفرع الأول (اختياري)</Label>
            <Input
              id="branchName"
              placeholder="الفرع الرئيسي"
              disabled={isSubmitting}
              {...register('defaultBranchName')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="whName">اسم المخزن الافتراضي (اختياري)</Label>
            <Input
              id="whName"
              placeholder="المخزن الرئيسي"
              disabled={isSubmitting}
              {...register('defaultWarehouseName')}
            />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Checkbox
            id="applyTax"
            checked={applyTax}
            onCheckedChange={(checked) => setValue('applyTax', checked === true)}
            disabled={isSubmitting}
          />
          <Label htmlFor="applyTax" className="cursor-pointer font-normal">
            تطبيق ضريبة القيمة المضافة
          </Label>
        </div>

        {applyTax && (
          <div className="grid gap-2 animate-in fade-in zoom-in-95 duration-200">
            <Label htmlFor="vatRate">نسبة الضريبة (%)</Label>
            <Input id="vatRate" type="number" dir="ltr" className="text-right" disabled={isSubmitting} {...register('vatRate')} />
            {errors.vatRate && <span className="text-xs text-destructive">{errors.vatRate.message}</span>}
          </div>
        )}

        <Button type="submit" className="mt-4 w-full gap-2" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden />
              جاري الحفظ…
            </>
          ) : (
            'المتابعة للخطوة التالية'
          )}
        </Button>
      </form>
    </div>
  )
}
