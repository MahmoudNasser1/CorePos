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

