# ⚠️ CorePOS — Risks & Mitigations

> **قاعدة:** أي مخاطرة تؤثر على Pilot/Commercial لازم تتسجل هنا مع Owner وخطة تخفيف.

---

## ### Open Risks

<!-- Keep newest on top -->

## ### 2026-04-24 — Nest route warning `/v1/*`
- **Risk**: Nest logs warn about unsupported route path `"/v1/*"` and attempt auto-conversion (path-to-regexp migration).
- **Impact**: Potential misrouting in production for wildcard/fallback routes; could break some endpoints unexpectedly.
- **Mitigation**:
  - ✅ Fixed: replaced middleware wildcard route `*` with supported named wildcard `*path` in `apps/backend/src/app.module.ts`.
- **Owner**: Agent-10

---

## ### Closed / Accepted (Pilot-only)

<!-- Keep newest on top -->

## ### 2026-04-24 — (Closed) E2E POS sale was mocked
- **Was**: POS sale mocked in E2E.
- **Now**: ✅ Closed — `tests/e2e/full_user_journey.spec.ts` يعمل end-to-end: seed backend sample-data → list products → POS sale حقيقي عبر `/v1/finance/pos-sale`.
- **Owner**: Agent-10

