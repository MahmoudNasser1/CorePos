'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { isBackendEnabled } from '@/lib/api/feature-flags'
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
}) {
  if (isBackendEnabled('onboarding')) {
    try {
      const company = await createInitialCompanyViaBackend(data)
      return { success: true, company }
    } catch (error) {
      console.error('Backend onboarding company error:', error)
      return { error: 'تعذر إكمال إعداد الشركة عبر الخادم الجديد.' }
    }
  }

  console.log('🏁 Starting Company Creation for:', data.name)
  
  // Use server client for auth check (to get current user ID)
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  
  if (userError || !userData.user) {
    console.error('❌ Onboarding Auth Error:', userError)
    return { error: 'جلسة العمل انتهت أو غير صالحة. يرجى تسجيل الدخول مرة أخرى.' }
  }

  const userId = userData.user.id
  console.log('👤 User Authenticated:', userId)

  // Double check environment variables
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in production environment!')
    return { error: 'خطأ في تكوين الخادم (Environment Variables). يرجى التأكد من إضافة SERVICE_ROLE_KEY.' }
  }

  // Generate unique slug
  const slug = data.name.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7)

  // 1. Create Company using ADMIN client
  console.log('🏢 Attempting to insert company...')
  const { data: newCompany, error: companyError } = await supabaseAdmin
    .from('companies' as any)
    .insert({
      name: data.name,
      phone: data.phone,
      address: data.address,
      currency: data.currency,
      vat_rate: data.vatRate,
      owner_id: userId,
      slug: slug,
      is_active: true,
    })
    .select()
    .single() as any

  if (companyError || !newCompany) {
    console.error('❌ Company Insertion Error Details:', {
      message: companyError?.message,
      code: companyError?.code,
      hint: companyError?.hint,
      details: companyError?.details
    })
    
    // Provide specific guidance for 401/403
    if (companyError?.code === '401' || companyError?.message === 'Unauthorized') {
      return { error: 'فشل التشغيل بصلاحيات المدير (401 Unauthorized). تأكد من صحة مفتاح Service Role.' }
    }
    
    return { error: `حدث خطأ أثناء إنشاء الشركة: ${companyError?.message || 'خطأ غير معروف'}` }
  }

  console.log('✅ Company Created Success:', (newCompany as any).id)

  // 2. Update Profile using ADMIN client
  console.log('🔄 Updating user profile...')
  const { error: profileError } = await supabaseAdmin
    .from('profiles' as any)
    .update({ company_id: (newCompany as any).id } as any)
    .eq('id', userId)

  if (profileError) {
    console.error('❌ Profile Update Error:', profileError)
    return { error: 'تم إنشاء الشركة بنجاح ولكن فشل ربط حسابك بها. يرجى المحاولة مرة أخرى.' }
  }

  // 3. Create Default Branch & Warehouse
  console.log('📍 Creating default branch and warehouse...')
  const { error: branchErr } = await (supabaseAdmin.from('branches') as any).insert({
    company_id: newCompany.id,
    name: 'الفرع الرئيسي',
    is_active: true,
  } as any)
  
  if (branchErr) console.error('⚠️ Branch Creation Warning:', branchErr)

  const { error: warehouseErr } = await (supabaseAdmin.from('warehouses') as any).insert({
    company_id: newCompany.id,
    name: 'المخزن الرئيسي',
    is_active: true,
  } as any)

  if (warehouseErr) console.error('⚠️ Warehouse Creation Warning:', warehouseErr)

  revalidatePath('/dashboard', 'layout')
  return { success: true, company: newCompany }
}

export async function setupSampleData() {
  if (isBackendEnabled('onboarding')) {
    try {
      const summary = await setupSampleDataViaBackend()
      return { success: true, summary }
    } catch (error) {
      console.error('Backend sample data error:', error)
      return { error: 'تعذر إضافة البيانات التجريبية عبر الخادم الجديد.' }
    }
  }

  console.log('🧪 Setting up sample data...')
  const supabase = await createClient()
  
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: 'Unauthorized' }

  const { data: profile, error: profErr } = await supabaseAdmin
    .from('profiles' as any)
    .select('company_id')
    .eq('id', userData.user.id)
    .single() as any

  if (profErr || !profile?.company_id) {
    console.error('❌ Sample Data: Company ID not found', profErr)
    return { error: 'لم يتم العثور على الشركة المرتبطة بحسابك' }
  }

  const company_id = (profile as any).company_id

  // 1. Categories
  console.log('📁 Creating categories...')
  const { data: categories, error: catErr } = await (supabaseAdmin.from('categories') as any).insert([
    { company_id, name: 'هواتف ذكية' },
    { company_id, name: 'إكسسوارات' },
    { company_id, name: 'قطع غيار' }
  ] as any[]).select() as any

  if (catErr) {
    console.error('❌ Category Creation Error:', catErr)
    return { error: 'حدث خطأ أثناء إنشاء التصنيفات: ' + catErr.message }
  }

  // 2. Sample Products
  if (categories && categories.length > 0) {
    console.log('📦 Creating sample products...')
    const { error: prodErr } = await (supabaseAdmin.from('products') as any).insert([
      { 
        company_id, 
        category_id: (categories as any)[0].id, 
        name: 'iPhone 15 Pro', 
        sku: 'IPH-15P', 
        buy_price: 50000, 
        sell_price: 60000,
        track_inventory: true
      },
      { 
        company_id, 
        category_id: (categories as any)[1].id, 
        name: 'شاحن سريع 20W', 
        sku: 'ACC-CHG20', 
        buy_price: 300, 
        sell_price: 500,
        track_inventory: true
      }
    ] as any[])
    if (prodErr) console.error('⚠️ Product Creation Warning:', prodErr)
  }

  // 3. Sample Customer
  console.log('👤 Creating sample customer...')
  await (supabaseAdmin.from('customers') as any).insert({
    company_id,
    name: 'عميل تجريبي',
    phone: '01000000000'
  } as any)

  console.log('✨ Sample data setup complete!')
  revalidatePath('/dashboard')
  return { success: true }
}
