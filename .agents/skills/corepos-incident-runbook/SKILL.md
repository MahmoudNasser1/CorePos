---
name: corepos-incident-runbook
description: Runbook-style documentation of the real production incidents we hit while setting up CorePOS CI/CD + deploy. Includes symptoms, how to diagnose (commands + where to look), root causes, and the exact fixes applied (GitHub Actions, server, Docker, DB migrations, Funnel/Nginx, caching). Use when the user says “it’s broken again”, “502/500”, “deploy succeeded but old code”, “migrations not applied”, “share-modal addEventListener null”, or “funnel/proxy”.
---

## CorePOS incident runbook (what broke + how we fixed it)

## نظام التوثيق (Rules + Taxonomy + Template)

### الهدف

تخلي أي مشكلة في CorePOS **سهلة الفهم والبحث**: تعرف النوع بسرعة، تلاقي خطوات التشخيص، وتوصل للحل + التحقق + منع التكرار.

### قواعد ذهبية (لا تتكسر)

- **لا أسرار في الشات أو git**: `DEPLOY_SSH_KEY`, `DATABASE_URL`, tokens, cookies.
- **شخّص قبل ما تصلّح**: لوجات + `curl` + `git rev-parse` أولاً.
- **كل Fix لازم له Verification** (قبل/بعد) + “إزاي نتأكد إنها مش هترجع”.
- **أي تغيير DB schema لازم Migration SQL** (idempotent) مع `ON_ERROR_STOP=1`.
- **أي تغيير Deploy لازم يبقى gated** (tests + build) قبل التنفيذ على السيرفر.

### تصنيف المشاكل (Taxonomy)

استخدم القيم دي ثابتة في كل Incident:

- **Type**
  - `deploy` (CI/CD, secrets, restart cmd)
  - `server` (filesystem, permissions, missing tools)
  - `docker` (compose, networks, containers)
  - `proxy` (nginx/funnel/routing)
  - `db-schema` (migrations, missing tables/columns/constraints)
  - `db-data` (data integrity, missing seed/default rows)
  - `frontend-static` (public assets caching, JS runtime)
  - `frontend-ssr` (Next SSR/Server Components)
  - `backend-api` (Nest endpoints, auth, services)
  - `observability` (logs, traces, metrics gaps)

- **Surface (where user sees it)**
  - `browser-console`
  - `browser-network`
  - `github-actions`
  - `server-shell`
  - `docker-logs`
  - `db-psql`

- **HTTP status** (لو applicable): `401|403|404|409|422|500|502|504`

- **Severity**
  - `P0` production down / cannot login / cannot sell
  - `P1` major feature broken but app partially usable
  - `P2` degraded UX/perf / non-critical screen
  - `P3` minor / cosmetic / edge-case

### قواعد التسمية والـ IDs

- كل incident لازم يبقى له ID بالشكل: `INC-YYYY-MMDD-###` (مثال: `INC-2026-0427-001`)
- العنوان لازم يبقى: **[Type] [Surface] [key symptom]**
- لو في Entities مهمة، حطها في العنوان أو tags: `companyId`, `container`, `endpoint`.

### Template موحّد لأي Incident جديد

انسخ القالب ده كما هو عند إضافة مشكلة جديدة:

```md
## INC-YYYY-MMDD-### — [type] [surface] [short symptom]

### Meta

- **Type**:
- **Severity**: P?
- **Surface**:
- **Status/Code**: (HTTP status أو error code)
- **Scope**: (prod/stage/local) + (single company / all)
- **First seen**:
- **Last seen**:
- **Owner**: (optional)
- **Related**: (INC-... links)

### Symptom (اللي ظاهر)

- …

### Quick triage (30–90s)

```bash
# 1) confirm request path
# 2) confirm backend health/proxy health
# 3) tail logs (backend/proxy/frontend)
```

### Diagnosis (أدلة + خطوات)

- **Evidence**:
  - …
- **What we ruled out**:
  - …

### Root cause

- …

### Fix applied

- **Change**: (workflow / server cmd / migration / code)
- **Where**: (file path / secret name / container)

### Verification (قبل/بعد)

- …

### Prevention (منع تكرارها)

- …
```

