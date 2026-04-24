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

### SHELL-O1-001 — بطاقة «خطة النمو» وتنبيهات وهمية في الهيكل
- **Severity**: 🟡 important
- **Location**: `Sidebar.tsx` (تذييل)،`Header.tsx` (جرس التنبيهات)
- **Current**: أرقام ونسب وقائمة تنبيهات تجريبية قد تُفهم كبيانات حقيقية.
- **Expected**: نصوص صادقة أو حالة فارغة + رابط واضح للاشتراك؛ لا شارة عدد مزيفة.
- **Evidence**: خطة `01-shell-navigation` (الشريط فهرس لا لوحة معلومات) + مبادئ عدم تضليل المستخدم.
- **✅ Fixed**: نعم — استبدال التذييل ببطاقة «الاشتراك والفوترة» مع زر إلى `/billing`؛ قائمة التنبيهات بحالة فارغة عربية؛ إزالة الشارة العددية الوهمية؛ `toast` عند فشل تسجيل الخروج من الشريط/الهيدر؛ زيادة `pb` داخل منطقة التمرير للتنقل.

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

### ONB-O2-001 — مؤشر تقدّم موحّد في الإعداد + عربية الفوترة
- **Severity**: 🟡 important
- **Location**: `(onboarding)/layout.tsx`، صفحات `company` / `warehouse` / `sample-data`، `(billing)/billing/page.tsx`، `billing/expired/page.tsx`
- **Current**: نص «الخطوة X من 3» مكرر داخل كل صفحة فقط؛ رمز «∞» في بطاقة الاستخدام؛ صفحة انتهاء الاشتراك بلا رابط ترقية صريح؛ تسجيل خروج بلا تغذية راجعة عند الفشل.
- **Expected**: شريط/عناوين تقدّم مشتركة (T2.11)؛ واجهة عربية دون رموز غير عربية بارزة؛ CTA ترقية بجانب التواصل؛ `toast` عند فشل الخروج.
- **Evidence**: خطة `02-auth-onboarding-billing.md` (T2.11، T2.14، G3 عربية).
- **✅ Fixed**: نعم — `OnboardingProgress` في الـ layout مع `dir="rtl"`؛ اختصار أوصاف الخطوات لتفادي التكرار؛ `aria-hidden` للأيقونات الزخرفية؛ «غير محدود» بدل ∞؛ زر «عرض خطط الاشتراك والترقية» إلى `/billing/upgrade`؛ أزرار إرسال بالمصادقة بـ `gap-2`.

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

### POS-O4-001 — تخطيط لوحي/موبايل، هيدر صادق،تحميل الشبكة، RTL دفع
- **Severity**: 🟡 important
- **Location**: `pos/page.tsx`، `POSHeader.tsx`، `POSProductGrid.tsx`، `PaymentModal.tsx`، `POSCart.tsx`، `CustomerSelect.tsx`
- **Current**: سلة بعرض ثابت يضيق على الشاشات الصغيرة؛ شارة شيفت وهمية وإيموجي/إنجليزي في الهيدر؛ لا حالة تحميل أثناء جلب المنتجات؛ زر تأكيد الدفع بلا مؤشر دوران؛ تسمية إجمالي بصيغة ثقيلة تنافس المبلغ.
- **Expected**: عمود مكدس ثم صف عند `lg`؛ نصوص عربية فقط في الواجهة؛ skeleton للشبكة؛ `dir="rtl"` في حوار الدفع؛ تمييز بصري أوضح للمبلغ الواحد البارز (T4.10).
- **Evidence**: خطة `04-pos.md` (T4.5، T4.10، T4.14–T4.16، T4.25، T4.27).
- **✅ Fixed**: نعم — `flex-col` + ارتفاعات مرنة للسلة/الشبكة؛ إزالة الشيفت الوهمي والإيموجي؛ «جلسة بيع» + تلميح `Ctrl+K`؛ شارة العدد بـ `end`؛ وقت `ar-EG`؛ أزرار عربية كاملة؛ skeleton أثناء `getPOSProducts`؛ `Loader2` + `dir="rtl"` في الدفع؛ تخفيف تسمية «الإجمالي»؛ `aria-label` للعميل وللثيم وللعودة؛ حقل بحث العميل بـ placeholder عربي موحّد.

---

## المخزون Inventory (05)

### INV-T5.1–T5.2 — فلاتر + جدول
- **Severity**: 🟡 important
- **Location**: `ProductsTableWithFilter.tsx`, `DataTable.tsx`
- **Expected**: بحث + فلتران (فئة، حالة مخزون)؛ تمرير أفقي + `min-w` للجدول؛ رأس مميّز بصريًا.
- **✅ Fixed**: نعم — فلترا فئة/مخزون مع ثابت `INVENTORY_LOW_STOCK_THRESHOLD`؛ `min-w-[720px]`؛ رأس بخلفية `muted`.

