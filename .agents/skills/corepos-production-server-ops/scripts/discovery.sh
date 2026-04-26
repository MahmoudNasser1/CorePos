#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash .agent/skills/corepos-production-server-ops/scripts/discovery.sh
#
# Assumptions:
# - SSH alias "home" exists (see SKILL.md)

echo "== CorePOS production discovery =="

ssh home 'set -euo pipefail;
  echo;
  echo "## Git";
  cd /home/eldrwal/projects/CorePOS;
  echo "branch=$(git rev-parse --abbrev-ref HEAD)";
  echo "head=$(git rev-parse --short HEAD)";
  git log -1 --oneline;

  echo;
  echo "## Docker ps (top)";
  docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | sed -n "1,80p";

  echo;
  echo "## Compose ps";
  cd /home/eldrwal/projects/CorePOS/deploy;
  docker compose ps;

  echo;
  echo "## Backend health";
  (curl -fsS http://127.0.0.1:4100/v1/health >/dev/null && echo "backend ok") || echo "backend FAIL";

  echo;
  echo "## Frontend local";
  (curl -fsS http://127.0.0.1:4101/ >/dev/null && echo "frontend ok") || echo "frontend FAIL";

  echo;
  echo "## Tailscale status";
  (tailscale status || true) | sed -n "1,25p";

  echo;
  echo "## Funnel status";
  (tailscale funnel status || true) | sed -n "1,80p";
'

echo
echo "== Done =="

