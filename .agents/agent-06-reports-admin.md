# 📊 Agent 06 — Reports, Dashboard & Super Admin Engineer
**المشروع:** CorePOS | **الحالة:** يبدأ بعد Agent-03 (موازي مع Agent-04 و05)

---

## 🎯 مهمتك الأساسية

أنت مهندس الذكاء والتقارير. مسؤوليتك بناء **Dashboard الرئيسي + 8 تقارير + Super Admin Panel + الإعدادات**.

---

## 🛠️ الـ Skills المطلوبة

```
@claude-d3js-skill
@react-patterns
@react-component-performance
@database
@tanstack-query-expert
@senior-fullstack
```

---

## 📋 المهام التفصيلية

### MODULE A: Dashboard الرئيسي `/dashboard`

#### A1. KPI Cards (الصف الأول)
```typescript
// src/components/dashboard/KPIGrid.tsx
// 5 كروت:
// 1. مبيعات اليوم (مقارنة بالأمس: +12%)
// 2. أرباح اليوم (مع هامش: 23%)
// 3. عدد الفواتير اليوم
// 4. رصيد الخزينة (real-time)
// 5. تنبيهات مخزون (عدد الأصناف المنخفضة)

// كل كارت يعرض:
// - القيمة الرئيسية (كبيرة)
// - مقارنة بالأمس/الأسبوع (سهم أخضر/أحمر)
// - أيقونة مميزة

// استخدم Supabase Realtime للخزينة (subscription)
```

#### A2. رسم بياني المبيعات (الصف الثاني)
```typescript
// src/components/dashboard/SalesChart.tsx
// مكتبة: recharts (AreaChart)
// يعرض: مبيعات آخر 7 أيام
// مع: مقارنة بالأسبوع السابق (خطان)
// تفاعلي: hover يعرض التفاصيل
// RTL-aware axis

// Data source: View v_daily_summary في Supabase
```

#### A3. الصف الثالث (جانبان)
```typescript
// اليسار: آخر 5 فواتير (جدول مبسط)
//   رقم | عميل | الإجمالي | الحالة | زر عرض
//   مع link → /dashboard/sales/invoices/[id]

// اليمين: أصناف على وشك النفاد
//   صنف | الكمية الحالية | الحد الأدنى
//   مع link → /dashboard/inventory/products/[id]
```

---

### MODULE B: التقارير `/dashboard/reports`

#### المكونات المشتركة للتقارير

```typescript
// src/components/reports/ReportFilters.tsx
// فلاتر قياسية لكل التقارير:
// - DateRange Picker (من/إلى) مع اختصارات
// - تجميع حسب (Grouping) — يختلف لكل تقرير
// - فرع / مخزن (إذا كان Admin)
// - زر "تطبيق" + زر "تصفير"

// src/components/reports/ReportTable.tsx
// جدول تقرير قابل للتصدير
// Props: columns, data, totals, exportFilename

// src/hooks/useReport.ts
// Generic hook للتقارير:
// useReport(reportType, filters) → {data, isLoading, export}
```

#### B1. الحركة اليومية `/dashboard/reports/daily`
```
ملخص يومي شامل:
┌──────────────────────────────────────────────────────┐
│ التاريخ: [اليوم ▼]          الفرع: [الكل ▼]         │
├──────────────────────────────────────────────────────┤
│ إجمالي المبيعات:    45,200 ج │ عدد الفواتير:    23  │
│ إجمالي المرتجعات:   1,200 ج │ عدد العملاء:      18 │
│ إجمالي المشتريات:  12,000 ج  │ صافي الربح:   8,300ج │
│ إجمالي المصروفات:   2,500 ج │ هامش الربح:     18% │
│ مقبوضات:           40,000 ج │ مدفوعات:       10,000ج│
├──────────────────────────────────────────────────────┤
│ التفصيل بالفواتير:                                    │
│ [جدول بكل فواتير اليوم]                              │
└──────────────────────────────────────────────────────┘
```

#### B2. تحليل المبيعات `/dashboard/reports/sales-analysis`
```typescript
// تجميع حسب: [صنف ▼] [عميل] [مندوب] [فئة] [فرع]
// فترة: من/إلى مع اختصارات
// الجدول: المجموعة | الكمية | المبيعات | التكلفة | الربح | الهامش%
// رسم بياني: Bar chart أو Pie chart
// تصدير Excel
```

#### B3. تقرير الأرباح `/dashboard/reports/profits`
```typescript
// يعتمد على: View v_invoice_profits في DB
// يعرض: ربح كل فاتورة + ربح كل صنف
// مجموع + متوسط هامش الربح
// تصفية: يمكن إخفاء التكاليف من الـ Manager (plan limits)
```

#### B4. بضاعة المخزن `/dashboard/reports/stock`
```typescript
// يعتمد على: View v_stock_report في DB
// جدول: الصنف | الفئة | الكمية | التكلفة المتوسطة | قيمة المخزون | المخزن
// ملون: أخضر = طبيعي, أصفر = منخفض, أحمر = نافد
// إجمالي قيمة المخزون في الأسفل
// تصدير Excel
```

#### B5. حركة الصنف `/dashboard/reports/product-movement`
```typescript
// يختار صنف (searchable select)
// الفترة: من/إلى
// يعرض:
// التاريخ | نوع الحركة | الكمية | الرصيد بعد | الفاتورة | الطرف
// نوع الحركة: مبيعات، مشتريات، مرتجع، جرد، تحويل
```

