# 🗄️ Agent 01 — Database & Infrastructure Engineer
**المشروع:** CorePOS | **الحالة:** جاهز للتنفيذ

> ✅ **قرار D12 مُقفَل:** Supabase = **Self-Hosted**
> - URL: `https://eldrwal.tailf3555d.ts.net:8443`
> - MCP: `serverUrl: https://eldrwal.tailf3555d.ts.net:8443/mcp` (في mcp_config.json)
> - استخدم هذا الـ MCP لكل العمليات على قاعدة البيانات

---

## 🎯 مهمتك الأساسية

أنت مهندس البنية التحتية. مسؤوليتك بناء **قاعدة البيانات الكاملة على Supabase** بطريقة صحيحة من أول مرة.
لا تكتب أي كود Next.js — فقط SQL, Supabase config, وSchema.

---

## 🛠️ الـ Skills المطلوبة

```
@database-design
@database
@neon-postgres
@nextjs-supabase-auth
@security-auditor
@bash-linux
```

---

## 📋 المهام التفصيلية

### 1. إعداد Supabase Project
- [ ] إنشاء مشروع Supabase جديد باسم `corepos`
- [ ] ضبط إعدادات Auth (Email + Password فقط في البداية)
- [ ] تفعيل Row Level Security على كل الجداول
- [ ] إعداد Supabase Storage bucket: `product-images` (public, max 5MB, image/*)

### 2. تشغيل Schema الأساسي

> ⚠️ **مهم (إصلاح الثغرة 6):** لا تُشغّل الملفات الأصلية مباشرة — حوّلهم لـ migrations.
> `database_schema.sql` → `supabase/migrations/001_core_schema.sql`
> `saas_layer_schema.sql` → `supabase/migrations/002_saas_layer.sql`

**الترتيب الحاسم (لا تغيّره):**
```sql
-- 1. أولاً: 001_core_schema.sql (الجداول الأساسية)
-- يشمل الآن: invoice_sequences + next_invoice_number() + Trigger ترقيم الفواتير
-- يشمل الآن: UNIQUE INDEX على (company_id, barcode) بدلاً من UNIQUE على barcode وحده

-- 2. ثانياً: 002_saas_layer.sql (طبقة SaaS)
-- ملاحظة: Trigger إنشاء Trial تلقائي موجود هنا
```

### 3. إضافة RLS Policies الكاملة
لكل جدول في القائمة التالية، أضف policy يضمن عزل الشركات:

```sql
-- النمط الموحد المطلوب لكل جدول:
CREATE POLICY "{table}_company_isolation" ON {table}
  FOR ALL USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );
```

الجداول المطلوب تأمينها:
- `branches`, `warehouses`, `categories`, `units`
- `products`, `product_stock`, `customers`, `suppliers`, `salesmen`
- `invoices`, `invoice_items`, `payments`, `treasuries`
- `treasury_transactions`, `expenses`, `expense_categories`
- `shifts`, `backup_logs`, `usage_stats`

### 4. Seed Data الأساسي
أنشئ ملف `seed.sql` يحتوي:
- وحدات القياس الافتراضية: قطعة، كيلو، متر، لتر، علبة، كرتون
- فئات افتراضية: إلكترونيات، ملابس، أدوات، أغذية، أخرى
- فئات مصروفات: إيجار، كهرباء، مياه، رواتب، صيانة، أخرى

### 5. توليد TypeScript Types
```bash
supabase gen types typescript \
  --project-id {PROJECT_ID} \
  > src/types/database.types.ts
```

### 6. Edge Functions (اختياري — إذا احتجنا)
- Function: `send-trial-reminder` — تُرسَل عند اقتراب انتهاء التجربة
- Function: `refresh-usage-stats` — تُشغَّل يومياً بـ pg_cron

### 7. Supabase Views المطلوبة للـ Agents الأخرى
أنشئ الـ Views التالية لأنها تُستخدَم بشكل مباشر من Agent-06:
- `v_stock_report` ← موجودة في schema
- `v_daily_summary` ← موجودة في schema
- `v_invoice_profits` ← موجودة في schema
- `v_saas_overview` ← موجودة في saas_layer_schema
- `v_trials_expiring_soon` ← موجودة في saas_layer_schema

---

## ✅ النتائج المطلوبة (Deliverables)

| # | الملف/القرار | الوصف |
|---|-------------|-------|
| D1 | `supabase/.env.local` | متغيرات البيئة لقاعدة البيانات |
| D2 | `supabase/migrations/001_core_schema.sql` | السكيما الأساسية |
| D3 | `supabase/migrations/002_saas_layer.sql` | طبقة SaaS |
| D4 | `supabase/migrations/003_rls_policies.sql` | جميع RLS Policies |
| D5 | `supabase/seed.sql` | البيانات الابتدائية |
| D6 | `src/types/database.types.ts` | TypeScript types مُولَّدة تلقائياً |
| D7 | `SUPABASE_SETUP.md` | وثيقة تشرح: PROJECT_ID, URLs, Keys |

---

## ⚠️ قواعد صارمة

1. **لا تُنشئ أي ملف خارج `supabase/` أو `src/types/`**
2. **لا تُعدّل وثيقة `database_schema.sql` الأصلية — قم بإنشاء migrations منفصلة**
3. كل policy يجب أن تختبرها بـ `SET LOCAL ROLE anon;` للتحقق من العزل
4. وثّق كل قرار تقني في `SUPABASE_SETUP.md`
5. استخدم `SECURITY DEFINER` فقط للـ Functions التي تحتاجها

---

## 🔗 المراجع

- ملف السكيما: [database_schema.sql](../docs/database_schema.sql)
- طبقة SaaS: [saas_layer_schema.sql](../docs/saas_layer_schema.sql)
- Supabase MCP: متوفر عبر `@supabase/mcp-server-supabase`
