# HANDOFF Template — CorePOS (Frontend ↔ Backend)

> استخدم هذا القالب عند تسليم جزء عمل من Agent إلى Agent آخر.  
> مكان التسجيل: `docs/agent_reports/HANDOFFS.md`

---

### HANDOFF — [عنوان مختصر وواضح]
- **From**: Agent-13 (Backend) / Agent-14 (Frontend) / Agent-12 (Platform Admin) / …
- **To**: Agent-13 / Agent-14 / …
- **Priority**: 🔴 blocker / 🟡 important / 🟢 polish
- **Context**:
  - **Feature/Route**: `/...`
  - **Files touched (إن وُجد)**: `src/...` / `apps/backend/...`
  - **Decision/Doc refs**: `docs/api_contract_map.md` / `docs/api_contract_v1.md` / `docs/plans/system_rbac_ops_plan.md`

#### 1) Goal (ما المطلوب إنجازه؟)
- …

#### 2) Contract / Endpoints
> التزم بـ `docs/api_contract_v1.md` (envelope + tenant + error codes + pagination).

- **Endpoints**:
  - `METHOD /v1/...` (query params: `q, limit, cursor, sort, order`)

#### 3) DTOs (Request/Response)
- **Request**:
  - Example JSON:
    ```json
    {}
    ```
- **Response (OK)**:
  - Example JSON:
    ```json
    { "success": true, "data": {} }
    ```
- **Response (Error)**:
  - Example JSON:
    ```json
    { "success": false, "error": { "code": "CODE", "message": "رسالة عربية" } }
    ```

#### 4) Errors (codes) + UI copy
- `AUTH_UNAUTHORIZED` → …
- `TENANT_MISSING` → …
- `VALIDATION_ERROR` → …
- `NOT_FOUND` → …
- `CONFLICT` → …

#### 5) Constraints / Security
- **Tenancy**: الشركة من cookies/JWT (لا `companyId` في body).
- **RBAC**: من يملك الصلاحية؟ وكيف تُطبق؟
- **Idempotency** (إن لزم): `Idempotency-Key`.
- **Ops safety** (إن لزم): reason/TTL/audit/rate limit/jobs (راجع `docs/agent_reports/OPS_SAFETY_CHARTER.md`).

#### 6) Acceptance Criteria (Definition of Done)
- [ ] …

#### 7) Test plan (Minimum effective test)
- Backend:
  - [ ] `npm run backend:build`
  - [ ] `npm run backend:start`
  - [ ] curl smoke: …
- Frontend:
  - [ ] `npm run lint`
  - [ ] smoke UI steps: …
  - [ ] (اختياري) `npm run test:e2e`

