# CorePOS — Manual Test Scenarios (DevTools Evidence)

> **هدف الملف**: تشغيل سيناريوهات اختبار يدوي “جاهزة للتنفيذ” + ما يجب إثباته عبر DevTools.
>
> **بيانات الدخول (اختبار)**:
> - email: `admin@pos-sahl.com`
> - password: `password123`
>
> **Environment**:
> - Frontend: `http://localhost:4001`
> - Backend: `http://localhost:4000` (API prefix: `/v1`)

---

## ### قواعد التوثيق (Evidence)

لكل سيناريو:
- **Result**: PASS/FAIL
- **Evidence** (DevTools):
  - Screenshot أو Copy-as-cURL (حسب السيناريو)
  - سجّل `x-request-id` من response (للربط مع logs)

---

## ### S1) Auth — Login happy path + cookies

- **Steps**
  - افتح `http://localhost:4001/login`
  - أدخل بيانات الدخول ثم Login
- **Expected**
  - التحويل إلى `/dashboard`
  - عدم ظهور أخطاء UI
- **DevTools Evidence**
  - Network: `POST /v1/auth/login` = 200
  - Response headers: `x-request-id` موجود
  - Application → Cookies (Domain: `localhost:4000`):
    - وجود `access_token` (وأي refresh token إن وجد)
    - HttpOnly/SameSite/Path منطقيين
- **Result**: ✅ PASS (manual run 2026-04-24)

---

## ### S2) Auth — Login failure (wrong password)

- **Steps**
  - افتح `/login`
  - نفس email + password غلط
- **Expected**
  - رسالة خطأ واضحة
  - لا يتم إنشاء cookies session
- **DevTools Evidence**
  - `POST /v1/auth/login` = 401 (أو خطأ مناسب)
  - Response body: `error.code` + `error.details.requestId`
- **Result**: ⬜

---

## ### S3) Auth — Session persistence + session endpoint

- **Steps**
  - بعد S1: اعمل Refresh
  - افتح `http://localhost:4001/dashboard/pos`
- **Expected**
  - لا redirect إلى `/login`
- **DevTools Evidence**
  - `GET /v1/auth/session` = 200 (مع cookies)
- **Result**: ⬜

---

## ### S4) Auth — Logout

- **Steps**
  - اضغط Logout
  - حاول تفتح `/dashboard`
- **Expected**
  - redirect إلى `/login`
  - cookies session تختفي/تتبطل
- **DevTools Evidence**
  - `POST /v1/auth/logout` = 200
  - Application → Cookies: session cookies removed/expired
- **Result**: ⬜

---

## ### S5) Onboarding — Seed sample data (pre-req for real POS)

- **Steps**
  - بعد S1: نفّذ seed data (لو في UI) أو من Network call:
    - `POST /v1/onboarding/sample-data`
- **Expected**
  - يرجع summary (products/customers/suppliers…)
- **DevTools Evidence**
  - Network: `POST /v1/onboarding/sample-data` = 200
  - Response: `success: true`
- **Result**: ⬜

---

## ### S6) POS — Products load from backend (not mock)

- **Steps**
  - افتح `http://localhost:4001/dashboard/pos`
- **Expected**
  - Grid يظهر منتجات فعلية (من inventory)
- **DevTools Evidence**
  - `GET /v1/inventory/products` = 200
  - Response `data.items.length > 0`
- **Result**: ✅ PASS (manual run 2026-04-24) — inventory products loaded (Product_* cards)

---

## ### S7) POS — Search + add to cart

- **Steps**
  - ابحث باسم منتج ظاهر
  - اضغط المنتج لإضافته للسلة
- **Expected**
  - السلة تتحدث + الإجمالي يتغير
- **DevTools Evidence**
  - (اختياري) لا errors في Console
- **Result**: ✅ PASS (manual run 2026-04-24) — added one product to cart

---

## ### S8) POS — Cash sale end-to-end

- **Steps**
  - “إتمام البيع” → “نقدي” → “تأكيد الدفع وطباعة”
- **Expected**
  - تظهر: “تم البيع بنجاح!” + رقم فاتورة
- **DevTools Evidence**
  - `POST /v1/finance/pos-sale` = 201
  - Response data فيها `invoiceNumber`
  - Response headers فيها `x-request-id`
- **Result**: ❌ FAIL (manual run 2026-04-24)
- **Observed**
  - Backend returned 400 `INVARIANT_VIOLATION`: "لا توجد خزينة محددة لإتمام الدفع"
  - Backend log showed request id (rid): `15b1483a-ed46-4fa5-9942-22c6df03bb0b`
- **Likely cause**
  - Logged-in user/session does not have `branch_id`/treasury defaults configured, so treasuryId is null.

---

## ### S9) Reports — Daily loads after sale

- **Steps**
  - افتح `http://localhost:4001/dashboard/reports/daily`
- **Expected**
  - التقرير يحمل بدون errors
- **DevTools Evidence**
  - `GET /v1/reports/daily` = 200
- **Result**: ⬜

---

## ### S10) Security sanity — call sensitive endpoint without cookies

- **Steps**
  - من DevTools Network: “Copy as cURL” لطلب حساس (مثلاً `/v1/inventory/products`)
  - امسح `cookie:` header وشغّل curl
- **Expected**
  - 401 Unauthorized مع `SESSION_MISSING` (أو equivalent)
- **DevTools Evidence**
  - Response body includes `error.code` + `requestId`
- **Result**: ⬜