### INV-T5.3–T5.4 — أعمدة وعتبة مخزون
- **Severity**: 🟡 important
- **Location**: `ProductColumns.tsx`, `src/lib/inventory-ui.ts`
- **Expected**: `tabular-nums` للمبالغ؛ عتبة موثّقة ≤5 للشارة الحمراء.
- **✅ Fixed**: نعم — ثابت مشترك مع إعادة تصديره من أعمدة المنتجات.

### INV-T5.6 — قائمة فارغة
- **Severity**: 🟡 important
- **Location**: `DataTable.tsx`
- **Expected**: نسخة عربية + زر «إضافة منتج».
- **✅ Fixed**: نعم — `emptyState` اختياري مع رابط للإضافة.

### INV-T5.7–T5.10 — نموذج المنتج
- **Severity**: 🟡 important
- **Location**: `ProductForm.tsx`
- **Expected**: عنوان «المخزون والحدود»؛ `inputMode="decimal"`؛ شريط حفظ سفلي مع `aria-busy`.
- **✅ Fixed**: نعم.

### INV-T5.11–T5.13 — تفاصيل المنتج
- **Severity**: 🟡 important
- **Location**: `products/[id]/page.tsx`
- **Expected**: منطق مخزون منخفض متسق مع العتبة/حد إعادة الطلب؛ `formatCurrency`؛ خط زمني RTL أوضح.
- **✅ Fixed**: نعم — `reorderPoint` من `min_qty` أو الثابت 5؛ `border-e`/`text-end`؛ أزرار `aria-label`/`aria-hidden`.

### INV-O5-001 — فلاتر عربية، قوائم فئات/وحدات، منع تسرّب إنجليزي
- **Severity**: 🟡 important
- **Location**: `ProductsTableWithFilter.tsx`، `ProductColumns.tsx`، `products/page.tsx`، `categories/page.tsx`، `units/page.tsx`
- **Current**: رمز ≤ في فلتر المخزون؛ أزرار «إضافة فئة/وحدة» بلا سلوك واضح؛ تعيين `short_name` من `nameEn` قد يعرض إنجليزيًا؛ قوائم `…` بلا `aria-label`؛ أيقونات رؤوس بلا `aria-hidden`.
- **Expected**: نص عربي للعتبة؛ أزرار معطّلة مع `title` عند غياب المسار؛ حقول عربية فقط؛ وصولية للقوائم المنسدلة.
- **Evidence**: خطة `05-inventory.md` (T5.1، T5.5، T5.6، عربية الواجهة).
- **✅ Fixed**: نعم — «منخفض (حتى N قطعة)»؛ `emptyState` للفئات/الوحدات؛ `aria-label` + `aria-hidden`؛ تعطيل إضافة فئة/وحدة مع توضيح؛ `short_name` من حقول عربية/رمزية فقط؛ زر إضافة منتج بـ `Button asChild`؛ `tabular-nums` لعمود الترتيب؛ إزالة `me-` الزائدة من عناصر قائمة المنتج.

---

## المبيعات والفواتير Sales (06)

### SAL-T6.1–T6.2 — فلاتر وجدول
- **Severity**: 🟡 important
- **Location**: `InvoiceTable.tsx`, `DataTable.tsx`
- **Expected**: تاريخ من/إلى + حالة + بحث؛ رأس جدول أوضح؛ ترقيم صفحات بصيغة عربية؛ إخفاء شريط بحث مكرر عند فلاتر خارجية.
- **✅ Fixed**: نعم — صف فلاتر ديسكتوب + Sheet موبايل؛ `DataTable` بـ `showToolbar={false}` و`showPagination` مع «الصفحة X من Y»؛ رأس `sticky` مع `backdrop-blur`.

### SAL-T6.3–T6.4 — شارات وحالة فارغة
- **Severity**: 🟡 important
- **Location**: `InvoiceStatusBadge.tsx`, `InvoiceTable.tsx`
- **Expected**: شارات `default`/`secondary`/`destructive`/`outline` حسب الحالة؛ قائمة فارغة عربية + زر إنشاء حسب نوع المستند.
- **✅ Fixed**: نعم — `InvoiceStatusBadge` بدل قيم غير مدعومة في `StatusBadge`؛ `emptyState` ديناميكي (مبيعات/مشتريات/عروض/أوامر/مرتجعات).