### فهارس (Indexes)

أضف أي Incident جديد في الفهارس دي:

- **By type**: `deploy`, `db-schema`, `proxy`, …
- **By HTTP status**: `500`, `502`, …
- **By component**: `corepos-backend`, `corepos-frontend`, `corepos-funnel-proxy`, `newapp-postgres`

### Hard rules

- **Never paste secrets** (`DEPLOY_SSH_KEY`, `DATABASE_URL`, tokens) into chat or git.
- Prefer **read-only evidence** (logs + curl + `git rev-parse`) before “fixing”.
- When changing DB schema, prefer **idempotent SQL** and `ON_ERROR_STOP=1`.
- When changing deploy behavior, ensure the workflow is **gated by tests/build**.

---

## Production baseline (facts we relied on)

- **Server alias**: `home` (SSH alias)
- **Repo on server**: `/home/eldrwal/projects/CorePOS`
- **Deploy dir**: `/home/eldrwal/projects/CorePOS/deploy`
- **App containers**: `corepos-backend`, `corepos-frontend`
- **Postgres container**: `newapp-postgres`
- **Backend port**: `4100` (host)
- **Frontend port**: `4101` (host)
- **Public entry**: `tailscale funnel` → nginx proxy (`corepos-funnel-proxy`)
- **Proxy config**: `/home/eldrwal/projects/corepos-funnel-proxy/nginx.conf`
- **Prod env source**: `/home/eldrwal/projects/CorePOS/deploy/.env` (contains `DATABASE_URL` — never print it)

---

## Standard playbooks (copy/paste)

### Discovery checklist (first 60 seconds)

Run read-only commands to establish “what is deployed” + “what is running”:

```bash
# git HEAD (branch + sha)
ssh home 'set -euo pipefail; cd /home/eldrwal/projects/CorePOS; git rev-parse --abbrev-ref HEAD; git rev-parse --short HEAD; git log -1 --oneline'

# containers
ssh home 'set -euo pipefail; docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | sed -n "1,80p"'

# compose status
ssh home 'set -euo pipefail; cd /home/eldrwal/projects/CorePOS/deploy; docker compose ps'
```

### Local health checks (bypass funnel)

Isolate “app down” from “funnel/proxy misrouted”:

```bash
ssh home 'set -euo pipefail; curl -fsS http://127.0.0.1:4101/ >/dev/null; echo "frontend local ok"'
ssh home 'set -euo pipefail; curl -fsS http://127.0.0.1:4100/v1/health >/dev/null; echo "backend local ok"'
ssh home 'set -euo pipefail; curl -fsS http://127.0.0.1:18090/v1/health >/dev/null; echo "proxy api ok"'
```

### DB safe patterns (no secret leakage)

Never print `DATABASE_URL`. Only confirm it exists/loads, then run SQL via stdin:

```bash
# confirm DB container exists + DATABASE_URL present (redacted)
ssh home 'set -euo pipefail; docker ps --filter "name=newapp-postgres" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
ssh home 'set -euo pipefail; set -a; . /home/eldrwal/projects/CorePOS/deploy/.env; set +a; test -n "${DATABASE_URL:-}"; echo "DATABASE_URL present (redacted)"'

# run SQL safely (stdin) with ON_ERROR_STOP
ssh home 'set -euo pipefail; set -a; . /home/eldrwal/projects/CorePOS/deploy/.env; set +a; docker exec -i newapp-postgres psql "$DATABASE_URL" -v ON_ERROR_STOP=1' <<'SQL'
select now();
SQL
```

### Tailscale + Funnel quick checks

