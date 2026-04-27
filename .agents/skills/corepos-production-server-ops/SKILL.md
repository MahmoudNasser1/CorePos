---
name: managing-corepos-production
description: Operates the CorePOS production home server safely. Use when the user mentions CorePOS production, the home server, ssh, deploy, docker compose, tailscale funnel, nginx proxy, DATABASE_URL, migrations, schema drift, or asks to verify what is running in production. Provides repeatable commands to inspect git HEAD, containers, logs, env files, and Postgres schema without persisting secrets.
---

## CorePOS production server operations

### When to use this skill

- The user says **production**, **server**, **home server**, **CorePOS**, **ssh**, **deploy**, **docker compose**, **tailscale**, **funnel**, **nginx proxy**
- The user asks to **verify** what is deployed (commit/branch/image), whether a fix is applied, or why UI/API differs from local
- The user asks to **apply or verify migrations**, compare **DB schema** (server vs local), or fix **missing tables/columns**
- The user references `.env`, `DATABASE_URL`, `DEPLOY_DIR`, or GitHub Actions deploy secrets

### Hard rules (security + correctness)

- **Never write secrets into the skill output or repo** (no real `DATABASE_URL`, tokens, SSH private keys, passwords).
- **Never paste** the contents of `.env` files back to the user. Only confirm presence and required keys.
- Prefer **read-only verification** first (git HEAD, `docker ps`, logs, schema diff) before executing changes.
- For DB changes: **idempotent SQL** and `-v ON_ERROR_STOP=1`. Avoid destructive changes unless explicitly requested.
- For networking changes: prefer **observability first** (tailscale status, funnel status, nginx config) before changing ports or proxies.

### How this skill relates to the incident runbook

- Use this skill to **diagnose and verify production state** (facts + commands).
- Then record the story (symptom → root cause → fix → verification) in:
  - `/.agents/skills/corepos-incident-runbook/SKILL.md`

---

## Project facts (production layout)

- **Production host alias**: `home` (SSH alias expected to exist)
- **Repo on server**: `/home/eldrwal/projects/CorePOS`
- **Deploy folder on server**: `/home/eldrwal/projects/CorePOS/deploy`
- **Backend migrations (repo)**: `apps/backend/db/migrations/*.sql`
- **Production Postgres container**: `newapp-postgres`
- **Production app containers (compose)**: `corepos-backend`, `corepos-frontend`
- **Backend port (host)**: `4100` (container exposes `:4100`)
- **Frontend port (host)**: `4101` (container exposes `:4101`)
- **Funnel proxy**: `corepos-funnel-proxy` reads `/home/eldrwal/projects/corepos-funnel-proxy/nginx.conf`

> If any name differs, re-discover using the “Discovery checklist” below.

---

## Fast triage by symptom (decision tree)

### If the UI shows “Server Components render error” / pages 500

1) Check backend health (bypass funnel)  
2) Tail backend logs for `DrizzleQueryError`  
3) If it’s `relation does not exist` → **schema drift** → apply migrations

### If Funnel returns 502/504

1) Check local health to ports `4101`, `4100`  
2) Check `corepos-funnel-proxy` logs + `nginx.conf`  
3) Verify target containers are on the expected docker network

---

## Database access essentials (safe patterns)

### Where DB connection info lives

- **Primary source**: `/home/eldrwal/projects/CorePOS/deploy/.env`
- **Key name**: `DATABASE_URL` (never print it; only validate it exists)
- **DB container**: `newapp-postgres` (production)

### Quick sanity checks (no secret output)

Check DB container health:

```bash
ssh home 'set -euo pipefail; docker ps --filter "name=newapp-postgres" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
```

Check `DATABASE_URL` is loadable (redacted):

```bash
ssh home 'set -euo pipefail; set -a; . /home/eldrwal/projects/CorePOS/deploy/.env; set +a; test -n "${DATABASE_URL:-}"; echo "DATABASE_URL present (redacted)"'
```

### Running SQL safely (recommended)

Use stdin SQL to avoid quoting issues and to keep commands reproducible:

```bash
ssh home 'set -euo pipefail; set -a; . /home/eldrwal/projects/CorePOS/deploy/.env; set +a; docker exec -i newapp-postgres psql "$DATABASE_URL" -v ON_ERROR_STOP=1' <<'SQL'
select now();
SQL
```

### Quick “schema drift” spot-checks (tables we rely on)

This catches the most common “500 in production” class of issues quickly:

```bash
ssh home 'set -euo pipefail; set -a; . /home/eldrwal/projects/CorePOS/deploy/.env; set +a; docker exec -i newapp-postgres psql "$DATABASE_URL" -At -v ON_ERROR_STOP=1' <<'SQL'
select
  to_regclass('public.users'),
  to_regclass('public.profiles'),
  to_regclass('public.org_units'),
  to_regclass('public.print_templates'),
  to_regclass('public.print_settings'),
  to_regclass('public.payment_methods');
SQL
```

If any value is empty → the table is missing → apply migrations.

### Port-forward (optional; only if you truly need local DB tools)

Forward **localhost:15432 → server:5432** (only while the session is open):