### SAL-T6.6–T6.9 — نموذج الفاتورة
- **Severity**: 🟡 important
- **Location**: `InvoiceForm.tsx`, `ProductSearchInput.tsx`
- **Expected**: زر «إضافة بند»؛ بحث منتجات أخف؛ ملخص `bg-muted/40`؛ رسائل تحقق عربية؛ إجمالي قبل/بعد ضريبة بلا ازدواجية.
- **✅ Fixed**: نعم — فتح منتقي المنتجات من الزر؛ `useDeferredValue` + `shouldFilter={false}`؛ `formatCurrency` و`inputMode="decimal"`؛ رسائل زود محدثة.

### SAL-T6.10–T6.11 — تفاصيل فاتورة المبيعات
- **Severity**: 🟡 important
- **Location**: `sales/invoices/[id]/page.tsx`, `PrintPageButton.tsx`
- **Expected**: عنوان هرمي واضح؛ طباعة من عميل دون `window` في RSC.
- **✅ Fixed**: نعم — `PageHeader` بعنوان «فاتورة مبيعات» وفرعية بالرقم والتاريخ والعميل؛ `PrintPageButton` عميل.

### SAL-T6.13–T6.15 — طباعة A4 والتخطيط
- **Severity**: 🟡 important
- **Location**: `InvoicePrint.tsx`, `DashboardChrome.tsx`
- **Expected**: حدود أقسام؛ تقليل قطع الصفوف؛ طباعة بلا إزاحة شريط جانبي.
- **✅ Fixed**: نعم — حدود وجداول أوضح؛ `page-break-inside: avoid` للصفوف؛ `print:ps-0`؛ تذييل عربي دون اسم منتج أجنبي.

### SAL-T6.16–T6.17 — دفع
- **Severity**: 🟡 important
- **Location**: `InvoicePaymentDialog.tsx`
- **Expected**: المتبقي تحت المبلغ بصيغة واضحة؛ toast عربي؛ تحديث الصفحة بعد النجاح.
- **✅ Fixed**: نعم — `formatCurrency`؛ «تم تسجيل الدفع»؛ `router.refresh()`.

### SAL-T6.18–T6.19 — عروض الأسعار
- **Severity**: 🟢 polish
- **Location**: `InvoiceTable.tsx`, `quotations/page.tsx`
- **Expected**: «إصدار فاتورة» مع تأكيد؛ عنوان عربي دون لقب إنجليزي في العنوان.
- **✅ Fixed**: نعم — `AlertDialog` RTL قبل التحويل/الإلغاء (استبدال `confirm`)؛ عنوان عربي دون `(Quotations)`.

### SAL-T6.20 — بيع جديد مقابل POS
- **Severity**: 🟢 polish
- **Location**: `sales/new/page.tsx`
- **Expected**: جملة `text-sm text-muted-foreground` توضح الفرق عن نقطة البيع.
- **✅ Fixed**: نعم — صندوق توضيحي مع رابط إلى `/dashboard/pos` وفق نسخة الخطة.

### SAL-O6-001 — تسجيل دفع أقوى + رؤوس صفحات موحّدة
- **Severity**: 🟡 important
- **Location**: `InvoicePaymentDialog.tsx`، `sales/new/page.tsx`، `quotations/new/page.tsx`، `returns/new/page.tsx`
- **Current**: المتبقي أسفل حقل المبلغ فقط؛ إمكانية إغلاق الحوار أثناء الإرسال؛ زر تأكيد بلا `aria-busy`/دوران؛ صفحات عرض سعر/مرتجع بعنوان `h2` غير موحّد مع باقي المبيعات.
- **Expected**: صندوق متبقي بارز (T6.16)؛ منع الإغلاق أثناء `pending`؛ تعطيل الحقول؛ `PageHeader` لمسارات الإنشاء.
- **Evidence**: خطة `06-sales.md` (T6.16–T6.17، T6.20، هرمية العناوين).
- **✅ Fixed**: نعم — بطاقة «المتبقي على الفاتورة»؛ `onOpenChange` يحترم التحميل؛ حقول معطّلة + `Loader2` و`aria-busy`؛ نص «سقف هذا الحقل» للمبلغ؛ `PageHeader` لعرض السعر والمرتجع؛ تحسين نسخة صفحة فاتورة جديدة ورابط POS.

---

## الخزينة والمالية Finance (08)

