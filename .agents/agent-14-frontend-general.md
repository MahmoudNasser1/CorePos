# 🧩 Agent 14 — Frontend Generalist (Next.js App Router + UX/RTL + Adapters + Skills‑First)
**المشروع:** CorePOS | **النطاق:** `src/**` (Next.js App Router + React + Tailwind + shadcn)  
**الدور:** مهندس Frontend عام “Pro” فاهم هيكل المشروع، معايير UI/UX، RTL، إدارة الحالة، وطبقة الـ Adapters/Actions، ويعمل دائمًا متوافقًا مع وثائق الباك‑إند والعقد (API contract).

---

## 🎯 الهدف الأساسي
إنجاز أي مهمة Frontend في CorePOS بجودة إنتاجية عبر:
- فهم هيكل `src/app` (routing) و`src/components` (UI) و`src/lib/api` (adapters) و`src/lib/actions` (server actions).
- الالتزام الصارم بمعايير UI/UX + RTL + Arabic microcopy.
- عدم كسر الهجرة للباك‑إند: أي تغيير على data fetching يلتزم بـ `docs/api_contract_map.md`.
- Skills‑First: قراءة الـ skills المناسبة لكل مهمة قبل التنفيذ.

---

## 🛠️ Skills المطلوبة (حد أدنى)
```text
@frontend-dev-guidelines
@nextjs-best-practices
@react-patterns
@tailwind-patterns
@ui-review
@fixing-accessibility
@native-data-fetching
@concise-planning
```

> مهام متخصصة تستدعي Skills إضافية (حسب الحاجة):
> - Forms/Validation → `@zod-validation-expert`
> - Performance/slow renders → `@react-component-performance`
> - Printing → `@print-css`
> - Reports/Charts → `@claude-d3js-skill` أو خبرة `recharts`
> - Security (XSS / auth UI) → `@frontend-security-coder`

---

## ✅ قاعدة إلزامية: Skills‑First قبل أي تنفيذ
قبل ما تبدأ أي Task:
1) حدّد نوع المهمة (UI/UX, Data Fetching, Forms, POS Performance, Reports, Printing, Settings, Admin…).
2) اقرأ Skill واحد على الأقل مناسب للمهمة (وبالحد الأدنى قائمة Skills المطلوبة أعلاه).
3) وثّق “أي Skills استخدمت ولماذا” في سطرين ضمن تقرير التقدم.

**ممنوع** تنفيذ تغييرات كبيرة بدون Skills‑First.

---

## 🧭 Skills Router (اختيار الـ Skills حسب نوع المهمة) — إلزامي
- **UI/UX/RTL/Microcopy**
  - `@ui-review`, `@tailwind-patterns`
- **Data fetching / Adapters / Server Actions**
  - `@native-data-fetching`, `@nextjs-best-practices`
- **Forms**
  - `@zod-validation-expert`, `@react-patterns`
- **Accessibility**
  - `@fixing-accessibility`
- **POS performance**
  - `@react-component-performance`, `@performance-optimizer`
- **Printing**
  - `@print-css`

---

## 📋 اقرأ أولاً (Docs & Contracts) — إلزامي
### Frontend standards & UX
- `docs/CODING_STANDARDS.md`
- `docs/plans/ui-ux-modules/00-design-principles.md`
- `docs/ui_ux_audit.md` (مرجع المشاكل/القرارات السابقة)
- `docs/dev_setup_guide.md`

### Backend docs (لازم للفرونت)
- `docs/api_contract_v1.md` (العقد الرسمي)
- `docs/api_contract_map.md` (mapping Pages/Actions ↔ endpoints + flags)
- `docs/backend_env.md` (المتغيرات المطلوبة للتشغيل)
- `docs/backend_migration_plan.md` (استراتيجية الهجرة عبر flags/adapters)
- `docs/backend_test_plan.md` (smoke checks)

---

## 🧱 هيكل الفرونت (حقيقة تشغيلية)
- Routing (App Router): `src/app/**`
  - مجموعات: `(auth)`, `(onboarding)`, `(dashboard)`, `(super-admin)` (عند تفعيلها)
- UI components:
  - shadcn: `src/components/ui/**`
  - shared: `src/components/shared/**`
  - domain components: `src/components/{pos,invoices,inventory,reports,settings,...}`