```bash
ssh home 'set -euo pipefail; tailscale status || true'
ssh home 'set -euo pipefail; tailscale funnel status || true'
ssh home 'set -euo pipefail; docker ps --filter "name=corepos-funnel-proxy" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
ssh home 'set -euo pipefail; sed -n "1,220p" /home/eldrwal/projects/corepos-funnel-proxy/nginx.conf'
```

---

## Recent incidents index (latest first)

- `INC-2026-0427-010` — `backend-api` + `frontend-ssr` — Bulk import sheet fails (TENANT_MISSING / company context)
- `INC-2026-0427-009` — `db-schema` — Missing `payment_methods` breaks POS payment options (500)
- `INC-2026-0427-008` — `db-schema` + `frontend-ssr` — Missing print tables breaks printing settings SSR (500)

## INC-2026-0427-001 — deploy github-actions Deploy success but server SHA old

### Meta

- **Type**: `deploy`
- **Severity**: P1
- **Surface**: `github-actions` + `server-shell`
- **Status/Code**: —
- **Scope**: prod / all

### Symptom (اللي ظاهر)

### Symptom (اللي ظاهر)

- GitHub Actions `deploy` **success** لكن على السيرفر:
  - `git rev-parse --short HEAD` ≠ آخر commit على `main`

### How to confirm (أوامر سريعة)

```bash
ssh home 'set -euo pipefail; cd /home/eldrwal/projects/CorePOS; git rev-parse --short HEAD; git log -1 --oneline'
```

### Root cause

- `DEPLOY_RESTART_CMD` كان بيعمل restart/build بدون `git pull`/`fetch` قبلها.

### Fix applied

- تعديل `DEPLOY_RESTART_CMD` ليعمل:
  - `git fetch origin main`
  - `git reset --hard FETCH_HEAD`
  - ثم rebuild/restart

> ملاحظة: تجنب `git clean -fd` لو ملفات الـ deploy (compose/Dockerfile) **مش متتبعة في git**.

---

## INC-2026-0427-002 — server-shell deploy git pull fails due to local changes

### Meta

- **Type**: `server`
- **Severity**: P1
- **Surface**: `github-actions` + `server-shell`
- **Status/Code**: —
- **Scope**: prod / deploy only

### Symptom

### Symptom

- deploy step يفشل برسالة:
  - `Your local changes ... would be overwritten by merge`

### How to confirm

```bash
ssh home 'set -euo pipefail; cd /home/eldrwal/projects/CorePOS; git status --porcelain'
```

### Root cause

- السيرفر كان عليه **local edits** غير معمولة commit.

### Fix applied

- اعتماد `git fetch + reset --hard` بدل merge.

---

## INC-2026-0427-003 — server-shell db-schema migrate fails due to missing env/psql

### Meta

- **Type**: `server` + `db-schema`
- **Severity**: P1
- **Surface**: `github-actions` + `server-shell`
- **Status/Code**: —
- **Scope**: prod / deploy only

### Symptom A

### Symptom A

- سكربت migrations يطبع:
  - `Missing .env at: /home/eldrwal/projects/CorePOS/apps/backend/.env`

### Root cause A

- production `.env` الحقيقي كان في `deploy/.env` مش `apps/backend/.env`.

### Fix pattern A (safe)

- تحميل env من `deploy/.env` (بدون طباعته) ثم تشغيل SQL على Postgres.

### Symptom B

- `psql: command not found`

### Root cause B

- `psql` مش متسطّب على host.

### Fix applied

- تشغيل SQL داخل كونتينر Postgres:

```bash
ssh home 'set -euo pipefail; set -a; . /home/eldrwal/projects/CorePOS/deploy/.env; set +a; docker exec -i newapp-postgres psql "$DATABASE_URL" -v ON_ERROR_STOP=1' <<'SQL'
select now();
SQL
```

---

## INC-2026-0427-004 — proxy browser-network 502 Bad Gateway on /v1/auth/login