### FIN-T8.1–T8.4 — أرصدة وحركات وفلترة
- **Severity**: 🟡 important
- **Location**: `TreasuryList.tsx`, `TreasuryTransactionsPanel.tsx`, `TreasuryTable.tsx`, `finance/treasury/page.tsx`, `finance/treasuries/page.tsx`
- **Expected**: رصيد بارز `tabular-nums`؛ جدول حركات بأعمدة واضحة؛ فلتر تاريخ؛ نص فارغ عربي؛ إزالة `"use server"` من صفحة قائمة الخزائن.
- **✅ Fixed**: نعم — `CurrencyDisplay` بحجم `text-2xl` لرصيد الخزينة؛ لوحة «من/إلى» بنمط تقارير مبسّط؛ أعمدة وارد/صادر بدل ألوان مزدوجة على كل سطر؛ `emptyState`؛ `PageHeader` لقائمة الخزائن.

### FIN-T8.5–T8.8 — سندات قبض/صرف
- **Severity**: 🟡 important
- **Location**: `VoucherForm.tsx`
- **Expected**: مبلغ `tabular-nums` واتجاه LTR للحقل؛ خزينة تظهر بعد التحميل؛ طرف combobox؛ تعطيل + «جاري التسجيل…»؛ رسائل خطأ عربية موحّدة.
- **✅ Fixed**: نعم — `Popover`+`Command` للعميل/المورد؛ `Select` بقيمة متحكم بها؛ تحقق `superRefine`؛ toast فشل موحّد.

### FIN-T8.11–T8.12 — مصروفات
- **Severity**: 🟡 important
- **Location**: `ExpenseForm.tsx`, `finance/expenses/page.tsx`
- **Expected**: قائمة بمبالغ متسقة؛ تصنيف إلزامي في النموذج؛ عدم إرباك بألوان زائدة؛ نص فارغ واضح.
- **✅ Fixed**: نعم — `formatCurrency` في الجدول والملخص؛ إزالة زر «تصفية» غير الوظيفي؛ نص «لا مصروفات في الفترة»؛ تحسين النموذج (`z.coerce`، LTR للمبلغ، تعطيل التسجيل).

---

## المشتريات Purchases (07)

### PUR-T7.1–T7.3 — قوائم وعناوين
- **Severity**: 🟡 important
- **Location**: `purchases/invoices/page.tsx`, `orders/page.tsx`, `returns/page.tsx`
- **Expected**: اتساق مع المبيعات؛ عناوين «مشتريات» صريحة؛ تمييز بصري خفيف؛ `StatCard` عملة صحيحة.
- **✅ Fixed**: نعم — إطار جانبي لوني خفيف (`amber`)؛ `PageHeader` لأوامر الشراء والمرتجعات؛ `isCurrency` لبطاقات فواتير المشتريات؛ أيقونة عدد مناسبة.

### PUR-T7.4–T7.5 — فاتورة / أمر شراء / مرتجع
- **Severity**: 🔴 blocker (خلل منطقي)
- **Location**: `InvoiceForm.tsx`
- **Expected**: اختيار مورد يُسجَّل كـ `supplier_id` لكل أنواع المشتريات؛ إلزام المورد مع رسالة «اختر المورد أولًا»؛ تأكيد مرتجع المشتريات.
- **✅ Fixed**: نعم — إصلاح `CommandItem` الذي كان يضبط `customer_id` لأوامر الشراء والمرتجعات؛ `superRefine` على المخطط؛ `AlertDialog` قبل التنفيذ؛ بعد النجاح توجيه لقائمة المرتجعات وtoast «تم تسجيل المرتجع».

### PUR-T7.6–T7.7 — أوامر شراء
- **Severity**: 🟢 polish
- **Location**: `purchases/orders/page.tsx`, `orders/new/page.tsx`
- **Expected**: شرح دورة الحالة؛ فارغ عبر `InvoiceTable`؛ عنوان صفحة جديدة.
- **✅ Fixed**: نعم — شريط نصي للدورة؛ `PageHeader` لصفحة الإنشاء.

### PUR-T7.8–T7.9 — مرتجعات
- **Severity**: 🟡 important
- **Location**: `purchases/returns/page.tsx`, `returns/new/page.tsx`, `InvoiceForm.tsx`
- **Expected**: روابط صحيحة؛ CTA مرتجع جديد؛ تأكيد + نجاح.
- **✅ Fixed**: نعم — ربط «فواتير المشتريات» الصحيح؛ زر مرتجع جديد؛ حوار تأكيد ونسخ أثر المخزون.

