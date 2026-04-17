# 📋 CorePOS — Decision Log (سجل القرارات الرسمي)
> آخر تحديث: 17 أبريل 2026 | حالة: مُقفَل للتنفيذ ✅

---

## القرارات المُقفَلة (لا تُعاد مناقشتها)

### D1 — اسم المشروع
- **القرار:** CorePOS
- **السبب:** محمود قرر

---

### D2 — Tech Stack
- **القرار:** Next.js 15 (App Router) + Supabase (PostgreSQL + Auth + Storage)
- **البدائل التي رُفضت:** Laravel+React (تعقيد أكبر)، Firebase (غير مناسب للبيانات المالية)
- **السبب:** سرعة تطوير عالية، RLS مدمج، Auth جاهز، Realtime مجاني

---

### D3 — Multi-Tenancy Model
- **القرار:** Shared Database + Row Level Security (company_id في كل جدول)
- **البديل المرفوض:** Schema منفصل لكل شركة (تعقيد عالي جداً في Supabase)
- **السبب:** أسهل في التطوير والصيانة، RLS يتولى العزل تلقائياً

---

### D4 — UI Framework
- **القرار:** shadcn/ui + Tailwind CSS v4 + خط Cairo (Google Fonts)
- **السبب:** RTL جاهز، مكونات احترافية، سرعة تطوير

---

### D5 — تقسيم العمل
- **القرار:** 6 Agents متخصصة بفصل صارم للمسؤوليات
- **التسلسل:** 01 → (02 ‖ 03) → (04 ‖ 05 ‖ 06)

---

### D6 — رقم الفاتورة ✅ محسوم اليوم
- **القرار:** `YYMM-NNN` (مثال: `2604-001` لأول فاتورة في أبريل 2026)
- **البدائل التي رُفضت:**
  - `1، 2، 3` — بسيط لكن لا يشير للتاريخ
  - `INV-2026-00001` — طويل جداً للطباعة 80mm
- **التطبيق التقني:**
  - جدول `invoice_sequences` (company_id, type, year_month, last_number)
  - Function `next_invoice_number()` — atomic، thread-safe
  - Trigger `assign_invoice_number` — يُفعَّل عند الانتقال من `draft` إلى `confirmed`
  - رقم المسودة = NULL (لا يُحجز رقم للمسودات)

---

### D7 — Barcode & SKU Uniqueness ✅ مُصلَح اليوم
- **القرار:** `UNIQUE(company_id, barcode)` — فريد داخل الشركة فقط
- **السبب:** نفس الباركود EAN-13 (مثل Samsung A15) يُباع في آلاف المحلات المختلفة
- **التطبيق:** `CREATE UNIQUE INDEX` بشرط `WHERE barcode IS NOT NULL`

---

### D8 — Offline Mode في MVP
- **القرار:** ❌ خارج نطاق MVP كلياً
- **السبب:** تعقيد معماري ضخم يؤثر على كل وحدة البيع
- **المرحلة الثانية:** PWA + IndexedDB + Background Sync (بعد MVP)
- **التأثير على Agent-04:** POS يعمل online فقط، لكن يُبنى بـ optimistic UI

---

### D9 — طريقة الدفع للـ SaaS (Billing) في MVP
- **القرار:** يدوي بالكامل
  - العميل يدفع (تحويل / فوري)
  - يُبلّغ يدوياً (WhatsApp / تليفون)
  - Super Admin يُسجّل الدفعة في `/super-admin/subscriptions`
  - النظام يُحدّث الاشتراك تلقائياً
- **المرحلة الثانية:** ربط Paymob أو Fawry
- **التأثير على Agent-02:** يبني صفحة `/billing/upgrade` بـ "اتصل بنا" أو "واتساب" بدل نموذج دفع

---

### D10 — طباعة 80mm ✅ محسوم اليوم
- **القرار:** CSS + `window.print()` فقط (بدون مكتبات خارجية)
  ```css
  @media print {
    @page { size: 80mm auto; margin: 2mm; }
    body { width: 76mm; font-size: 11px; }
  }
  ```
