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