### PUR-O7-001 — روابط بين مسارات الشراء + أزرار RTL
- **Severity**: 🟢 polish
- **Location**: `purchases/new/page.tsx`، `purchases/orders/new/page.tsx`، `purchases/returns/new/page.tsx`، صفحات قوائم `invoices` / `orders` / `returns`
- **Current**: نص توجيهي لفاتورة الشراء بلا روابط؛ أزرار رأس تستخدم `me-2` على الأيقونات؛ لا تذكير بصري بأثر المرتجع على المخزون عند الإنشاء.
- **Expected**: صناديق توضيح مع روابط لأوامر الشراء/الفاتورة المباشرة؛ `gap-2` على الروابط؛ لافتة amber لمرتجع جديد (نسخ UX فقط).
- **Evidence**: خطة `07-purchases.md` (التدفقات 1–3، G2 تمييز خفيف).
- **✅ Fixed**: نعم — روابط صريحة بين «فاتورة مشتريات جديدة» و«أوامر الشراء»؛ العكس من صفحة أمر شراء جديد؛ لافتة أثر مخزون/مورد لمرتجع جديد؛ أزرار `Button asChild` بـ `gap-2` و`inline-flex` على القوائم.

---

## العملاء والموردين Contacts (09)

### CON-T9.1–T9.4 — قوائم موحّدة
- **Severity**: 🟡 important
- **Location**: `PartnerTable.tsx`, `customers/page.tsx`, `suppliers/page.tsx`
- **Expected**: أعمدة متطابقة؛ رصيد بألوان حذرة؛ بحث مع تأخير خفيف؛ فارغ عربي؛ `aria-label` لقائمة الإجراءات؛ تمييز خفيف عميل/مورد.
- **✅ Fixed**: نعم — `kind` للتمييز؛ `useDeferredValue` للبحث؛ `destructive` للمديونية فقط؛ حالات فارغة مزدوجة (لا بيانات / لا نتائج)؛ إطار `sky` للعملاء و`amber` للموردين؛ `StatCard` عملة للمديونيات.

### CON-T9.5–T9.7 — تفاصيل
- **Severity**: 🟡 important
- **Location**: `customers/[id]/page.tsx`, `suppliers/[id]/page.tsx`
- **Expected**: رصيد `text-3xl` في بطاقة؛ روابط سريعة؛ شارات واضحة للمتزن/المدين.
- **✅ Fixed**: نعم — بطاقة «الرصيد الحالي»؛ أزرار outline إلى فواتير/سندات؛ نفس هيكل البطاقات مع اختلاف النص واللون الخفيف.

### CON-T9.8–T9.10 — كشف الحساب
- **Severity**: 🟡 important
- **Location**: `PartnerStatement.tsx`
- **Expected**: من/إلى + تطبيق + تصفير؛ بحث بالبيان؛ تسميات عربية لنوع الحركة؛ تقليل ألوان صارخة في المدين/الدائن.
- **✅ Fixed**: نعم — مسودة تاريخ + تطبيق ثم تصفير؛ بحث مؤجل؛ استبدال `invoice/payment` الإنجليزي بنص عربي؛ ألوان أوضح للرصيد التراكمي.

---

## التقارير Reports (10)

### REP-T10.1–T10.4 — فهرس التقارير
- **Severity**: 🟡 important
- **Location**: `reports/page.tsx`
- **Expected**: أقسام بعناوين `text-sm font-medium text-muted-foreground`؛ بطاقة بعنوان `font-semibold` وسطر وصف واحد؛ بدون `font-black` مبالغ فيه.
- **✅ Fixed**: نعم — أقسام: مبيعات وأرباح / مخزون / مالية وضرائب / عملاء وموردون؛ وصف `text-sm text-muted-foreground` لكل تقرير؛ بطاقة إرشاد للتصدير.

### REP-T10.5–T10.10 — فلاتر مشتركة
- **Severity**: 🟡 important
- **Location**: `ReportFilters.tsx`
- **Expected**: عرض «من … إلى …»؛ أزرار سريعة (اليوم / هذا الأسبوع من السبت / هذا الشهر) مع تطبيق فوري؛ زر تطبيق؛ «تصفية» تعيد الضبط بدل `reload`؛ تحقق من ترتيب التاريخ؛ `SelectContent` بـ `dir="rtl"`.
- **✅ Fixed**: نعم — نص الفترة المطبّقة؛ `startOfWeek(..., { weekStartsOn: 6 })`؛ رسالة خطأ عربية؛ تصدير مع حالة تحميل داخلية + `exportLoading` من الـ hook.

### REP-T10.11–T10.13 — جدول التقارير
- **Severity**: 🟡 important
- **Location**: `ReportTable.tsx`, `use-report-legacy.ts`
- **Expected**: رأس sticky؛ skeleton أثناء التحميل مع بقاء عنوان النتائج؛ `tabular-nums` للأعمدة اليمنى؛ ترقيم عند >25 صفًا؛ نص فارغ موحّد؛ تصدير لا يجمّد الواجهة (`isExporting`).
- **✅ Fixed**: نعم — `Skeleton`؛ تفريغ صفحي 25/50/100؛ رسالة «لا توجد بيانات ضمن الفلتر…»؛ `exportToExcel` غير متزامن مع `isExporting`.