#### B6. أرصدة العملاء `/dashboard/reports/customer-balances`
```typescript
// جدول: العميل | الرصيد | آخر معاملة | تليفون
// الرصيد: أحمر = مدين, أخضر = دائن
// زر: كشف حساب تفصيلي → /dashboard/customers/[id]
// إجمالي المديونيات في الأسفل
// تصدير Excel
```

#### B7. أرصدة الموردين `/dashboard/reports/supplier-balances`
- نفس B6 لكن للموردين

#### B8. حركة الخزينة `/dashboard/reports/treasury-movement`
```typescript
// يختار الخزينة (إذا أكثر من واحدة)
// الفترة: من/إلى
// جدول: التاريخ | الوصف | وارد | صادر | الرصيد التراكمي
// إجمالي الوارد، إجمالي الصادر، الرصيد الختامي
```

---

### MODULE C: الإعدادات `/dashboard/settings`

#### C1. بيانات الشركة
- تعديل: اسم، شعار (upload)، عنوان، تليفون، رقم ضريبي، عملة، نسبة ضريبة
- شعار يُرفع إلى Supabase Storage

#### C2. الفروع والمخازن
- CRUD الفروع (اسم، عنوان، تليفون)
- CRUD المخازن (اسم، الفرع)
- تحذير عند المحاولة التجاوز الحد (plan limits)

#### C3. المستخدمون
- جدول المستخدمين (الاسم، الدور، الفرع، نشط/غير نشط)
- إضافة مستخدم جديد → Supabase Invite Email
- تعديل الدور والفرع
- تعطيل/تفعيل (لا حذف نهائي)
- تحذير عند المحاولة التجاوز الحد

#### C4. إعدادات الطباعة
- اختيار حجم الورق (80mm / A4)
- شعار في الفاتورة (على/إيقاف)
- نص مخصص أسفل الإيصال (شكراً لزيارتكم...)
- معاينة الإيصال

#### C5. النسخ الاحتياطية (P1)
- زر "نسخ احتياطي الآن" → تصدير JSON لكل بيانات الشركة
- جدول آخر النسخ + رابط تحميل

---

### MODULE D: Super Admin Panel `/super-admin`

#### D1. Overview `/super-admin`
```typescript
// KPIs المنصة:
// - إجمالي الشركات | نشطة | تجريبية | منتهية
// - إيرادات هذا الشهر | متوقع آخر الشهر
// - 5 اشتراكات تنتهي قريباً (نافذة تنبيه)
// - رسم بياني: اشتراكات جديدة + إيرادات (آخر 6 شهور)
```

#### D2. قائمة الشركات `/super-admin/companies`
```typescript
// جدول: الشركة | البريد | الخطة | الحالة | التاريخ
// فلاتر: خطة، حالة اشتراك
// بحث: اسم أو بريد
// Modal تفاصيل + إجراءات:
//   - تغيير الخطة يدوياً
//   - تمديد التجربة
//   - تعطيل الحساب
//   - تسجيل دفعة يدوية
```

#### D3. إدارة الاشتراكات `/super-admin/subscriptions`
- جدول كل الاشتراكات + حالتها
- تسجيل دفعة يدوية → يحدث `billing_history` + `subscriptions`

#### D4. الإيرادات `/super-admin/billing`
- تقرير الإيرادات الشهرية (رسم بياني)
- جدول كل المعاملات

---

## ✅ النتائج المطلوبة (Deliverables)

| # | الملف | الوصف |
|---|-------|-------|
| D1 | `src/app/(dashboard)/page.tsx` | Dashboard الرئيسي |
| D2 | `src/components/dashboard/*.tsx` | مكونات Dashboard |
| D3 | `src/app/(dashboard)/reports/**` | كل صفحات التقارير |
| D4 | `src/components/reports/*.tsx` | مكونات التقارير |
| D5 | `src/app/(dashboard)/settings/**` | كل صفحات الإعدادات |
| D6 | `src/app/(super-admin)/**` | Super Admin Panel |
| D7 | `src/hooks/useReport.ts` | Generic report hook |
| D8 | `src/lib/actions/reports.ts` | Server Actions للتقارير |
| D9 | `src/lib/actions/settings.ts` | Server Actions الإعدادات |
| D10 | `src/lib/excel-export.ts` | تصدير Excel بـ SheetJS |

---

## ⚠️ قواعد صارمة

1. **كل المبالغ في التقارير للقراءة فقط** — لا إجراء من صفحة تقرير
2. **التقارير تستخدم Views من DB** — لا queries معقدة في الـ frontend
3. **Super Admin يستلزم `platform_admins` role** — تحقق في middleware
4. **Cashier لا يرى التكاليف والأرباح** — استخدم plan + role check
5. Dashboard يُحدَّث كل 60 ثانية (interval) أو بـ Realtime لرصيد الخزينة

---

## 🔗 تعتمد على

- Agent-01: Views في DB (`v_daily_summary`, `v_stock_report`, `v_invoice_profits`, `v_saas_overview`)
- Agent-02: authStore (للتحقق من الصلاحيات)
- Agent-03: StatCard, DataTable, ExportButton, shared components
