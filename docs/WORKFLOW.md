# 🚦 CorePOS — دليل العمل مع الـ Agents

> **قرار D12 المُقفَل:** Supabase = **Self-Hosted** على `eldrwal.tailf3555d.ts.net`
> الـ MCP متوفر: `serverUrl: https://eldrwal.tailf3555d.ts.net:8443/mcp`

---

## أولاً: بنية الـ Agents (7 Agents بإضافة الـ Orchestrator)

| Agent | الدور | متى يعمل |
|-------|-------|----------|
| **Agent-00** 🎼 Orchestrator | مراجعة + قبول / رفض + ضمان التكامل | بين كل مرحلة |
| **Agent-01** 🗄️ Database | Schema + Supabase Setup | Phase 1 |
| **Agent-02** 🔐 Auth & SaaS | تسجيل دخول + Onboarding + Billing | Phase 2 |
| **Agent-03** 🎨 Design System | Next.js + Layout + Components | Phase 2 |
| **Agent-04** 🛒 POS & Inventory | شاشة POS + المخزون | Phase 3 |
| **Agent-05** 💰 Sales & Finance | مبيعات + مشتريات + خزينة | Phase 3 |
| **Agent-06** 📊 Reports & Admin | تقارير + Dashboard + Super Admin | Phase 3 |


### القاعدة الذهبية
> **كل Agent = محادثة منفصلة جديدة**

لماذا؟ لأن كل Agent يحتاج:
- Context نظيف بدون تشويش
- تركيز 100% على مهمته فقط
- لا تتداخل مع أوامر Agent آخر

### نمط الاستدعاء الصحيح

```
اقرأ ملف .agents/agent-XX-name.md وطبّق كل المطلوب
```

أو بنمط الـ Skills:

```
Use @agent-01-database to set up CorePOS database on Self-Hosted Supabase at eldrwal.tailf3555d.ts.net
```

---

## ثالثاً: التسلسل الدقيق مع الـ Orchestrator (مرحلة بمرحلة)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Phase 1 — الأساس
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Agent-01 🗄️ Database Engineer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🎼 Orchestrator — Gate 1 Review (محادثة منفصلة)
    ✅ موافق → Phase 2    |    ❌ مرفوض → أرجع Agent-01
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Phase 2 — البنية (محادثتان موازيتان)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Agent-02 🔐 Auth & SaaS    ║    Agent-03 🎨 Design System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🎼 Orchestrator — Gate 2 Review (محادثة منفصلة)
    يتحقق من: Auth Flow + Design System + Integration بينهم
    ✅ موافق → Phase 3    |    ❌ مرفوض → قائمة بمشاكل كل Agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Phase 3 — الوظائف (3 محادثات موازية)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Agent-04 🛒 POS  ║  Agent-05 💰 Finance  ║  Agent-06 📊 Reports
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🎼 Orchestrator — Gate 3 Review (محادثة منفصلة)
    يتحقق من: Business Logic + Integration + MVP Criteria
    ✅ موافق → 🚀 MVP جاهز للإطلاق
    ❌ مرفوض → قائمة مشاكل موزّعة على كل Agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ثالثاً: الأوامر الجاهزة (انسخ والصق)

### 🟢 ابدأ الآن — Agent-01

افتح محادثة جديدة واكتب:

```
أنت Agent-01 لمشروع CorePOS.

اقرأ أولاً (إلزامي):
/home/eldrwal/Desktop/Pos-Sahl/docs/CONTEXT.md

ثم اقرأ ملف مهامتك:
/home/eldrwal/Desktop/Pos-Sahl/.agents/agent-01-database.md

المراجع:
- /home/eldrwal/Desktop/Pos-Sahl/docs/database_schema.sql
- /home/eldrwal/Desktop/Pos-Sahl/docs/saas_layer_schema.sql
- /home/eldrwal/Desktop/Pos-Sahl/docs/seed.sql
- /home/eldrwal/Desktop/Pos-Sahl/docs/decisions.md

Git branch: agent/01-db (checkout من main)
ابدأ بالخطوة 1 وأخبرني بعد إنشاء الـ migrations قبل تشغيلها.
```