### REP-T10.14–T10.16 — رسوم
- **Severity**: 🟢 polish
- **Location**: `ReportCharts.tsx`
- **Expected**: ارتفاع ثابت ~280px؛ empty عربي؛ تسميات محاور؛ تخفيف تكدس التيكات.
- **✅ Fixed**: نعم — `h-[280px]`؛ حالة فراغ؛ محورا التاريخ والمبلغ؛ `angle=-45` عند >12 نقطة.

### REP-T10.17–T10.18 — التقرير اليومي (Gate)
- **Severity**: 🟡 important
- **Location**: `reports/daily/page.tsx`
- **Expected**: لقطة واضحة: عنوان `h1` فقط؛ ملخص إجماليات فوق الجدول؛ أعمدة مالية بمحاذاة رقمية.
- **✅ Fixed**: نعم — بطاقات ملخص (مبيعات، مشتريات، عدد فواتير) عند توفر `totals`؛ إزالة الوصف تحت العنوان لصالح الفلتر؛ `align: right` للأرقام.

---

## لوحة التحكم Dashboard (03)

### DSH-T3.1–T3.3 — شبكة KPI
- **Severity**: 🟡 important
- **Location**: `KPIGrid.tsx`, `dashboard/page.tsx`
- **Expected**: 3–4 بطاقات كحد أقصى؛ `gap` موحّد؛ ظلال متسقة؛ عنوان `text-sm text-muted-foreground`؛ رقم `text-2xl font-bold` + `tabular-nums`؛ اتجاه صعود/هبوط واضح.
- **✅ Fixed**: نعم — **4 بطاقات** (مبيعات اليوم مع نسبة أمس، فواتير اليوم، خزينة، نواقص)؛ `border bg-card shadow-sm`؛ `formatCurrency`؛ إزالة تدرجات mesh/glass؛ `statsFailed` + `Alert` عند فشل `getDashboardStats` (`null`).

### DSH-T3.4–T3.6 — رسوم
- **Severity**: 🟡 important
- **Location**: `SalesChart.tsx`, `TopProductsChart.tsx`
- **Expected**: رسم رئيسي أوضح؛ فراغ عربي؛ تخفيف تكدس التيكات؛ منتجات بترتيب واضح دون ألوان مفرطة.
- **✅ Fixed**: نعم — `SalesChart` ارتفاع 280px، محور يمين، زاوية تيكات عند كثافة البيانات، «لا إيرادات…» عند عدم وجود مبيعات؛ `TopProductsChart` أعلى 5 بترقيم في التسمية ولون شريط واحد (`primary`) + وصف بطاقة.

### DSH-T3.7–T3.9 — قوائم وتنبيهات
- **Severity**: 🟡 important
- **Location**: `RecentInvoices.tsx`, `StockAlertsWidget.tsx`, `dashboard/page.tsx`
- **Expected**: صف فاتورة قابل للنقر بالكامل؛ مخزون بلون تحذيري موحّد؛ «عرض الكل» باتجاه RTL منطقي.
- **✅ Fixed**: نعم — `Link` يغلف الصف؛ تاريخ كامل + `formatCurrency`؛ شارة حالة عربية؛ `StockAlertsWidget` بدون بطاقة مزدوجة، حالة فارغة و skeleton، لوحة **amber** موحّدة؛ `ChevronLeft` لروابط «التقدم» بصريًا في RTL.

### DSH-T3.10–T3.11 — تحميل
- **Severity**: 🟢 polish
- **Location**: `dashboard/loading.tsx`
- **Expected**: skeleton يطابق هيكل الصفحة (KPI + عمودين).
- **✅ Fixed**: نعم — شبكة 4 KPI + مخطط جانبي يطابق التخطيط الجديد.

---

## الإعدادات والتسويق والفوترة Settings / Marketing / Billing (11)

### SET-T11.1–T11.3 — هيكل الإعدادات
- **Severity**: 🟡 important
- **Location**: `settings/layout.tsx`, `SettingsNav.tsx`, صفحات الفروع/المخازن/الفاتورة
- **Expected**: تنقل ثابت؛ `max-w-4xl` موحّد؛ عنوان `h1` لكل قسم مع وصف `text-sm`؛ ألوان هادئة.
- **✅ Fixed**: نعم — `layout` بعرض موحّد؛ `SettingsNav` بثلاثة مسارات فقط (فروع / مخازن / فاتورة) وحالة نشطة `bg-accent`؛ إزالة روابط غير موجودة (مستخدمون/متجر).

