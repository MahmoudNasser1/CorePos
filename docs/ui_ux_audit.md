## 🧾 UI/UX Audit — CorePOS

> هذا الملف هو السجل التنفيذي لمراجعة UI/UX.  
> **قاعدة:** لا نغيّر business logic هنا؛ فقط UX/RTL/A11y/print/perf.

---

### INV-E3-001 — نص إنجليزي ظاهر للمستخدم داخل تفاصيل المنتج
- **Severity**: 🟡 important
- **Location**: `/dashboard/inventory/products/[id]` — `src/app/(dashboard)/dashboard/inventory/products/[id]/page.tsx`
- **Current**: يظهر النص `(Min Qty)` بالإنجليزية ضمن واجهة عربية.
- **Expected**: واجهة عربية فقط (مثل: "حد الطلب الأدنى") مع اتساق المصطلحات.
- **Evidence**: مراجعة مباشرة لواجهة "معلومات المنتج الأساسية".
- **✅ Fixed**: نعم — استبدال النص إلى "حد الطلب الأدنى".

### INV-E1-001 — زر قائمة العمليات بدون وصف وصول (aria-label)
- **Severity**: 🟡 important
- **Location**: `/dashboard/inventory/products` — `src/components/inventory/ProductColumns.tsx`
- **Current**: زر أيقونة "..." بلا `aria-label` واضح، ما يصعّب استخدام قارئ الشاشة.
- **Expected**: إضافة `aria-label` عربي واضح مثل "فتح قائمة عمليات المنتج".
- **Evidence**: مراجعة كود + متطلبات A11y الأساسية.
- **✅ Fixed**: نعم — تمت إضافة `aria-label` وإخفاء الأيقونات عن قارئات الشاشة عبر `aria-hidden`.

### INV-E1-002 — تأكيد الحذف عبر `window.confirm` (تجربة/RTL/تناسق ضعيف)
- **Severity**: 🟡 important
- **Location**: `/dashboard/inventory/products` — `src/components/inventory/ProductColumns.tsx`
- **Current**: استخدام `window.confirm` برسالة عامة؛ لا يتحكم في RTL/الستايل ولا يمنع double-click بشكل واضح.
- **Expected**: حوار تأكيد متناسق مع التصميم وRTL، مع حالة "جاري الحذف..." لمنع تكرار الإرسال.
- **Evidence**: مراجعة التفاعل على صف الجدول.
- **✅ Fixed**: نعم — تم استخدام `ConfirmDialog` مع حالة تحميل "جاري الحذف...".

### SHELL-T1.4-001 — زر القائمة على الموبايل لا يفتح تنقلًا
- **Severity**: 🔴 blocker
- **Location**: `/dashboard` — `Header.tsx` + `dashboard/layout.tsx` (ملاحظة: «Mobile Navigation Placeholder»)
- **Current**: زر القائمة (`lg:hidden`) بدون سلوك؛ لا يوجد درج تنقل على الشاشات الضيقة.
- **Expected**: فتح `Sheet` من جهة الشريط الجانبي مع نفس روابط التنقل وإغلاق تلقائي بعد اختيار رابط.
- **Evidence**: مراجعة التخطيط السابق مقابل خطة `01-shell-navigation` (T1.4).
- **✅ Fixed**: نعم — `DashboardChrome` + `Sheet` + ربط الزر بـ `onOpenMobileNav`.

### SHELL-T1.1-001 — شريط جانبي طويل دون تجميع
- **Severity**: 🟡 important
- **Location**: `Sidebar.tsx` — قائمة ≥ 12 رابطًا في عمود واحد.
- **Current**: قائمة مسطحة طويلة وتزيد الجهد البصري.
- **Expected**: أقسام بعناوين فرعية `text-xs text-muted-foreground` حسب الخطة.
- **Evidence**: عد الروابط في القائمة السابقة.
- **✅ Fixed**: نعم — `dashboard-nav-items.ts` بأربعة أقسام ومشاركة البيانات مع درج الموبايل.

### SHELL-T1.5-001 — تسجيل خروج من الشريط بدون تنفيذ
- **Severity**: 🟡 important
- **Location**: `Sidebar.tsx` — زر «تسجيل الخروج» في التذييل.
- **Current**: الزر بدون `onClick` فلا ينفّذ خروجًا.
- **Expected**: نفس مسار الخروج كما في الهيدر (`POST /api/auth/logout` ثم توجيه لـ `/login`).
- **Evidence**: مراجعة الكود.
- **✅ Fixed**: نعم — ربط `handleLogout`.

