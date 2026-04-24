# Backend Migration Test Plan

## Phase Gates

### Gate 1 — Foundation
- `npm install`
- `npm run backend:build`
- `npm run backend:start`
- verify:
  - `GET /health` returns `status=ok`
  - `GET /readiness` returns `status=ready`

### Gate 2 — Auth + Tenant
- `POST /auth/login` sets httpOnly cookies.
- `GET /auth/session` returns user/profile/company/subscription payload.
- request with headers `x-company-id` and `x-user-id` is accepted.

### Gate 3 — Onboarding Adapter
- enable `BACKEND_FLAG_ONBOARDING=1`.
- submit onboarding company form.
- submit sample data step.
- ensure frontend navigation remains unchanged.

### Gate 4 — Finance API Smoke
- call `POST /finance/sales` with at least one line.
- verify invoice number format contains `YYMM-`.

### Gate 5 — Reports + Admin
- verify 200 responses for:
  - `/reports/daily`
  - `/reports/sales`
  - `/reports/profits`
  - `/reports/stock`
  - `/reports/treasury`
  - `/admin/companies`
  - `/admin/audit-logs`

## Regression Checks
- onboarding UI/RTL unaffected.
- no direct breakage in existing paths with all flags off.
- enabling onboarding flag moves only onboarding path to backend.