### SET-T11.4–T11.6 — فروع ومخازن
- **Severity**: 🟡 important
- **Location**: `branches/page.tsx`, `warehouses/page.tsx`
- **Expected**: بطاقات متسقة؛ نماذج إضافة بحقول ضرورية ونص توضيحي `text-muted-foreground`؛ رسائل خطأ عربية موحّدة؛ بدون معرفات إنجليزية بارزة.
- **✅ Fixed**: نعم — بطاقات `border shadow-sm`؛ `Skeleton` للتحميل؛ «مرجع داخلي» بدل Branch ID؛ زر مستودع معطّل مع `title`؛ toast «تم حفظ التغييرات» / «تعذّر الحفظ».

### SET-T11.7–T11.9 — إعدادات الفاتورة
- **Severity**: 🟡 important
- **Location**: `InvoiceSettingsForm.tsx`
- **Expected**: معاينة شعار بحد ارتفاع؛ معاينة A4 مصغّرة RTL؛ تأكيد قبل الحفظ؛ واجهة عربية (تسمية الحقل الإنجليزي اختياري بالعربية).
- **✅ Fixed**: نعم — `max-h-36 object-contain`؛ كرت معاينة A4؛ `AlertDialog` قبل الحفظ؛ `toast` وفق النسخ الموحّدة.

### MKT-T11.10–T11.14 — تسويق
- **Severity**: 🟡 important
- **Location**: `(marketing)/page.tsx`, `Footer.tsx`
- **Expected**: Hero بهدوء + CTA تسجيل + دخول + ميزات؛ بطاقات ميزات بارتفاع متقارب؛ قسم أسعار `#pricing`؛ تذييل بروابط مفيدة؛ لا إنجليزي ظاهر غير ضروري.
- **✅ Fixed**: نعم — أزرار إنشاء حساب / دخول / ميزات؛ شارة «معاينة تجريبية»؛ شبكة أسعار 3 بطاقات مع تمييز `border-primary` للوسط؛ رابط «تسجيل الدخول للوحة» في التذييل؛ إزالة استيراد غير مستخدم.

### BIL-T11.15–T11.18 — فوترة
- **Severity**: 🟢 polish
- **Location**: `billing/history/page.tsx`, `billing/upgrade/page.tsx`
- **Expected**: empty state «لا سجل دفعات بعد»؛ شارات عربية دون `uppercase` إنجليزي على النص.
- **✅ Fixed**: نعم — نص الفارغ؛ إزالة `uppercase` من شارة الخطة الموصى بها.

---

## المساعدة والتدقيق وسوبر أدمن Help / Audit / Super-admin (12)

### HLP-T12.1–T12.5 — مركز المساعدة
- **Severity**: 🟡 important
- **Location**: `help/page.tsx`, `HelpCenter.tsx`
- **Expected**: `h1` + بحث؛ أقسام POS/مخزون/فواتير/شائع؛ خطوات مرقّمة؛ روابط خارجية مع `rel` وتوضيح نافذة جديدة؛ لا صفحة فارغة.
- **✅ Fixed**: نعم — بحث مؤجل (`useDeferredValue`)؛ أقسام وأدوات قابلة للطي؛ قوائم مرقّمة؛ واتساب مع `noopener noreferrer` ونص «نافذة جديدة»؛ بطاقة فيديو «نُحدّث المحتوى قريبًا» + CTA.

### AUD-T12.6–T12.10 — سجل التدقيق
- **Severity**: 🟡 important
- **Location**: `audit-logs/page.tsx`, `AuditLogsPanel.tsx`, `settings.actions.ts`
- **Expected**: جدول كثيف مقروء؛ نسخ معرف + toast؛ بحث/فلتر واجهة؛ عربي كامل؛ فراغ واضح؛ إزالة `use server` من صفحة العرض.
- **✅ Fixed**: نعم — أعمدة: وقت، مستخدم، فعل، كيان، IP، معرف + زر نسخ؛ بحث نصي؛ «تم نسخ المعرف»؛ `font-mono` للمعرف وIP؛ «غير متاح» بدل Unknown؛ `getAuditLogs` يقبل `fromDate`/`toDate` للتوسعة؛ صفحة خادم رفيعة + لوحة عميل.