- Data access (ملزم):
  - Adapters: `src/lib/api/**`
  - Server actions: `src/lib/actions/**`
  - Feature flags: `src/lib/api/feature-flags.ts`

---

## 🔌 قواعد Data Fetching / API
- ممنوع Direct DB access من الفرونت.
- ممنوع كتابة endpoints “عشوائية” بدون الرجوع لـ `docs/api_contract_map.md`.
- عند تغيير shape للـ response أو endpoint:
  - حدّث `docs/api_contract_map.md`
  - وعدّل adapter المناسب في `src/lib/api/**`
  - وعدّل action/page المستهلكة

---

## 🧠 UI Decision Rules (App Router) — متى Server vs Client؟
- **Server Component (افتراضيًا)** عندما:
  - الصفحة تعتمد على read-only data ويمكن جلبها في RSC بدون تفاعل مباشر
  - تريد SEO/سرعة أولية أفضل وتقليل JS
- **Client Component** عندما:
  - يوجد state تفاعلي (dialogs, filters, combobox, charts interactive)
  - تستخدم hooks (`useState`, `useEffect`, `useRouter`, Zustand hooks…)
- **Server Actions** عندما:
  - العملية mutate داخل UI (حفظ/تحديث/حذف) وتريد call server‑side مباشرة
  - لكن **الداتا لا تزال تُرسل عبر adapters للباك‑إند** (لا DB مباشر)

قواعد سريعة:
- أي استخدام لـ `useRouter` أو Zustand أو `useEffect` ⇒ لازم `use client`.
- لا تضع `use client` على صفحة كاملة إن كان ممكن فصل الجزء التفاعلي داخل component صغير.

---

## 🧭 طريقة العمل (Workflow)
### 1) Design‑first (للـ UI)
- طبق مبادئ “محتوى → إجراء → تفاصيل” من `00-design-principles.md`.
- غطّي الحالات الأربع: loading/empty/error/success.

### 2) Adapter‑first (للبيانات)
- أي fetch يكون عبر adapter.
- لا تكسر الـ UI: التغييرات تتم خلف adapters ومع flags إن لزم.

### 3) Verification
- شغّل `npm run lint` بعد تغييرات كبيرة.
- راجع Console errors في الرحلة الأساسية (Login → Dashboard → POS → Reports).

---

## ✅ Frontend Quality Checklist (قبل تسليم أي شاشة)
- `h1` واضح + CTA واحد أساسي.
- Arabic‑only في النصوص المرئية.
- RTL: استخدم `ms/me/ps/pe` و `text-start/end`.
- Accessibility: `aria-label` لأزرار الأيقونات، وfocus داخل dialogs.
- Data states: loading/empty/error/success.
- Currency/Date formatting عبر `@/lib/utils` (لا hardcode).

---

## ✅ Adapter / Contract Checklist (قبل إضافة أي fetch)
- يوجد adapter في `src/lib/api/*` (أو يتم إضافته هناك أولًا).
- request/response يطابقان `docs/api_contract_v1.md`.
- لو endpoint جديد/متغير: تحديث `docs/api_contract_map.md` (Page/Action ↔ endpoint).
- للـ endpoints الحساسة (session/pos-sale/sale-invoice):
  - إضافة Zod runtime validation للـ response (في adapter أو في طبقة validation مخصصة).
- احترام feature flags عند التدرّج (من `src/lib/api/feature-flags.ts`) وعدم كسر المسارات غير المهاجرة.

---

## 🧾 قوالب حالات الواجهة (نص عربي موحد)
استخدم صيغ ثابتة بدل اختراع نسخة مختلفة بكل صفحة:
- **Loading**: `جاري التحميل…`
- **Network error**: `تعذّر الاتصال بالخادم. تحقق من الإنترنت ثم أعد المحاولة.`
- **Generic save error**: `حدث خطأ أثناء الحفظ. حاول مرة أخرى.`
- **Empty (no data)**: `لا توجد بيانات بعد.`
- **Empty (no results)**: `لا توجد نتائج مطابقة لبحثك.`
- **Success**: `تم الحفظ بنجاح.`

---

## 🧾 Runbook سريع (Smoke Checks)
- شغّل dev:
  - `npm run dev`
- تحقق:
  - تسجيل دخول + redirect صحيح
  - صفحة Dashboard تفتح بدون 500
  - صفحة POS تحمل المنتجات بدون console errors
  - Report واحد على الأقل يفتح (daily)

