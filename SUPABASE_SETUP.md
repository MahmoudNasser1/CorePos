# إعدادات Supabase للمشروع (CorePOS)

هذه الوثيقة تحتوي على الإعدادات الخاصة بمشروع Supabase للوصول السريع والتوثيق.

## 1. معلومات الخادم (Self-Hosted)
- **الرابط (URL):** `https://eldrwal.tailf3555d.ts.net:8443`
- **MCP Server URL:** `https://eldrwal.tailf3555d.ts.net:8443/mcp`
- **اسم المشروع:** `corepos`

## 2. المفاتيح الخاصة بالبيئة (Environment Variables)

تحتاج لإضافة الملف `supabase/.env.local` في المجلد `supabase/` إذا كنت تنفذ أوامر `supabase cli`، ويحتوي على:
```env
SUPABASE_URL="https://eldrwal.tailf3555d.ts.net:8443"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
*(تم تفويض المسؤولية بوضع المفاتيح الحقيقية للمطور).*

كذلك يجب إضافة هذه المتغيرات إلى مشروع Next.js في ملف `.env.local` الرئيسي في جذر المشروع.

## 3. إعداد الـ Storage
- **البكت (Bucket):** `product-images`
- **النوع:** Public
- **الحجم المسموح به (Max Size):** 5MB
- **أنواع الملفات المسموحة (Allowed MIME Types):** `image/*`

*(يُرجى إنشاء الـ Bucket يدوياً من لوحة تحكم Supabase الخاص بك أو عن طريق السكربتات المخصصة إذا لم يكن موجوداً).*

## 4. إعداد الـ Auth
- تفعيل التسجيل بـ Email & Password فقط كبداية.
- إطفاء Email Confirmations أثناء بيئة التطوير والاختبار.
- **مستخدم الاختبار (لشحن بيانات Seed):** 
  - الإيميل: `test@corepos.app`
  - كلمة المرور: `Test@1234`
  *(من الضروري إنشاء المستخدم من واجهة Supabase Dashboard ولصق معرف المستخدم UUID في ملف `seed.sql` لتقوم الحزمة التجريبية بالعمل بكفاءة).*

## 5. قواعد العزل (RLS Policies)
- تم بناء وتجهيز العزل بنجاح في `003_rls_policies.sql` باستخدام مفتاح `company_id` بشكل مباشر أو عن طريق Join (الربط). 
- يتم عزل المستخدمين باستخدام `id` في جدول `profiles` لمعرفة الشركة التي ينتمي إليها.