### CROSS-T13.17-001 — قواعد طباعة عامة للخلفية
- **Severity**: 🟢 polish
- **Location**: `globals.css` + `print:hidden` على الهيدر/الشريط.
- **Current**: لا قواعد `@media print` للخلفية؛ كروم التطبيق قد يظهر في المعاينة حسب الصفحة.
- **Expected**: خلفية بيضاء عند الطباعة وإخفاء الهيدر/الشريط الجانبي من الطباعة.
- **Evidence**: خطة `13-cross-cutting` (T13.17).
- **✅ Fixed**: نعم — `@media print` للـ `body` + `print:hidden` على الهيدر والشريط.

### CROSS-T13.1-001 — أصناف Tailwind غير منطقية / RTL للشريط
- **Severity**: 🟢 polish
- **Location**: `Sidebar.tsx` (مثل `hover:translate-l-1` غير صالح)، وهوامش الشارة `mr-auto`، هامش المحتوى `lg:mr-72`.
- **Current**: حركة hover لا تعمل؛ هوامش فيزيائية حيث يناسب المنطقي.
- **Expected**: فئات صالحة + `ms-auto` للشارة + `lg:ps-72` لتفادي المحتوى تحت الشريط الثابت.
- **Evidence**: `grep` ومطابقة `13-cross-cutting` (T13.1–T13.2).
- **✅ Fixed**: نعم — `motion-safe:group-hover:-translate-x-0.5`، `ms-auto`، `lg:ps-72`، `border-e`.

### T1.10-001 — تحميل لوحة التحكم بدون هيكل تحميل
- **Severity**: 🟡 important
- **Location**: `src/app/(dashboard)/dashboard/loading.tsx` (غير موجود سابقًا).
- **Current**: انتقال بصري فارغ أثناء التحميل.
- **Expected**: Skeleton خفيف يشبه بطاقات اللوحة.
- **Evidence**: خطة `01-shell-navigation` (T1.10).
- **✅ Fixed**: نعم — إضافة `loading.tsx` مع `Skeleton` و`aria-busy`.

---

## المصادقة والإعداد والفوترة (02)

### AUTH-T2.3-001 — زر الدخول بدون حالة تحميل واضحة
- **Severity**: 🟡 important
- **Location**: `(auth)/login/page.tsx`
- **Current**: أيقونة دوار فقط دون نص «جاري…» ولا `aria-busy`.
- **Expected**: نص «جاري تسجيل الدخول…» + `aria-busy` + منع الإرسال المزدوج.
- **✅ Fixed**: نعم.

### AUTH-T2.4-001 — تمييز خطأ الشبكة عن بيانات الدخول
- **Severity**: 🟡 important
- **Location**: `(auth)/login/page.tsx`
- **Current**: أي فشل يُعرض كرسالة بيانات دخول فقط.
- **Expected**: «تعذّر الاتصال بالخادم…» عند فشل الشبكة؛ 401/403 كبيانات غير صحيحة.
- **✅ Fixed**: نعم — معالجة `TypeError`/fetch و`BackendApiError.status`.

### AUTH-T2.5-001 — رابط «نسيت كلمة المرور» بجانب التسمية
- **Severity**: 🟢 polish
- **Location**: تسجيل الدخول.
- **Expected**: الرابط تحت زر الإرسال (`text-sm`) حسب الخطة.
- **✅ Fixed**: نعم.

### AUTH-T2.9-001 — صياغة نجاح إعادة التعيين + عدم تسريب وجود البريد
- **Severity**: 🟡 important
- **Location**: `(auth)/forgot-password/page.tsx`
- **Expected**: صياغة محايدة (T2.9) وعدم كشف تفاصيل الخادم للمستخدم بعد الطلب.
- **✅ Fixed**: نعم — شاشة نجاح موحّدة؛ أخطاء الشبكة فقط تُعرض كخطأ.

### ONB-T2.11/12-001 — خطوات الإعداد + رجوع آمن
- **Severity**: 🟡 important
- **Location**: `onboarding/warehouse`, `sample-data`
- **Expected**: نص خطوة أوضح؛ رجوع إلى الخطوة السابقة دون فقدان السياق حيث ينطبق.
- **✅ Fixed**: نعم — روابط رجوع + تحسين نصوص الخطوات + أزرار `aria-busy` حيث يلزم.