### SUP-T12.11–T12.13 — سوبر أدمن
- **Severity**: 🟡 important
- **Location**: `super-admin/page.tsx`, `middleware.ts` (حماية المسار)
- **Expected**: لافتة تحذيرية؛ لا بيانات وهمية مضللة؛ لا إنجليزي في العناوين؛ المسار غير مدمج في الشريط العام (يُحمّى بالوسيط).
- **✅ Fixed**: نعم — شريط `border-amber` + «للمسؤولين فقط»؛ إزالة أرقام/تنبيهات وهمية؛ عنوان «مسؤول المنصة»؛ بطاقات مؤشرات «—»؛ قائمة شركات فارغة برسالة توضيحية؛ التنقل العام لم يُضف إليه سوبر أدمن (كما كان).

---

## جودة شاملة Cross-cutting (13)

### CC-T13.14 — تأكيدات بدل `window.confirm`
- **Severity**: 🟡 important
- **Location**: `InvoiceTable.tsx`
- **Expected**: تحويل عرض السعر إلى فاتورة وإلغاء الفاتورة عبر `AlertDialog` مع `dir="rtl"` ونصوص عربية واضحة.
- **✅ Fixed**: نعم — حالتان (تحويل / إلغاء) مع إغلاق وتفريغ الحالة عند `onOpenChange(false)`؛ زر إلغاء destructive عند التأكيد على الإلغاء.

### CC-T13.1–T13.2 — RTL وهوامش منطقية
- **Severity**: 🟢 polish
- **Location**: صفحات مبيعات/مخزون؛ `StatCard`؛ `SearchInput`؛ `HelpCenter` / `AuditLogsPanel`؛ أزرار مساعدة.
- **✅ Fixed**: جزئيًا — `ml-1` → `ms-1` في `StatCard`؛ أيقونة بحث `start-3` + `ps-10` للحقول؛ `SearchInput` بـ `ps-10`/`pe-10` وأيقونة باركود `end-3`؛ أزرار «فاتورة جديدة»/«عرض سعر» بـ `gap-2` على الرابط؛ قوائم وحدات/فئات بدون `ml-2` على الأيقونات (يعتمد `gap-2` في `DropdownMenuItem`)؛ `PaymentReceiptForm` و`BarcodePrintDialog` بـ `gap-2`.

### CC-T13.6 — لون عمود المتبقي
- **Severity**: 🟢 polish
- **Location**: `InvoiceTable.tsx` عمود المتبقي
- **Expected**: عدم استخدام أحمر حاد إلا للحالات الحرجة؛ أرقام بـ `tabular-nums`.
- **✅ Fixed**: نعم — تدرج amber/muted بدل `text-red-500`؛ `tabular-nums` على أعمدة مالية رئيسية في الجدول.

### CC-T13.17 — طباعة
- **Severity**: 🟢 polish
- **Location**: `globals.css`؛ `dashboard/layout.tsx`؛ `sonner.tsx`
- **Expected**: خلفية بيضاء؛ هوامش صفحة؛ إخفاء كروم طافٍ (قائمة أوامر، توستات، نوافذ حوار) دون كسر صفحات الفاتورة المعتمدة على `print:hidden` محليًا.
- **✅ Fixed**: نعم — `@page` margin؛ `print-color-adjust`؛ إخفاء `[role="dialog"]` و`[data-sonner-toaster]` عند الطباعة؛ غلاف `print:hidden` حول `CommandMenu`؛ تكرار `print:hidden` على الـ Toaster.

### CC-T13.18 — عربية واجهة تقرير الأرباح والخسائر
- **Severity**: 🟡 important
- **Location**: `reports/profit-loss/page.tsx`
- **Expected**: بدون تسميات إنجليزية بارزة في العناوين/الحالة؛ أرقام بمحاذاة رقمية عند الحاجة.
- **✅ Fixed**: نعم — عناوين بطاقات عربية؛ «هامش صافي الربح» / «الوضع»؛ «أداء جيد» / «يحتاج انتباه»؛ زر مشاركة بـ `gap-2`.

### Pilot — قرار الجاهزية (T13.22–T13.23)
| معيار | ملاحظة |
|--------|--------|
| تناسق RTL | تحسينات على مسارات رئيسية؛ ما زال يُنصح بمراجعة دورية لـ `left`/`right` في نماذج الإعدادات الطويلة. |
| تأكيدات المخاطرة | استبدال `confirm` في جدول الفواتير؛ مراجعة بقية المشروع لـ `confirm(` عند توسيع النطاق. |
| الطباعة | قواعد عامة + `print:hidden` موجود على الهيدر/الشريط؛ صفحات طباعة فاتورة مخصصة تبقى كما هي. |
| **القرار** | **Ready للـ pilot** مع متابعة قائمة تحسينات طفيفة (نماذج إعدادات، أي `confirm` متبقٍ). |