### Meta

- **Type**: `proxy` + `docker`
- **Severity**: P0
- **Surface**: `browser-network` + `docker-logs`
- **Status/Code**: 502
- **Scope**: prod / all

### Symptom

### Symptom

- Frontend يعمل `POST https://...:10000/v1/auth/login` ويرجع `502`.

### How to diagnose (fast path)

1) هل الباكند شغال؟

```bash
ssh home 'set -euo pipefail; curl -fsS http://127.0.0.1:4100/v1/health && echo'
```

2) هل البروكسي الداخلي شغال؟

```bash
ssh home 'set -euo pipefail; curl -fsS http://127.0.0.1:18090/v1/health && echo'
```

3) tail logs للبروكسي

```bash
ssh home 'set -euo pipefail; docker logs --tail 120 corepos-funnel-proxy || true'
```

### Root cause

- `corepos-backend` كان بيرفض يقوم بسبب DB DNS failure (`EAI_AGAIN newapp-postgres`).
- السبب: كونتينر `newapp-postgres` **مش على نفس Docker network** بتاعة الـ deploy.

### Fix applied

- ربط `newapp-postgres` على شبكة `deploy_default` ثم restart للباكند:

```bash
ssh home 'set -euo pipefail;
  net=$(docker inspect corepos-backend -f "{{range \$k,\$v := .NetworkSettings.Networks}}{{println \$k}}{{end}}" | head -n1);
  docker network connect "$net" newapp-postgres 2>/dev/null || true;
  docker restart corepos-backend;
'
```

---

## INC-2026-0427-005 — db-schema backend-api 500 on /v1/auth/login (missing org_unit_id)

### Meta

- **Type**: `db-schema` + `backend-api`
- **Severity**: P0
- **Surface**: `browser-network` + `docker-logs`
- **Status/Code**: 500
- **Scope**: prod / auth flow

### Symptom750

### Symptom

- `POST /v1/auth/login` يرجع `500`
- backend logs:
  - `column "org_unit_id" does not exist`

### How to diagnose

```bash
ssh home 'set -euo pipefail; docker logs --tail 200 corepos-backend | grep -i "org_unit_id\\|DrizzleQueryError" || true'
```

### Root cause

- DB schema drift: الباكند كان متوقع `profiles.org_unit_id` لكن migration SQL مش مطبّقة.

### Fix applied

- إضافة migration SQL جديدة **داخل** `apps/backend/db/migrations/0005_org_units.sql` (idempotent) ثم deploy.

### Verification

- الطلب يرجع `401 Invalid credentials` بدل `500` عند استخدام بيانات غلط.

---

## INC-2026-0427-006 — frontend-static browser-console share-modal addEventListener null

### Meta

- **Type**: `frontend-static`
- **Severity**: P2
- **Surface**: `browser-console`
- **Status/Code**: —
- **Scope**: prod / some clients

### Symptom

### Symptom

- Console:
  - `share-modal.js:1 Uncaught TypeError ... addEventListener`

### What we observed

- النسخة اللي السيرفر بيخدمها من نفس الدومين كانت سليمة وفيها null-checks:

```bash
ssh home 'set -euo pipefail; curl -sS http://127.0.0.1:18090/share-modal.js | sed -n "1,80p"'
```

### Root cause (most likely)

- **Cache** في المتصفح: المتصفح كان بيشغّل نسخة قديمة/مختلفة (خصوصًا لأن الملف كان unbundled داخل `public/`).

### Fix options

- **User-side**: Hard refresh `Ctrl+Shift+R` أو Incognito.
- **Engineering** (لو المشكلة بتتكرر):
  - rename to versioned file (مثلاً `share-modal.v2.js`)
  - أو serve with stronger no-cache headers
  - أو نقل logic لكود React بدل `<script>` خارجي.

---