---

### ⏳ بعد انتهاء Agent-01 — Agent-02 (محادثة جديدة)

```
أنت Agent-02 لمشروع CorePOS.

اقرأ أولاً (إلزامي):
/home/eldrwal/Desktop/Pos-Sahl/docs/CONTEXT.md

ثم اقرأ ملف مهامتك:
/home/eldrwal/Desktop/Pos-Sahl/.agents/agent-02-auth-saas.md

المراجع:
- /home/eldrwal/Desktop/Pos-Sahl/docs/saas_architecture.md
- /home/eldrwal/Desktop/Pos-Sahl/docs/decisions.md
- /home/eldrwal/Desktop/Pos-Sahl/docs/CODING_STANDARDS.md
- src/types/database.types.ts (منتوج Agent-01)

Git branch: agent/02-auth
```

---

### ⏳ بعد انتهاء Agent-01 — Agent-03 (موازي مع 02، محادثة ثالثة)

```
أنت Agent-03 لمشروع CorePOS.

اقرأ أولاً (إلزامي):
/home/eldrwal/Desktop/Pos-Sahl/docs/CONTEXT.md
/home/eldrwal/Desktop/Pos-Sahl/docs/CODING_STANDARDS.md

ثم اقرأ ملف مهامتك:
/home/eldrwal/Desktop/Pos-Sahl/.agents/agent-03-design-system.md

المراجع:
- /home/eldrwal/Desktop/Pos-Sahl/docs/screens_map.md
- /home/eldrwal/Desktop/Pos-Sahl/docs/dev_setup_guide.md
- /home/eldrwal/Desktop/Pos-Sahl/docs/decisions.md

Git branch: agent/03-design
ابدأ بـ: create-next-app ثم shadcn ثم globals.css
```

---

### ⏳ بعد انتهاء 02+03 — Agent-04 (محادثة جديدة)

```
أنت Agent-04 لمشروع CorePOS.

اقرأ الملف التالي وطبّق كل ما هو مطلوب:
/home/eldrwal/Desktop/Pos-Sahl/.agents/agent-04-pos-inventory.md

تأكد أن src/stores/authStore.ts موجود (من Agent-02)
تأكد أن src/components/shared/ موجود (من Agent-03)

ابدأ بـ posStore.ts ثم شاشة POS
```

---

## رابعاً: الأوامر الجاهزة للـ Orchestrator (انسخ والصق)

### Gate 1 — بعد Agent-01 (محادثة جديدة)

```
أنت Orchestrator لمشروع CorePOS.

اقرأ ملف: /home/eldrwal/Desktop/Pos-Sahl/.agents/agent-00-orchestrator.md

طبّق Gate 1 Review Checklist على مخرجات Agent-01.

تحقق من:
1. الملفات في /home/eldrwal/Desktop/Pos-Sahl/
2. قاعدة البيانات في eldrwal.tailf3555d.ts.net:8443

أعطني تقرير المراجعة كاملاً وقرار: موافق أم مرفوض؟
```

### Gate 2 — بعد Agent-02 + Agent-03 (محادثة جديدة)

```
أنت Orchestrator لمشروع CorePOS.

اقرأ ملف: /home/eldrwal/Desktop/Pos-Sahl/.agents/agent-00-orchestrator.md

طبّق Gate 2 Review Checklist على مخرجات Agent-02 و Agent-03.
شغّل المشروع: cd /home/eldrwal/Desktop/Pos-Sahl && npm run dev
افتح localhost:3000 وتحقق بصرياً.

أعطني تقرير المراجعة وقرار: موافق أم مرفوض؟
```