- **يعمل على:** Chrome + Edge + Firefox على Windows/Mac
- **إعداد الطابعة:** صاحب المحل يضبط حجم الورق في Windows Printer Settings
- **البديل المرفوض:** `@point-of-sale/react-thermal-printer` يحتاج Electron
- **التأثير على Agent-04:** لا تحتاج مكتبة طباعة خارجية

---

### D11 — الشيفت (نوبة العمل) في MVP
- **القرار:** اختياري تماماً — Cashier يبيع بدون فتح شيفت
- **المرحلة الثانية:** إجبار فتح شيفت + تقارير الشيفت
- **التأثير على Agent-04:** شاشة POS تعمل بدون `shift_id` المطلوب، يكون nullable

---

### D12 — بيئة Supabase 🔴 مفتوح — ينتظر قرار محمود
- **الخيارات:**
  - أ) Cloud فقط → `supabase.com`
  - ب) Self-Hosted فقط → `eldrwal.tailf3555d.ts.net`
  - ج) Self-Hosted للتطوير + Cloud للـ Production
- **التأثير:** Agent-01 يحتاج هذا القرار أولاً

### D13 — الأرقام والتواريخ ✅ محسوم اليوم
- **القرار:** أرقام غربية `1234` + تاريخ ميلادي فقط
- **التفصيل:**
  - `numberingSystem: 'latn'` في كل `Intl.NumberFormat` و `Intl.DateTimeFormat`
  - تنسيق العملة: `1,200.50 ج.م` (بالأرقام الغربية)
  - تنسيق التاريخ: `18/04/2026` (dd/MM/yyyy)
  - لا أرقام عربية هندية `١٢٣٤` في أي مكان
  - لا تاريخ هجري في MVP
- **الدوال الجاهزة:** موجودة في `src/lib/utils.ts` (يبنيها Agent-03)

---

## الافتراضات المُقرَّة

| # | الافتراض | الحالة |
|---|----------|--------|
| A1 | المستخدم يعمل على Desktop browser (Chrome/Edge) | ✅ مؤكد |
| A2 | Tablet (768px) مدعوم — Smartphone مستبعد من MVP | ✅ مؤكد |
| A3 | اللغة: عربي RTL 100% — لا إنجليزي في الواجهة | ✅ مؤكد |
| A4 | العملة الافتراضية: جنيه مصري (EGP) | ✅ مؤكد |
| A5 | لا Offline في MVP | ✅ مؤكد |
| A6 | الشيفت اختياري في MVP | ✅ مؤكد |
| A7 | الفوترة اليدوية في MVP (لا Paymob في المرحلة الأولى) | ✅ مؤكد |
| A8 | طباعة 80mm بـ CSS window.print() فقط | ✅ مؤكد |

---

## الثغرات المُغلقة اليوم

| # | الثغرة | الحل المُطبَّق |
|---|--------|--------------|
| G1 | رقم الفاتورة | YYMM-NNN + invoice_sequences + Trigger |
| G2 | Barcode Global Unique | UNIQUE INDEX (company_id, barcode) |
| G3 | Offline Mode | خارج MVP — مرحلة ثانية |
| G4 | بوابة الدفع SaaS | يدوي في MVP، Super Admin يُقر |
| G5 | SKU Global Unique | UNIQUE INDEX (company_id, sku) |
| G6 | Migration vs Full Schema | Agent-01 يحوّل الملفات لـ migrations منفصلة |
| G8 | الشيفت في MVP | اختياري، shift_id nullable في invoices |
| G9 | طباعة 80mm | CSS + window.print() فقط |

---

## 🔴 القرار الوحيد المتبقي

> **D12 — Supabase: Cloud أم Self-Hosted؟**
> يا محمود، لما تقرر، قولي وهنبدأ Agent-01 فوراً.