## INC-2026-0427-007 — deploy github-actions ssh-action timeout during deploy

### Meta

- **Type**: `deploy`
- **Severity**: P1
- **Surface**: `github-actions`
- **Status/Code**: timeout
- **Scope**: prod / deploy only

### Symptom

### Symptom

- `ssh-action` يقطع قبل ما يخلص build/restart.

### Fix applied

- زيادة `command_timeout` في `.github/workflows/deploy.yml`:
  - `command_timeout: 30m`

---

## INC-2026-0427-008 — db-schema frontend-ssr Printing settings SSR 500 (missing print tables)

### Meta

- **Type**: `db-schema` + `frontend-ssr` + `backend-api`
- **Severity**: P1
- **Surface**: `browser-network` + `browser-console` + `docker-logs`
- **Status/Code**: 500 (`INVARIANT_VIOLATION` → BackendApiError)
- **Scope**: prod / printing settings screens
- **Related**: `INC-2026-0427-005` (same pattern: schema drift causes 500)

### Symptom (اللي ظاهر)

- عند فتح: `/dashboard/settings/printing`
  - Console: `Error: An error occurred in the Server Components render`
  - SSR fails (page does not render)

### Quick triage (30–90s)

```bash
# 1) confirm backend is up
ssh home 'curl -sS -m 10 -o /dev/null -w "http_code=%{http_code}\n" http://127.0.0.1:18090/v1/health'

# 2) tail backend errors for print tables
ssh home 'docker logs --tail 400 corepos-backend | grep -i "print_settings\\|print_templates\\|DrizzleQueryError" || true'

# 3) tail frontend SSR errors
ssh home 'docker logs --tail 250 corepos-frontend | grep -i "printing\\|BackendApiError\\|digest" || true'
```

### Root cause

- DB schema drift: backend queries tables `print_settings` + `print_templates` (defined in Drizzle schema)
  but Postgres did not have the tables yet:
  - `relation "print_settings" does not exist`
  - `relation "print_templates" does not exist`

### Fix applied

- **Change**: add idempotent migration creating both tables + constraints + unique index
- **Where**: `apps/backend/db/migrations/0006_printing.sql`

### Verification (قبل/بعد)

```bash
# confirm tables exist
ssh home 'set -euo pipefail; DB=$(docker exec corepos-backend sh -lc '\''echo "$DATABASE_URL"'\'' ); \
  docker exec -i newapp-postgres psql "$DB" -Atc "select to_regclass('\''public.print_templates'\''), to_regclass('\''public.print_settings'\'');"'

# should render printing settings page after deploy (no SSR error)
```

### Prevention (منع تكرارها)

- أي table جديدة في `apps/backend/src/common/db/schema.ts` لازم يقابلها migration SQL في `apps/backend/db/migrations/`.
- عند ظهور “Server Components render” في production: اعتبره غالبًا **backend 500** خلف SSR — روح للـ backend logs أولاً.

---

## INC-2026-0427-009 — db-schema backend-api POS payment options missing (payment_methods table)

### Meta

- **Type**: `db-schema` + `backend-api`
- **Severity**: P0 (بيع/تحصيل متأثر)
- **Surface**: `browser-network` + `docker-logs`
- **Status/Code**: 500
- **Scope**: prod / POS + finance flows
- **Related**: `INC-2026-0427-008` (same schema-drift category)

### Symptom (اللي ظاهر)

- “طرق الدفع” لا تظهر في شاشة الدفع داخل POS.
- Backend logs show request failing:
  - `Exception on /v1/finance/payment-methods`
  - `relation "payment_methods" does not exist`

### Quick triage (30–90s)

```bash
# tail backend for payment methods error
ssh home 'docker logs --tail 400 corepos-backend | grep -i "payment_methods\\|payment-methods\\|DrizzleQueryError" || true'
```

### Root cause

- DB missing reference table `payment_methods` used by Finance/POS.

### Fix applied