### Gate 3 — بعد Agent-04 + 05 + 06 (محادثة جديدة)

```
أنت Orchestrator لمشروع CorePOS.

اقرأ ملف: /home/eldrwal/Desktop/Pos-Sahl/.agents/agent-00-orchestrator.md

طبّق Gate 3 Review Checklist الكامل.
شغّل اختبار integration كامل:
- سجّل مستخدم جديد
- أكمل Onboarding
- أضف صنف‌
- أتمم فاتورة POS
- تحقق من تحديث المخزون والخزينة

أعطني التقرير النهائي: هل CorePOS MVP جاهز؟
```

---

## خامساً: Git Workflow (مهم — لا تتجاوزه)

### الإعداد الأولي (مرة واحدة فقط)

```bash
cd /home/eldrwal/Desktop/Pos-Sahl
git init
git add -A
git commit -m "chore: initial project structure and documentation"
```

### Branch لكل Agent

```bash
# قبل بدء كل Agent:
git checkout main
git checkout -b agent/01-db      # Agent-01
git checkout -b agent/02-auth    # Agent-02
git checkout -b agent/03-design  # Agent-03
git checkout -b agent/04-pos     # Agent-04
git checkout -b agent/05-sales   # Agent-05
git checkout -b agent/06-reports # Agent-06
```

### Commit بعد كل Deliverable

```bash
# مثال بعد Agent-01 ينهي الـ migrations:
git add supabase/ src/types/
git commit -m "feat(db): add core schema migrations + RLS policies"

# مثال بعد Gate 1 موافق:
git checkout main
git merge agent/01-db
git tag gate-1-approved
```

### عند فشل Gate Review

```bash
# Agent-01 يحتاج إصلاح بعد Gate 1:
git checkout agent/01-db
# يُصلح الـ Agent الملاحظات
git add -A
git commit -m "fix(db): fix invoice_sequences trigger + barcode index"
# يُعيد Gate Review
```

### `.gitignore` المطلوب

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build
.next/
out/
dist/

# Environment
.env
.env.local
.env.*.local

# Supabase
.branches
.temp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# IDE
.vscode/settings.json
.idea/
```

---

## سادساً: نصائح ذهبية المُحدَّثة

| # | النصيحة |
|---|---------|
| 1 | **لا تتدخل في عمل Agent** — اتركه يكمل ثم راجع |
| 2 | **إذا انكسر شيء** — أخبر الـ Agent المسؤول فقط بالمشكلة |
| 3 | **التزام الملفات** — كل Agent يكتب فقط في مجلداته المحددة |
| 4 | **Git commit بعد كل مرحلة** — لو حصل شيء ترجع له |
| 5 | **شغّل `npm run dev`** بعد كل مرحلة وتأكد لا errors |
| 6 | **إذا Agent-03 انتهى قبل Agent-02** — ابدأ Agent-05 الأول (لا يحتاج POS Store) |

---

## سادساً: ترتيب التبعيات بالتفصيل

```
Agent-01 (DB)
    │
    ├──→ Agent-02 (Auth)     ← يحتاج: database.types.ts, .env.local
    │        │
    │        └──→ Agent-04 (POS)      ← يحتاج: authStore.ts, plan-limits.ts
    │        └──→ Agent-05 (Finance)  ← يحتاج: authStore.ts
    │        └──→ Agent-06 (Reports)  ← يحتاج: authStore.ts
    │
    └──→ Agent-03 (Design)   ← يحتاج: database.types.ts فقط
             │
             └──→ Agent-04 ← يحتاج: shared components, globals.css
             └──→ Agent-05 ← يحتاج: DataTable, InvoiceForm
             └──→ Agent-06 ← يحتاج: StatCard, DataTable
```

**الخلاصة:** Agent-04 يحتاج الـ اتنين (02 و 03) ينتهوا أولاً.
Agent-05 و 06 يمكنهم البدء بعد 02 و 03 فقط.
