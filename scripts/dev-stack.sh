#!/usr/bin/env bash
# تشغيل الباكند + الفرونت معاً. يوقف أي مستمع على 4000/4001 أولاً.
# عند الخروج أو Ctrl+C يُوقف العمليتين والمنافذ.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BACKEND_PID=""

kill_port() {
  local port="$1"
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  elif command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -t -iTCP:"${port}" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "${pids}" ]]; then
      # shellcheck disable=SC2086
      kill ${pids} 2>/dev/null || true
      sleep 0.4
      # shellcheck disable=SC2086
      kill -9 ${pids} 2>/dev/null || true
    fi
  else
    echo "تحذير: لا يوجد fuser ولا lsof — لا يمكن إيقاف المنفذ ${port} تلقائياً." >&2
  fi
}

cleanup() {
  echo ""
  echo "==> إيقاف الخدمات والمنافذ 4000 / 4001..."
  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    kill "${BACKEND_PID}" 2>/dev/null || true
    sleep 0.3
    kill -9 "${BACKEND_PID}" 2>/dev/null || true
  fi
  kill_port 4000
  kill_port 4001
}

trap cleanup EXIT INT TERM HUP

echo "==> إيقاف أي عملية على المنفذين 4000 (API) و 4001 (Next)..."
kill_port 4000
kill_port 4001
sleep 0.5

echo "==> بناء الباكند..."
npm run backend:build

echo "==> تشغيل الباكند في الخلفية..."
(
  cd "${ROOT}/apps/backend"
  npm run start
) &
BACKEND_PID=$!

echo "==> انتظار جاهزية /health (حتى ٦٠ ثانية)..."
for _ in $(seq 1 120); do
  if curl -sf "http://127.0.0.1:4000/health" >/dev/null 2>&1; then
    echo "==> الباكند جاهز على http://127.0.0.1:4000"
    break
  fi
  sleep 0.5
  if ! kill -0 "${BACKEND_PID}" 2>/dev/null; then
    echo "خطأ: توقف الباكند قبل أن يصبح جاهزاً. راجع apps/backend/.env و DATABASE_URL." >&2
    exit 1
  fi
done

if ! curl -sf "http://127.0.0.1:4000/health" >/dev/null 2>&1; then
  echo "خطأ: لم يستجب /health خلال المهلة." >&2
  exit 1
fi

echo "==> تشغيل الفرونت (Next على 4001). اضغط Ctrl+C لإيقاف الاثنين."
echo ""
npm run dev