```bash
ssh -N -L 15432:127.0.0.1:5432 home
```

Then connect with your local client using a **local** DSN that targets `localhost:15432`.
Do not paste the real production DSN into chat; read it from the server `.env`.

---

## Tailscale + Funnel essentials (production)

### Mental model (what to check first)

- **Tailscale is connectivity** (device identity + ACLs). Verify the node is online and reachable.
- **Funnel is public ingress** (HTTPS entrypoint) and may be **port-restricted** depending on plan/policy.
- In this project, Funnel typically points to an **Nginx proxy container** (not directly to Next/Nest).

### Quick checks (read-only)

```bash
ssh home 'set -euo pipefail; tailscale status || true'
```

```bash
ssh home 'set -euo pipefail; tailscale funnel status || true'
```

Check the proxy container and its config:

```bash
ssh home 'set -euo pipefail; docker ps --filter "name=corepos-funnel-proxy" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
ssh home 'set -euo pipefail; docker inspect corepos-funnel-proxy --format "{{json .Mounts}}"' | sed -n '1,5p'
ssh home 'set -euo pipefail; sed -n "1,220p" /home/eldrwal/projects/corepos-funnel-proxy/nginx.conf'
```

### Local health tests (bypass funnel)

These isolate “app down” from “funnel misrouted”:

```bash
ssh home 'set -euo pipefail; curl -fsS http://127.0.0.1:4101/ >/dev/null; echo "frontend local ok"'
ssh home 'set -euo pipefail; curl -fsS http://127.0.0.1:4100/v1/health >/dev/null; echo "backend local ok"'
```

### Proxy log triage (502 class)

```bash
ssh home 'set -euo pipefail; docker logs --tail 150 corepos-funnel-proxy || true'
```

### Common failure modes + fixes

- **Funnel works but site loads forever / mixed content**
  - Ensure frontend build has correct public base URLs (baked at build time), or serve through a single origin proxy.
  - Prefer a **same-origin** proxy route (e.g. `/api/backend`) instead of cross-origin calls.

- **Funnel returns 502/504**
  - Nginx proxy points to wrong port/container.
  - Validate the proxy_pass target and that the target port is listening on localhost.

- **Funnel “blocked port” externally**
  - Some ports are not available for public funneling.
  - Workaround: use a known-allowed external port and forward internally via Nginx to `4101`/`4100`.

For deeper procedures, read: `resources/tailscale-funnel.md`.

---

## Discovery checklist (first 60 seconds)

Run these commands (read-only):

```bash
ssh home 'set -euo pipefail; cd /home/eldrwal/projects/CorePOS; git rev-parse --abbrev-ref HEAD; git rev-parse --short HEAD; git log -1 --oneline'
```

```bash
ssh home 'set -euo pipefail; docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | sed -n "1,80p"'
```

```bash
ssh home 'set -euo pipefail; cd /home/eldrwal/projects/CorePOS/deploy; docker compose ps'
```

Logs:

```bash
ssh home 'set -euo pipefail; docker logs --tail 200 corepos-backend || true'
ssh home 'set -euo pipefail; docker logs --tail 200 corepos-frontend || true'
```

### Optional: include proxy logs (when debugging 502/504)

```bash
ssh home 'set -euo pipefail; docker logs --tail 200 corepos-funnel-proxy || true'
```

---

## Safe access to production configuration (no secret leakage)

### Verify deploy `.env` exists and includes required keys

```bash
ssh home 'set -euo pipefail; test -f /home/eldrwal/projects/CorePOS/deploy/.env; echo ".env exists"; (grep -nE "^(DATABASE_URL|NEXT_PUBLIC_|BACKEND_|PORT=)" /home/eldrwal/projects/CorePOS/deploy/.env || true) | sed "s/=.*$/=<redacted>/g"'
```

### Load `DATABASE_URL` inside server shell (never print it)

```bash
ssh home 'set -euo pipefail; set -a; . /home/eldrwal/projects/CorePOS/deploy/.env; set +a; test -n "${DATABASE_URL:-}"; echo "DATABASE_URL loaded (redacted)"'
```

---

## Migrations workflow (production)

### 1) Identify migration directory on the server

```bash
ssh home 'set -euo pipefail; cd /home/eldrwal/projects/CorePOS/apps/backend; ls -la db/migrations | sed -n "1,120p"'
```

### 2) Apply migrations using `psql` inside a postgres container on the DB network

Preferred pattern (idempotent, applies all `*.sql` in order):

```bash
ssh home 'set -euo pipefail;
  set -a; . /home/eldrwal/projects/CorePOS/deploy/.env; set +a;
  MIG_DIR="/home/eldrwal/projects/CorePOS/apps/backend/db/migrations";
  test -d "$MIG_DIR";
  DOCKER_NET="$(docker inspect newapp-postgres --format "{{range $k,$v := .NetworkSettings.Networks}}{{printf \"%s\\n\" $k}}{{end}}" | head -n1)";
  test -n "$DOCKER_NET";
  for f in $(ls -1 "$MIG_DIR"/*.sql 2>/dev/null | sort); do
    echo "--> $(basename "$f")";
    docker run --rm --network "$DOCKER_NET" -v "$MIG_DIR:/migrations:ro" postgres:16 \
      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "/migrations/$(basename "$f")" >/dev/null;
  done;
  echo "Migrations OK";
'
```

