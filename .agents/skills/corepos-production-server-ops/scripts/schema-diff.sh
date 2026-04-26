#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash .agent/skills/corepos-production-server-ops/scripts/schema-diff.sh
#
# Requirements:
# - SSH alias "home"
# - Local dev postgres container name: backend-postgres-1 (adjust if different)
#
# Notes:
# - This script writes temporary dumps to /tmp.
# - It does NOT print secrets; it sources DATABASE_URL only on the server.

HOME_DUMP="/tmp/schema_home.sql"
LOCAL_DUMP="/tmp/schema_local.sql"
HOME_NORM="/tmp/schema_home.norm.sql"
LOCAL_NORM="/tmp/schema_local.norm.sql"

echo "== Dumping production schema (home) =="
ssh home 'set -euo pipefail;
  set -a; . /home/eldrwal/projects/CorePOS/deploy/.env; set +a;
  docker exec -i newapp-postgres pg_dump "$DATABASE_URL" --schema-only --no-owner --no-privileges
' > "$HOME_DUMP"

echo "== Dumping local schema (docker) =="
docker exec -i backend-postgres-1 pg_dump -U pos -d pos --schema-only --no-owner --no-privileges > "$LOCAL_DUMP"

echo "== Normalizing dumps =="
python3 - <<PY
def norm(src, dst):
  out=[]
  for line in open(src,'r',encoding='utf-8',errors='ignore'):
    if line.startswith('-- Dumped') or line.startswith('-- Started') or line.startswith('-- Completed'):
      continue
    out.append(line)
  open(dst,'w',encoding='utf-8').write(''.join(out))

norm("$HOME_DUMP", "$HOME_NORM")
norm("$LOCAL_DUMP", "$LOCAL_NORM")
print("normalized:", "$HOME_NORM", "$LOCAL_NORM")
PY

echo "== Diff (first 250 lines) =="
diff -u "$HOME_NORM" "$LOCAL_NORM" | sed -n '1,250p' || true

echo
echo "Tip: If the diff is huge, re-run and pipe to a file."

