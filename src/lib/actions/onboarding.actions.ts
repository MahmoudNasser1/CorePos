'use server'

import {
  createInitialCompanyViaBackend,
  setupSampleDataViaBackend,
} from '@/lib/api/onboarding'
import { revalidatePath } from 'next/cache'

export async function createInitialCompany(data: {
  name: string
  phone: string
  address?: string
  currency: string
  vatRate: number
  countryCode?: string
  timezone?: string
  defaultBranchName?: string
  defaultWarehouseName?: string
}) {
  try {
    const company = await createInitialCompanyViaBackend(data)
    revalidatePath('/dashboard', 'layout')
    return { success: true, company }
  } catch (error) {
    console.error('Backend onboarding company error:', error)
    return { error: 'تعذر إكمال إعداد الشركة عبر الخادم الجديد.' }
  }
}

export async function setupSampleData() {
  try {
    const summary = await setupSampleDataViaBackend()
    revalidatePath('/dashboard')
    return { success: true, summary }
  } catch (error) {
    console.error('Backend sample data error:', error)
    return { error: 'تعذر إضافة البيانات التجريبية عبر الخادم الجديد.' }
  }
}
