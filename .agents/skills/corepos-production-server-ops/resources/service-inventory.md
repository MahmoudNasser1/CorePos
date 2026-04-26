# CorePOS production service inventory (snapshot)

> Keep this file updated when container names/ports change. Do not add secrets.

## Hosts / paths

- **SSH alias**: `home`
- **Repo**: `/home/eldrwal/projects/CorePOS`
- **Deploy folder**: `/home/eldrwal/projects/CorePOS/deploy`

## Containers (expected)

### Application (docker compose from `deploy/`)

- **Backend**: `corepos-backend`
  - **Host port**: `4100` → container `4100`
  - **Health**: `GET http://127.0.0.1:4100/v1/health`
- **Frontend**: `corepos-frontend`
  - **Host port**: `4101` → container `4101`
  - **Local**: `http://127.0.0.1:4101/`

### Database

- **Postgres**: `newapp-postgres`
  - Used by `DATABASE_URL` loaded from `deploy/.env`
  - Schema ops:
    - `docker exec -i newapp-postgres psql "$DATABASE_URL" ...`
    - `docker exec -i newapp-postgres pg_dump "$DATABASE_URL" --schema-only ...`

### Public ingress / proxy

- **Funnel proxy**: `corepos-funnel-proxy`
  - Nginx config bind mount:
    - `/home/eldrwal/projects/corepos-funnel-proxy/nginx.conf` → `/etc/nginx/nginx.conf` (read-only)
  - Typical behavior:
    - listens internally on a port (e.g. `18090`)
    - proxies to `http://127.0.0.1:4101`

## Quick commands

List relevant containers:

```bash
ssh home 'docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | (head -n1; rg -n "corepos-|newapp-postgres" -S || true)'
```

Compose status:

```bash
ssh home 'cd /home/eldrwal/projects/CorePOS/deploy && docker compose ps'
```