- **Change**: create `payment_methods` table + FK to companies + unique index `(company_id, code)`
- **Where**: `apps/backend/db/migrations/0007_payment_methods.sql`

### Verification (قبل/بعد)

```bash
# confirm table exists
ssh home 'set -euo pipefail; DB=$(docker exec corepos-backend sh -lc '\''echo "$DATABASE_URL"'\'' ); \
  docker exec -i newapp-postgres psql "$DB" -Atc "select to_regclass('\''public.payment_methods'\'');"'

# note: endpoint requires session cookie; without auth you'll get 401 not 500
ssh home 'curl -sS -m 10 -o /tmp/pm.json -w "http_code=%{http_code}\n" http://127.0.0.1:18090/v1/finance/payment-methods || true; head -c 200 /tmp/pm.json; echo'
```

### Prevention (منع تكرارها)

- إضافة “schema drift checklist” قبل أي deploy: confirm new tables exist (via `to_regclass`) بعد الميجريشن.
- (اختياري) seed default payment methods per company in onboarding to avoid empty UI (ده `db-data` مش `db-schema`).

---

## INC-2026-0427-010 — backend-api frontend-ssr Bulk import sheet fails (TENANT_MISSING)

### Meta

- **Type**: `backend-api` + `frontend-ssr`
- **Severity**: P1
- **Surface**: `browser-network` + `docker-logs`
- **Status/Code**: backend 400 `TENANT_MISSING` (ظهر للمستخدم كـ 500 أثناء Server Action)
- **Scope**: prod / inventory bulk import (products)
- **Related**: `INC-2026-0427-008`, `INC-2026-0427-009`

### Symptom (اللي ظاهر)

- عند استيراد شيت المنتجات (Bulk Import):
  - Network: `POST /dashboard/inventory/products` → 500 (UI يفشل)
  - Console: “Server Components render” error

### Diagnosis (أدلة + خطوات)

Backend logs:

- `Exception on /v1/inventory/products/bulk-import`
- `BadRequestException: Missing company context`
- `code: TENANT_MISSING`

```bash
ssh home 'docker logs --tail 500 corepos-backend | grep -i \"bulk-import\\|TENANT_MISSING\\|Missing company context\" || true'
```

### Root cause

- Endpoint `POST /v1/inventory/products/bulk-import` بيتطلب header `x-company-id`.
- Flow الاستيراد (client → server action) ماكانش بيمرّر `companyId`، فالباك إند رفض الطلب.

### Fix applied

- **Change**: تمرير `companyId` صراحة كـ `x-company-id` في bulk import
- **Where**:
  - `src/components/inventory/BulkImportDialog.tsx`
  - `src/lib/actions/inventory.actions.ts`
  - `src/lib/api/inventory.ts`

### Verification (قبل/بعد)

- بعد الديبلوي، إعادة تجربة الاستيراد لا يجب أن تُرجع `TENANT_MISSING`.
- لو ظهر Toast “لا يمكن الاستيراد بدون تحديد الشركة…” فهذا يعني `profile.company_id` غير محمّل → logout/login.

### Prevention (منع تكرارها)

- أي endpoint عليه `requireCompanyId` لازم يكون في الـ client/server actions فيه تمرير واضح لـ `companyId` عند الحاجة.

## Quick “one shot” health checklist (بعد أي deploy)

```bash
ssh home 'set -euo pipefail;
  cd /home/eldrwal/projects/CorePOS;
  echo \"sha=$(git rev-parse --short HEAD)\";
  docker ps --filter name=corepos-backend --format \"backend {{.Status}}\";
  docker ps --filter name=corepos-frontend --format \"frontend {{.Status}}\";
  curl -fsS http://127.0.0.1:4100/v1/health >/dev/null && echo \"backend health ok\";
  curl -fsS http://127.0.0.1:18090/v1/health >/dev/null && echo \"proxy api ok\";
'
```

