# Tailscale + Funnel runbook (CorePOS production)

## Goals

- Confirm the node is reachable over Tailscale
- Confirm Funnel is actually routing to the intended local service
- Debug the proxy chain quickly without guesswork

## Read-only verification sequence

### 1) Node state

```bash
ssh home 'tailscale status || true'
```

If `tailscale` is missing or not running:

```bash
ssh home 'systemctl status tailscaled --no-pager || true'
```

### 2) Funnel state

```bash
ssh home 'tailscale funnel status || true'
```

If funnel shows nothing, list serve config:

```bash
ssh home 'tailscale serve status || true'
```

### 3) Local target health (bypass Funnel)

```bash
ssh home 'curl -fsS http://127.0.0.1:4101/ >/dev/null && echo "frontend ok" || echo "frontend FAIL"'
ssh home 'curl -fsS http://127.0.0.1:4100/v1/health >/dev/null && echo "backend ok" || echo "backend FAIL"'
```

### 4) Proxy container sanity

```bash
ssh home 'docker ps --filter "name=corepos-funnel-proxy" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
ssh home 'docker inspect corepos-funnel-proxy --format "{{json .Mounts}}"' | sed -n '1,5p'
ssh home 'sed -n "1,220p" /home/eldrwal/projects/corepos-funnel-proxy/nginx.conf'
```

If the config proxies to a wrong port (e.g. not `4101`), fix it **only after** confirming the target ports.

## Common issues

### Mixed content / infinite loading

Symptoms:
- UI loads but API calls fail (CORS/mixed content) or gets stuck

Fix patterns:
- Use a **single origin** for frontend + backend (via same proxy).
- Prefer a same-origin backend proxy path (e.g. `/api/backend`) to avoid cross-origin issues.

### 502 / 504 from Funnel

Usually:
- Proxy upstream down (frontend not listening)
- Wrong proxy_pass target
- Docker container restarted with different port mapping

### Port restrictions

If Funnel refuses or external clients can’t reach a port:
- Treat it as “external port policy” not an app bug.
- Route a known-allowed external port to the internal service via Nginx.

## Safe change procedure (when you must change routing)

- [ ] Confirm local targets healthy (`curl 127.0.0.1:4101`, `4100`)
- [ ] Confirm proxy config file path and mount
- [ ] Edit the Nginx config file (server-side) and reload container
- [ ] Re-check funnel status and end-to-end behavior

