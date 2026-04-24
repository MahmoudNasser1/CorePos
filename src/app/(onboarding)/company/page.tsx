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

const companySchema = z.object({
  name: z.string().min(3, 'اسم المحل أو الشركة يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().min(8, 'رقم التليفون غير صحيح'),
  address: z.string().optional(),
  businessType: z.string().min(1, 'اختر نوع النشاط'),
  currency: z.string().min(1, 'اختر العملة'),
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
      currency: 'EGP',
      businessType: 'mobile',
      applyTax: false,
      vatRate: 14,
    },
  })

  const applyTax = watch('applyTax')

  const onSubmit = async (data: CompanyForm) => {
    setError(null)

    const result = await createInitialCompany({
      name: data.name,
      phone: data.phone,
      address: data.address,
      currency: data.currency,
      vatRate: data.applyTax ? data.vatRate : 0,
    })

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.success && result.company) {
      setCompanyStore(result.company as any)
      router.push('/onboarding/warehouse')
      router.refresh()
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">بيانات الشركة</h1>
        <p className="text-muted-foreground w-3/4 mx-auto leading-relaxed">
          خطوة 1 من 3: لنقم بإعداد حسابك ونظامك الأساسي
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 mt-4">
        {error && (
          <div className="p-3 text-sm text-white bg-destructive rounded-md text-center">
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
          <Label>نوع النشاط</Label>
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
          {errors.businessType && <span className="text-xs text-destructive">{errors.businessType.message}</span>}
        </div>

        <div className="grid gap-2">
          <Label>العملة</Label>
          <Select disabled={isSubmitting} onValueChange={(val) => setValue('currency', val)} defaultValue="EGP">
            <SelectTrigger>
              <SelectValue placeholder="اختر العملة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
              <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
              <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse mt-2">
          <Checkbox 
            id="applyTax" 
            checked={applyTax} 
            onCheckedChange={(checked) => setValue('applyTax', checked === true)} 
            disabled={isSubmitting} 
          />
          <Label htmlFor="applyTax" className="cursor-pointer font-normal">
            تطبيق ضربية القيمة المضافة
          </Label>
        </div>

        {applyTax && (
          <div className="grid gap-2 animate-in fade-in zoom-in-95 duration-200">
            <Label htmlFor="vatRate">نسبة الضريبة (%)</Label>
            <Input id="vatRate" type="number" dir="ltr" className="text-right" disabled={isSubmitting} {...register('vatRate')} />
            {errors.vatRate && <span className="text-xs text-destructive">{errors.vatRate.message}</span>}
          </div>
        )}
        
        <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'المتابعة للخطوة التالية'}
        </Button>
      </form>
    </div>
  )
}