### BILL-T2.14-001 — صفحة انتهاء الاشتراك
- **Severity**: 🟢 polish
- **Location**: `(billing)/billing/expired/page.tsx`
- **Expected**: عنوان مباشر + CTA واضح بلا «عذراً» الزائدة.
- **✅ Fixed**: نعم — تحديث العنوان والوصف و`aria-hidden` للأيقونات.

### BILL-T2.16-001 — empty state تاريخ الفوترة
- **Severity**: 🟢 polish
- **Location**: `(billing)/billing/history/page.tsx`
- **Expected**: نص يطابق دليل المنتج («لا توجد فواتير فوترة بعد»).
- **✅ Fixed**: نعم.

---

## نقطة البيع POS (04)

### POS-T4.1–T4.4 — بحث، تمييز، نفاد، تنسيق
- **Severity**: 🟡 important
- **Location**: `POSProductGrid.tsx`
- **Current**: placeholder طويل؛ لا تمييز للمطابقة؛ لا سلوك واضح لنفاد المخزون.
- **Expected**: placeholder «ابحث بالاسم أو الباركود»؛ تمييز نصي؛ بطاقة مخففة + «غير متوفر» + تعطيل النقر عند عدم التوفر.
- **✅ Fixed**: نعم — مع `formatCurrency` وعرض «متبقي» عند وجود رصيد.

### POS-T4.6 — باركود vs حقول الإدخال
- **Severity**: 🟡 important
- **Location**: `useBarcodeScanner.ts`
- **Expected**: عدم التقاط ماسح الباركود أثناء الكتابة في حقل بحث/نموذج.
- **✅ Fixed**: نعم — تجاهل الأحداث داخل `input/textarea/select/contenteditable`.

### POS-T4.7 — رسالة عدم وجود منتج
- **Severity**: 🟢 polish
- **Location**: `pos/page.tsx`
- **Expected**: «لم يُعثر على المنتج — جرّب البحث بالاسم».
- **✅ Fixed**: نعم.

### POS-T4.8–T4.10 — سلة وعملة
- **Severity**: 🟡 important
- **Location**: `POSCart.tsx`، `posStore.ts`
- **Expected**: نسخة سلة فارغة من الدليل؛ منع تجاوز المخزن + toast؛ `formatCurrency` + `tabular-nums`.
- **✅ Fixed**: نعم — حد أقصى للكمية من `stock` في المتجر.

### POS-T4.14–T4.17 — دفع
- **Severity**: 🔴 blocker (double-submit)
- **Location**: `PaymentModal.tsx`
- **Current**: شرط `disabled` خاطئ بسبب أسبقية العوامل؛ طباعة تلقائية؛ عنوان عام.
- **Expected**: «دفع الفاتورة»؛ منع النقر المزدوج + `aria-busy`؛ رسائل خطأ عربية؛ لا طباعة إجبارية.
- **✅ Fixed**: نعم — إصلاح الشرط، إزالة `window.print` التلقائي، حارس `isProcessing`، نص «جاري تسجيل البيع…».

### POS-T4.18 — نجاح البيع
- **Severity**: 🟡 important
- **Location**: `PaymentModal.tsx`
- **Expected**: رقم فاتورة بخط بارز + «فاتورة جديدة» و«طباعة».
- **✅ Fixed**: نعم — `text-2xl tabular-nums` لرقم الفاتورة.

### POS-T4.21 — طباعة: إخفاء واجهة POS
- **Severity**: 🟡 important
- **Location**: `pos/page.tsx`
- **Expected**: المعاينة تعرض الإيصال دون كروم الشاشة.
- **✅ Fixed**: نعم — `print:hidden` على حاوية الشاشة الرئيسية.

### POS-T4.23–T4.24 — سلال معلقة
- **Severity**: 🟡 important
- **Location**: `HeldCartsModal.tsx`
- **Expected**: تأكيد حذف بصياغة «سيتم حذف السلة نهائيًا»؛ إصلاح `onOpenChange` للحوار.
- **✅ Fixed**: نعم — `AlertDialog` + `formatCurrency` + زر «استئناف».

### POS-T4.20 — إيصال
- **Severity**: 🟢 polish
- **Location**: `POSReceipt.tsx`
- **Expected**: عربية فقط في التذييل؛ أرقام `tabular-nums`؛ `formatCurrency`.
- **✅ Fixed**: نعم — إزالة نصوص إنجليزية ظاهرة.

