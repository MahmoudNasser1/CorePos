# 🚀 CorePOS — خريطة عمل الـ Agents
> **اسم المشروع:** CorePOS  
> **التقنية:** Next.js 15 + Supabase  
> **تاريخ البدء:** 17 أبريل 2026

---

## الـ Agents وتخصصاتهم

| Agent | الاسم | التخصص | الأولوية |
|-------|-------|---------|---------|
| [Agent-00](./agent-00-orchestrator.md) | 🎼 Orchestrator | مراجعة + Gate Reviews + ضمان التكامل | **يعمل بين المراحل فقط** |
| [Agent-01](./agent-01-database.md) | 🗄️ Database Engineer | Schema + RLS + Supabase Setup | **P0 — يبدأ أول** |
| [Agent-02](./agent-02-auth-saas.md) | 🔐 Auth & SaaS Engineer | تسجيل دخول + Onboarding + Billing | **P1 — بعد Gate 1** |
| [Agent-03](./agent-03-design-system.md) | 🎨 Design System Engineer | UI Foundation + Layout + Shared Components | **P1 — موازي 02** |
| [Agent-04](./agent-04-pos-inventory.md) | 🛒 POS & Inventory Engineer | شاشة POS + المخزون | **P2 — بعد Gate 2** |
| [Agent-05](./agent-05-sales-finance.md) | 💰 Sales & Finance Engineer | مبيعات + مشتريات + خزينة | **P2 — موازي 04** |
| [Agent-06](./agent-06-reports-admin.md) | 📊 Reports & Admin Engineer | تقارير + Dashboard + Super Admin | **P2 — موازي 04+05** |
| [Agent-07](./agent-07-backend-migration.md) | ⚙️ Backend Migration Engineer | بناء Backend مستقل + ربطه بالفرونت | **P2/P3 — تدريجي مع 04/05/06** |
| [Agent-08](./agent-08-api-structure.md) | 🧩 API Structure Architect | هيكلة APIs + OpenAPI + Contracts | **P2 — موازي مع 07** |
| [Agent-09](./agent-09-testing.md) | 🧪 Testing Engineer | Unit Tests + Stress Tests لكل الـ modules | **P2/P3 — موازي مع 07/08** |

---

## ترتيب التنفيذ

```
المرحلة 1 (متفردة):
  └── Agent-01: DB Schema + RLS + Supabase Setup
      ↓ (ينتهي وينتج: types + env + migrations)

المرحلة 2 (متوازية):
  ├── Agent-02: Auth + SaaS + Onboarding
  └── Agent-03: Design System + Layout + Shared Components
      ↓ (ينتهيان وينتجان: system كامل جاهز)

المرحلة 3 (متوازية):
  ├── Agent-04: POS + Inventory
  ├── Agent-05: Sales + Finance
  ├── Agent-06: Reports + Dashboard + Super Admin
  ├── Agent-07: Backend Migration + Integration
  ├── Agent-08: API Structure + Contracts
  └── Agent-09: Unit Tests + Stress Tests
      ↓ (MVP جاهز + مختبر)
```

---

## قاعدة التواصل بين الـ Agents

### ما يُنتجه كل Agent ويستخدمه الآخرون:

**Agent-01 يُنتج:**
- `src/types/database.types.ts` ← يستخدمه **الجميع**
- `SUPABASE_SETUP.md` ← يستخدمه **الجميع**
- `.env.local` ← يستخدمه **الجميع**

**Agent-02 يُنتج:**
- `src/stores/authStore.ts` ← يستخدمه **04, 05, 06**
- `src/lib/plan-limits.ts` ← يستخدمه **04, 05, 06**
- `src/lib/supabase/client.ts` ← يستخدمه **الجميع**

**Agent-03 يُنتج:**
- `src/components/shared/*.tsx` ← يستخدمه **04, 05, 06**
- `src/app/(dashboard)/layout.tsx` ← يستخدمه **الجميع**
- `src/lib/utils.ts` ← يستخدمه **الجميع**

**Agent-04 يُنتج:**
- `src/components/products/ProductSearchInput.tsx` ← يستخدمه **05**

**Agent-07 يُنتج:**
- `apps/backend/**` ← يستخدمه **الجميع عبر API**
- `src/lib/api/**` ← يستخدمه **04, 05, 06**

**Agent-09 يُنتج:**
- `tests/unit/**` ← Unit tests لكل module
- `tests/integration/**` ← Cross-module integration tests
- `tests/stress/**` ← Stress & load tests
- `tests/helpers/**` ← Test utilities (factories, mocks)
- `vitest.config.ts` ← Test runner config
- `docs/test_coverage_report.md` ← تقرير التغطية

---

## الـ Supabase MCP المتوفر

```json
// الأدوات المتوفرة عبر MCP:
"supabase-mcp-server": {
  "@supabase/mcp-server-supabase" // Cloud Supabase
}

"supabase": {
  "serverUrl": "https://eldrwal.tailf3555d.ts.net:8443/mcp" // Self-hosted
}
```

**Agent-01** هو الوحيد الذي يستخدم Supabase MCP مباشرة.
باقي الـ Agents يتعاملون مع Supabase عبر الـ Client library.

---

## ملفات الوثائق المرجعية

| الملف | يفيد |
|-------|------|
| [CONTEXT.md](../docs/CONTEXT.md) | **الجميع — اقرأ أولاً** |
| [decisions.md](../docs/decisions.md) | **الجميع — مرجع الحكم** |
| [CODING_STANDARDS.md](../docs/CODING_STANDARDS.md) | **الجميع — إلزامي** |
| [WORKFLOW.md](../docs/WORKFLOW.md) | **الجميع — طريقة العمل** |
| [PROGRESS.md](../docs/agent_reports/PROGRESS.md) | **لوحة متابعة موحّدة لكل الـ Agents** |
| [database_schema.sql](../docs/database_schema.sql) | Agent-01 (أساسي) |
| [saas_layer_schema.sql](../docs/saas_layer_schema.sql) | Agent-01 (أساسي) |
| [seed.sql](../docs/seed.sql) | Agent-01 (بيانات تجريبية) |
| [saas_architecture.md](../docs/saas_architecture.md) | Agent-02 |
| [screens_map.md](../docs/screens_map.md) | Agent-03, 04, 05, 06 |
| [pos_project_brief_and_prd.md](../docs/pos_project_brief_and_prd.md) | الجميع (مرجعي) |
| [dev_setup_guide.md](../docs/dev_setup_guide.md) | Agent-03 |

---

## ✅ معايير القبول للـ MVP

- [ ] تسجيل دخول وخروج يعمل
- [ ] Onboarding flow كامل (3 خطوات)
- [ ] إضافة أصناف + باركود
- [ ] شاشة POS تكمل فاتورة + طباعة 80mm
- [ ] فاتورة مبيعات A4 كاملة
- [ ] فاتورة مشتريات + تحديث التكلفة المتوسطة
- [ ] الخزينة تعكس كل الحركات تلقائياً
- [ ] كشف حساب العميل
- [ ] 5 تقارير أساسية
- [ ] Dashboard بالأرقام اليومية
- [ ] Billing page تعرض حالة الاشتراك
- [ ] RTL عربي 100%
- [ ] يعمل على Desktop + Tablet
