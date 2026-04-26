#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
MIGRATIONS_DIR="${ROOT_DIR}/db/migrations"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing .env at: $ENV_FILE" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is missing in .env" >&2
  exit 1
fi

echo "Using DATABASE_URL: ${DATABASE_URL}"
echo "Migrations dir: ${MIGRATIONS_DIR}"

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "Missing migrations dir: $MIGRATIONS_DIR" >&2
  exit 1
fi

mapfile -t files < <(ls -1 "${MIGRATIONS_DIR}"/*.sql 2>/dev/null | sort)
if [[ ${#files[@]} -eq 0 ]]; then
  echo "No migration files found in ${MIGRATIONS_DIR}" >&2
  exit 1
fi

echo
echo "== Applying migrations =="
for f in "${files[@]}"; do
  echo "--> $(basename "$f")"
  psql "${DATABASE_URL}" -v ON_ERROR_STOP=1 -f "$f" >/dev/null
done

echo
echo "== Post-migration checks =="

echo "- pgcrypto extension"
psql "${DATABASE_URL}" -v ON_ERROR_STOP=1 -At -c "select extname from pg_extension where extname='pgcrypto';" | grep -q '^pgcrypto$'

echo "- required tables"
for t in companies profiles users invoices invoice_items products categories customers suppliers treasuries treasury_transactions product_stock invoice_sequences idempotency_keys plans subscriptions; do
  exists="$(psql "${DATABASE_URL}" -v ON_ERROR_STOP=1 -At -c "select to_regclass('public.${t}') is not null;")"
  if [[ "$exists" != "t" ]]; then
    echo "Missing table: ${t}" >&2
    exit 1
  fi
done

echo "- idempotency unique constraint"
psql "${DATABASE_URL}" -v ON_ERROR_STOP=1 -At -c "select 1 from pg_indexes where tablename='idempotency_keys' and indexdef ilike '%unique%' limit 1;" | grep -q '^1$'

echo "- subscriptions unique company_id"
psql "${DATABASE_URL}" -v ON_ERROR_STOP=1 -At -c "select 1 from pg_indexes where tablename='subscriptions' and indexdef ilike '%unique%' and indexdef ilike '%company_id%' limit 1;" | grep -q '^1$'

echo
echo "OK: migrations applied and basic checks passed."