### 2b) Verify latest migrations exist on the server (quick)

```bash
ssh home 'set -euo pipefail; ls -1 /home/eldrwal/projects/CorePOS/apps/backend/db/migrations | tail -n 12'
```

### 3) Verify a specific column/table exists

Use stdin SQL to avoid quoting bugs:

```bash
ssh home 'set -euo pipefail; set -a; . /home/eldrwal/projects/CorePOS/deploy/.env; set +a; docker exec -i newapp-postgres psql "$DATABASE_URL" -At' <<'SQL'
select table_name
from information_schema.tables
where table_schema='public'
order by table_name;
SQL
```

---

## Quick verification checklist (after a deploy)

- [ ] `git log -1` on server matches expected commit
- [ ] `docker compose ps` shows `corepos-backend` + `corepos-frontend` **Up**
- [ ] backend health responds: `/v1/health`
- [ ] DB connectivity ok (`select now()`)
- [ ] schema expectations met (spot-check key tables/columns)

### “Deploy succeeded but UI still broken” (fast re-check)

```bash
ssh home 'set -euo pipefail;
  cd /home/eldrwal/projects/CorePOS;
  echo "sha=$(git rev-parse --short HEAD)";
  curl -sS -m 10 -o /dev/null -w "backend_health=%{http_code}\n" http://127.0.0.1:4100/v1/health || true;
  curl -sS -m 10 -o /dev/null -w "frontend_root=%{http_code}\n" http://127.0.0.1:4101/ || true;
  curl -sS -m 10 -o /dev/null -w "proxy_health=%{http_code}\n" http://127.0.0.1:18090/v1/health || true;
'
```

---

## Schema drift comparison (server vs local)

Goal: produce two `--schema-only` dumps and diff them.

### Dump server schema

```bash
ssh home 'set -euo pipefail; set -a; . /home/eldrwal/projects/CorePOS/deploy/.env; set +a; docker exec -i newapp-postgres pg_dump "$DATABASE_URL" --schema-only --no-owner --no-privileges' > /tmp/schema_home.sql
```

### Dump local schema (from local container)

```bash
docker exec -i backend-postgres-1 pg_dump -U pos -d pos --schema-only --no-owner --no-privileges > /tmp/schema_local.sql
```

### Normalize + diff

```bash
python3 - <<'PY'
def norm(p):
  out=[]
  for line in open(p,'r',encoding='utf-8',errors='ignore'):
    if line.startswith('-- Dumped') or line.startswith('-- Started') or line.startswith('-- Completed'):
      continue
    out.append(line)
  return ''.join(out)
open('/tmp/schema_home.norm.sql','w').write(norm('/tmp/schema_home.sql'))
open('/tmp/schema_local.norm.sql','w').write(norm('/tmp/schema_local.sql'))
PY
diff -u /tmp/schema_home.norm.sql /tmp/schema_local.norm.sql | sed -n '1,220p'
```

---

## Deploy/restart (production)

### Rebuild + restart (from deploy folder)

```bash
ssh home 'set -euo pipefail; cd /home/eldrwal/projects/CorePOS/deploy; docker compose up -d --build'
```

### Confirm health quickly

```bash
ssh home 'set -euo pipefail; curl -fsS http://127.0.0.1:4100/v1/health >/dev/null; echo "backend ok"'
```

---

## Troubleshooting patterns

### “It works locally but not on production”

- Verify **git HEAD** on server matches expected commit.
- Verify containers restarted recently and images rebuilt.
- Verify `.env` keys exist (redacted grep).
- Verify DB schema contains required columns/tables.

### “UI not showing a feature”

- Confirm the feature is actually present on the deployed branch/commit.
- Validate whether UI is gated by:
  - session/company existence
  - feature flags endpoint
  - localStorage persistence
  - DB fields (e.g., `profiles.quick_start_dismissed`)

### “UI missing reference data (e.g. payment methods)”

- First decide: is it **schema** (table missing → 500) or **data** (table exists but empty → UI empty).
- Schema check:
  - `to_regclass('public.payment_methods')`
- Data check (no secrets):

```bash
ssh home 'set -euo pipefail; set -a; . /home/eldrwal/projects/CorePOS/deploy/.env; set +a; docker exec -i newapp-postgres psql "$DATABASE_URL" -At -v ON_ERROR_STOP=1' <<'SQL'
select count(*) from payment_methods;
SQL
```

---

## Resources

- Prefer using the existing project skill for broad server ops when needed: `.agent/skills/mastering-home-servers/`
- Service inventory: `resources/service-inventory.md`
- Tailscale/Funnel runbook: `resources/tailscale-funnel.md`

### Suggested improvements (optional to implement later)

- Scripts shipped with this skill:
  - `scripts/discovery.sh`
  - `scripts/schema-diff.sh`