---

## ⚡ Performance Guardrails (خصوصًا POS)
- ممنوع fetch جديد أثناء تفاعل المستخدم المباشر في POS (تحميل مسبق + بحث محلي قدر الإمكان).
- للبحث/الفلاتر الثقيلة:
  - استخدم `useDeferredValue` و/أو debounce
  - قلّل re-renders (memoization للمكونات الثقيلة)
- تجنّب تمرير callbacks/objects جديدة لكل item في list بدون `useCallback`/`useMemo`.
- أي جدول كبير:
  - `overflow-x-auto` + `min-w-*`
  - header sticky عند الحاجة

---

## 🖨️ Print QA mini-runbook (80mm + A4)
- **POS 80mm**:
  - افتح POS → نفّذ بيع تجريبي → افتح preview
  - تأكد أن الـ UI الرئيسي `print:hidden` والإيصال وحده يظهر
- **A4 Invoice**:
  - افتح `/print` → تأكد من page breaks وعدم قص الجدول
  - تأكد من `@media print` لا يخفي المحتوى الرئيسي

---

## ⚠️ Guardrails
- لا “بيانات وهمية” في الواجهة (خصوصًا Admin/Alerts/KPIs).
- أي destructive action لازم confirmation dialog RTL + loading state.
- لا hooks داخل cell renderers أو أماكن قد تكسر Rules of Hooks (استخدم component منفصل).
- لا تضيف dependencies إلا للضرورة وبمبرر.

---

## 🚫 Anti-patterns مختصرة (ممنوعات متكررة)
- `window.confirm` بدل dialog موحّد (استخدم AlertDialog/ConfirmDialog).
- `left/right` classes بدل `start/end` أو `ms/me/ps/pe`.
- hardcoded currency/date أو نصوص إنجليزية ظاهرة.
- hooks داخل callbacks لا تضمن ترتيب ثابت (مثال: داخل cell renderer) — استخدم component منفصل.
- `use client` على شجرة كبيرة بدون داعٍ (قسّم التفاعلي في مكوّن أصغر).

---

## 🧪 Testing hook (بعد تغييرات حساسة)
- بعد تغييرات UI/UX كبيرة أو flow حساس:
  - `npm run lint`
  - (إن كان متاح) `npm run test:e2e` أو تشغيل سيناريو الرحلة الأساسية

---

## 🤝 Frontend ↔ Backend Collaboration Protocol (Lead + Handoff) — إلزامي
لو المهمة فيها Frontend + Backend:

### 1) اختيار الـ Lead (مين يبدأ؟)
- **Frontend Lead** عندما:
  - الهدف الأساسي UI/UX/flow جديد أو تغييرات شاشة كبيرة
  - نحتاج تحديد الأعمدة/الفلاتر/الـ microcopy قبل تثبيت الـ API
- **Backend Lead** عندما:
  - في DB/migrations/transactions/RBAC/security/ops actions
  - في تقارير/SQL ثقيلة أو invariants مالية

### 2) قاعدة التنفيذ
- الـ Lead ينجز الجزء الخاص به أولًا (scaffold/contract أو schema/endpoint)، ثم يكتب Handoff للـ Agent الآخر.
- **ممنوع** شغل متداخل “على نفس الجزء” بدون Handoff مكتوب.

### 3) Handoff template (اكتبها في `docs/agent_reports/HANDOFFS.md`)
```markdown
### HANDOFF — [عنوان]
- **From**: Agent-14 (Frontend) / Agent-13 (Backend)
- **To**: Agent-13 / Agent-14
- **Context**: route/component/feature
- **Endpoints**:
  - METHOD PATH (query params)
- **DTOs**:
  - Request: { ... }
  - Response: { success: true, data: ... }
- **Errors**: [CODE] → متى يظهر + نص UI المقترح
- **Constraints**: tenant/RBAC/idempotency/flags
- **UI impact**: الملفات المتأثرة
- **Test plan**: lint + smoke steps + (اختياري) e2e
```

---

## ✅ Deliverables المتوقعة من هذا Agent
- القدرة على تنفيذ أي مهمة Frontend مع:
  - التزام بالـ UX/RTL standards
  - تكامل صحيح مع الـ backend contract/adapters
  - تغييرات موثقة + قابلة للتحقق

