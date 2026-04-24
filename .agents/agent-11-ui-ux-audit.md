# 🧭 Agent 11 — UI/UX Audit & Improvement Engineer
**المشروع:** CorePOS | **الحالة:** قبل Gate 4 (Pre-Sale) | **يعتمد على:** Agent-03 (Design System) + صفحات Phase 2/3

---

## 🎯 مهمتك

مراجعة **كامل واجهة CorePOS** (65+ صفحة، 50+ component) ثم **تنفيذ التحسينات فعليًا** (مش تقرير فقط).

**الهدف النهائي:**
- واجهة احترافية يشتريها عميل حقيقي
- لا أخطاء بصرية/وظيفية واضحة
- POS سريع وبدون احتكاك
- طباعة (80mm/A4) تعمل بشكل مثالي
- Accessibility أساسي مُحترم
- RTL عربي 100%

---

## 🛠️ Skills المطلوبة

```text
@ui-ux-auditor         — مراجعة هيوريستيكية (Nielsen's 10 + POS-specific)
@accessibility-auditor — WCAG 2.1 AA (lite) + contrast + labels + focus
@frontend-performance  — Core Web Vitals + React rendering + bundle
@react-patterns        — hooks/state/memoization/error boundaries
@tailwind-patterns     — RTL-safe utilities + responsive + dark mode
@shadcn               — shadcn/ui best practices + customization
@design-systems        — consistency + spacing + typography scale
@rtl-i18n             — Arabic typography + bidi + number formatting
@print-css            — @media print + page breaks + thermal receipt
@pos-ux               — speed/flow/shortcuts/error prevention
```

---

## 📋 اقرأ أولاً (إلزامي)

1) `docs/CONTEXT.md` + `docs/decisions.md`
2) `docs/CODING_STANDARDS.md`
3) `docs/screens_map.md` (إن وجد)
4) `.agents/agent-03-design-system.md` (Design System الأصلي)
5) `src/app/globals.css` (Design tokens + RTL + glass effects)
6) `src/app/layout.tsx` (Cairo font + RTL + metadata)
7) `src/components/layout/Sidebar.tsx` + `Header.tsx`

---

## 🧾 نظام التقارير (ملزم)

- تحديثات: `docs/agent_reports/PROGRESS.md`
- مخاطر/قرار UX كبير: `docs/agent_reports/RISKS.md`
- handoffs لباقي Agents: `docs/agent_reports/HANDOFFS.md`
- **Deliverable أساسي:** `docs/ui_ux_audit.md`

---

## 🧪 أدوات المراجعة

### Playwright (CI-safe)
- تأكيد رحلة المستخدم الكاملة لا تنكسر بعد التعديلات
- `npm run test:e2e`

### Chrome DevTools (Evidence يدوي)
- **Elements**: RTL direction, font loading, computed styles
- **Application → Cookies**: session attributes
- **Network**: slow endpoints, missing assets, 401s صامتة
- **Console**: errors/warnings أثناء التنقل
- **Performance**: profile لصفحات بطيئة
- **Print preview + Emulate print media**: فواتير/إيصالات
- **Lighthouse**: Accessibility + Performance scores

### Axe / DevTools A11y
- contrast checker + aria-label + focus order

> كل فحص لازم ينتج **Evidence** (screenshot/note/profile) يُذكر في `docs/ui_ux_audit.md`.

---

## 🗺️ خريطة المراجعة الكاملة (بالترتيب)

### Phase A — Global Shell & Navigation

| # | النقطة | الملفات المعنية | ماذا تفحص |
|---|--------|----------------|-----------|
| A1 | Sidebar navigation | `Sidebar.tsx` | grouping منطقي (15 عنصر كتير — هل يحتاج تقسيم؟)، active state، scroll behavior |
| A2 | Sidebar على mobile | `Sidebar.tsx` + layout | هل يوجد bottom nav / sheet؟ هل reachable بإبهام واحد؟ |
| A3 | Header | `Header.tsx` | user info، logout، breadcrumbs، responsiveness |
| A4 | Page titles | كل `page.tsx` | consistency (كل صفحة لها PageHeader/title؟) |
| A5 | Loading states | layouts + pages | skeleton/spinner أثناء fetch؟ ولا blank؟ |
| A6 | Error boundary | `error.tsx` | هل يعرض رسالة مفيدة بالعربي؟ retry button؟ |
| A7 | Empty states | tables/lists | هل فيه EmptyState component؟ ولا الجدول فاضي بدون رسالة؟ |
| A8 | Toast/Notifications | `Toaster` (sonner) | position RTL-safe؟ رسائل بالعربي؟ |
| A9 | Command menu | `CommandMenu.tsx` | Ctrl+K / بحث شامل — يعمل؟ RTL-safe؟ |
| A10 | Dark mode | globals.css `.dark` | هل فيه toggle؟ هل الألوان محترمة في dark؟ |

### Phase B — Auth & Onboarding

| # | النقطة | الملفات المعنية | ماذا تفحص |
|---|--------|----------------|-----------|
| B1 | Login page | `(auth)/login/page.tsx` | validation بالعربي، loading state، error recovery، password visibility toggle |
| B2 | Register page | `(auth)/register/page.tsx` | form complexity مناسبة؟ steps واضحة؟ |
| B3 | Forgot password | `(auth)/forgot-password/page.tsx` | flow واضح؟ success/error messages؟ |
| B4 | Onboarding flow | `(onboarding)/company + warehouse + sample-data` | stepper/progress indicator؟ back navigation؟ skip option؟ |
| B5 | Session expired | `(billing)/billing/expired/page.tsx` | رسالة واضحة؟ CTA واضح؟ |

### Phase C — Dashboard (الرئيسية)

| # | النقطة | الملفات المعنية | ماذا تفحص |
|---|--------|----------------|-----------|
| C1 | KPI Grid | `KPIGrid.tsx` | بيانات واقعية ومفهومة؟ ألوان واضحة؟ responsive؟ |
| C2 | Sales Chart | `SalesChart.tsx` | axis labels بالعربي؟ legend واضح؟ empty state؟ |
| C3 | Top Products | `TopProductsChart.tsx` | sorting صحيح؟ responsive؟ |
| C4 | Recent Invoices | `RecentInvoices.tsx` | clickable؟ status badge واضح؟ |
| C5 | Low Stock Widget | `LowStockWidget.tsx` | تنبيه واضح؟ link لصفحة المنتج؟ |
| C6 | Stock Alerts | `StockAlertsWidget.tsx` | urgency واضحة بصريًا (لون/أيقونة)؟ |

### Phase D — POS (الأهم)

| # | النقطة | الملفات المعنية | ماذا تفحص |
|---|--------|----------------|-----------|
| D1 | Product search | `POSProductGrid.tsx` | سرعة البحث (< 200ms)؟ highlight للمطابقة؟ |
| D2 | Barcode scanner | `useBarcodeScanner.ts` | يعمل مع scanner حقيقي؟ fallback لو فشل؟ |
| D3 | Product grid | `POSProductGrid.tsx` | responsive؟ image fallback؟ out-of-stock visual؟ |
| D4 | Cart (السلة) | `POSCart.tsx` | add/remove/qty سريع وبدون lag؟ total يتحدث فورًا؟ |
| D5 | Cart — empty | `POSCart.tsx` | رسالة واضحة عشان المستخدم يبدأ |
| D6 | Qty editing | `POSCart.tsx` | +/- واضح؟ direct input؟ min=1/max validation؟ |
| D7 | Customer select | `CustomerSelect.tsx` | search + create inline؟ أو modal؟ |
| D8 | Payment modal | `PaymentModal.tsx` | focus management؟ cash/deferred/card واضحين؟ |
| D9 | Double submit prevention | `PaymentModal.tsx` | loading state + button disable بعد أول click |
| D10 | Success screen | POS page | invoice number واضح؟ "فاتورة جديدة" CTA؟ print CTA؟ |
| D11 | Receipt | `POSReceipt.tsx` | 80mm thermal preview؟ بيانات كاملة؟ |
| D12 | Held carts | `HeldCartsModal.tsx` | resume + delete واضحين؟ timestamp؟ |
| D13 | Keyboard shortcuts | POS page | F1=search? Enter=checkout? documented؟ |
| D14 | POS header | `pos/Header.tsx` | branch/warehouse selector واضح؟ user info؟ |

### Phase E — Inventory

| # | النقطة | الملفات المعنية | ماذا تفحص |
|---|--------|----------------|-----------|
| E1 | Products list | `products/page.tsx` + `ProductColumns.tsx` | pagination؟ search؟ filters (category/status)؟ |
| E2 | Product form | `ProductForm.tsx` | fields واضحة؟ validation؟ image upload UX؟ |
| E3 | Product detail | `products/[id]/page.tsx` | stock levels واضحة؟ edit CTA؟ |
| E4 | Categories | `categories/page.tsx` | tree/hierarchy واضح؟ add/edit/delete؟ |
| E5 | Barcode print | `BarcodePrintDialog.tsx` | preview واضح؟ qty selector؟ |
| E6 | Low stock alerts | products list | visual indicator واضح (icon/color) للمنتجات المنخفضة |

### Phase F — Sales & Invoices

| # | النقطة | الملفات المعنية | ماذا تفحص |
|---|--------|----------------|-----------|
| F1 | Invoice list | `sales/invoices/page.tsx` + `InvoiceTable.tsx` | filters (status/date/customer)؟ search؟ |
| F2 | Invoice form | `InvoiceForm.tsx` | product search inline؟ totals auto-calc؟ |
| F3 | Invoice detail | `sales/invoices/[id]/page.tsx` | status badge؟ payment history؟ actions (print/pay)؟ |
| F4 | Invoice print | `sales/invoices/[id]/print/page.tsx` + `InvoicePrint.tsx` | A4 format؟ page breaks؟ header/footer؟ |
| F5 | Invoice payment | `InvoicePaymentDialog.tsx` | partial payment UX؟ remaining calculation؟ |
| F6 | Quotations | `sales/quotations/page.tsx` | convert to invoice flow؟ |
| F7 | New sale | `sales/new/page.tsx` | overlap مع POS؟ هل واضح الفرق؟ |

### Phase G — Purchases

| # | النقطة | الملفات المعنية | ماذا تفحص |
|---|--------|----------------|-----------|
| G1 | Purchase list | `purchases/invoices/page.tsx` | similar consistency مع sales list |
| G2 | New purchase | `purchases/new/page.tsx` | supplier selection؟ product selection؟ |
| G3 | Purchase orders | `purchases/orders/page.tsx` | status flow واضح؟ |
| G4 | Returns | `purchases/returns/page.tsx` | return flow واضح؟ stock impact visible؟ |

### Phase H — Finance / Treasury

| # | النقطة | الملفات المعنية | ماذا تفحص |
|---|--------|----------------|-----------|
| H1 | Treasury list | `TreasuryList.tsx` / `TreasuryTable.tsx` | balances واضحة؟ color-coded (green/red)؟ |
| H2 | Payment receipt | `PaymentReceiptForm.tsx` | form clear؟ treasury selector؟ |
| H3 | Voucher form | `VoucherForm.tsx` | debit/credit واضحين بالعربي؟ |
| H4 | Expenses | `finance/expenses/page.tsx` + `ExpenseForm.tsx` | categories؟ recurring flag؟ |

### Phase I — Contacts (Customers / Suppliers)

| # | النقطة | الملفات المعنية | ماذا تفحص |
|---|--------|----------------|-----------|
| I1 | Customer list | `customers/page.tsx` + `PartnerTable.tsx` | search + filter + balance column |
| I2 | Customer detail | `customers/[id]/page.tsx` | statement واضح؟ `PartnerStatement.tsx` |
| I3 | Supplier list | `suppliers/page.tsx` | same quality كـ customers |
| I4 | Supplier detail | `suppliers/[id]/page.tsx` | same quality كـ customers |

### Phase J — Reports

| # | النقطة | الملفات المعنية | ماذا تفحص |
|---|--------|----------------|-----------|
| J1 | Reports index | `reports/page.tsx` | report cards/links واضحة ومنظمة؟ |
| J2 | Report filters | `ReportFilters.tsx` | date range picker؟ presets (اليوم/الشهر)؟ |
| J3 | Report table | `ReportTable.tsx` | export (Excel/PDF)؟ print-friendly؟ |
| J4 | Report charts | `ReportCharts.tsx` | meaningful labels؟ responsive؟ empty state؟ |
| J5 | Daily report | `reports/daily/page.tsx` | summary stats واضحة؟ |
| J6 | Stock report | `reports/stock/page.tsx` | stock value calc correct visual؟ |
| J7 | Treasury report | `reports/treasury/page.tsx` | balance + transactions visible؟ |
| J8 | Reports coverage | كل reports/* | كل report page معمولة ولا فيه placeholder/empty؟ |

### Phase K — Settings / Billing / Marketing

| # | النقطة | الملفات المعنية | ماذا تفحص |
|---|--------|----------------|-----------|
| K1 | Settings nav | `SettingsNav.tsx` | tabs/links واضحة؟ |
| K2 | Branches | `settings/branches/page.tsx` | CRUD واضح؟ |
| K3 | Warehouses | `settings/warehouses/page.tsx` | CRUD واضح؟ |
| K4 | Invoice settings | `settings/invoice/page.tsx` + `InvoiceSettingsForm.tsx` | logo upload؟ template preview؟ |
| K5 | Billing page | `(billing)/billing/page.tsx` | plan display؟ upgrade CTA؟ |
| K6 | Billing history | `billing/history/page.tsx` | transaction list واضح؟ |
| K7 | Landing page | `(marketing)/page.tsx` | hero/features/pricing/CTA احترافي؟ |
| K8 | Help center | `dashboard/help/page.tsx` | content مفيد؟ ولا placeholder؟ |
| K9 | Audit logs | `dashboard/audit-logs/page.tsx` | searchable؟ clear format؟ |

### Phase L — Cross-cutting Quality

| # | النقطة | ماذا تفحص |
|---|--------|-----------|
| L1 | RTL consistency | كل الصفحات تستخدم `start/end` مش `left/right`؟ text alignment صح؟ |
| L2 | Number format | Western digits حسب قرار المشروع؟ `formatCurrency` مستخدم في كل الأماكن؟ |
| L3 | Typography scale | headings/body/caption consistent؟ line-height مناسب للعربي؟ |
| L4 | Spacing consistency | padding/margin/gap موحدة (4/8/12/16/24 scale)؟ |
| L5 | Color semantics | green=success, red=danger, amber=warning مستخدمين consistently؟ |
| L6 | Icon consistency | كل الأيقونات من lucide-react؟ sizes موحدة؟ |
| L7 | Responsive | كل الصفحات تعمل على tablet (768px+)؟ الجداول scrollable؟ |
| L8 | Focus management | Tab order منطقي؟ focus ring ظاهر؟ |
| L9 | Error messages | بالعربي دائمًا؟ واضحة ومحددة (مش generic)؟ |
| L10 | Confirm dialogs | أي عملية destructive (حذف/إلغاء) لها confirmation؟ |
| L11 | Print CSS | `@media print` يخفي sidebar/header؟ invoice/receipt مطبوعة صح؟ |
| L12 | Skeleton loaders | الصفحات الثقيلة (dashboard/reports/products) عندها loading skeleton؟ |
| L13 | Hydration errors | `suppressHydrationWarning` مستخدم بحكمة مش بشكل عشوائي؟ |
| L14 | Console errors | رحلة كاملة (login→POS→reports) بدون console errors؟ |

---

## 🧱 طريقة التنفيذ (ملزمة — 4 مراحل)

### المرحلة 1: Audit (حصر المشاكل)
1) امشي على كل Phase (A→L) بالترتيب
2) سجّل كل issue في `docs/ui_ux_audit.md` بالشكل:
   ```
   ### [ID] — [عنوان المشكلة]
   - **Severity**: 🔴 blocker / 🟡 important / 🟢 polish
   - **Location**: route + component
   - **Current**: وصف الحالة الحالية
   - **Expected**: الحالة المطلوبة
   - **Evidence**: (screenshot/notes/DevTools output)
   ```
3) في نهاية الـ Audit: أضف **Summary table** يعدّ: blockers / important / polish

### المرحلة 2: Fix — Blockers أولاً
- نفّذ كل 🔴 blocker
- بعد كل مجموعة fixes: شغّل `npm run lint && npx tsc --noEmit`
- حدّث `docs/ui_ux_audit.md` بعمود "✅ Fixed" مع commit reference

### المرحلة 3: Fix — Important ثم Polish
- نفّذ 🟡 important بنفس الأسلوب
- 🟢 polish: نفّذ اللي يمكن تنفيذه بسرعة، وأجّل الباقي مع توثيق واضح

### المرحلة 4: Regression + Evidence
- شغّل `npm run test:e2e` (أو جزء منه)
- شغّل Lighthouse على 3 صفحات حرجة: `/dashboard`, `/dashboard/pos`, `/dashboard/reports/daily`
- حدّث `docs/ui_ux_audit.md` بقسم "After" مع:
  - screenshots بعد الإصلاح
  - Lighthouse scores
  - قرار: "UI/UX Ready for Pilot? ✅/❌"

---

## ✅ Deliverables

| # | الناتج | الوصف |
|---|--------|------|
| D1 | `docs/ui_ux_audit.md` | سجل كامل: issues + severity + evidence + fixed status |
| D2 | UI fixes (src/app + src/components) | تحسينات فعلية مع commits واضحة |
| D3 | Print/Receipt fixes | `@media print` + thermal receipt + A4 invoice |
| D4 | Accessibility fixes | labels + aria + focus + contrast |
| D5 | Performance fixes | تقليل re-renders + loading states + skeleton |
| D6 | Responsive fixes | tablet + mobile issues |

---

## 🚦 معايير القبول (قبل Gate 4)

### Minimum (Pilot Ready)
- [ ] لا 🔴 blockers مفتوحة في `docs/ui_ux_audit.md`
- [ ] لا Console errors أثناء الرحلة الأساسية (Login→Dashboard→POS sale→Invoice→Reports)
- [ ] POS تفاعلي: add/remove/qty بدون visible lag
- [ ] Payment modal: double-submit prevented
- [ ] Print preview (80mm + A4): لا قص/overflow/missing data
- [ ] RTL: لا text alignment errors واضحة
- [ ] كل form: validation messages بالعربي + loading states
- [ ] Empty states: كل جدول/قائمة لها رسالة "لا يوجد بيانات" مفيدة
- [ ] E2E (أو مرور يدوي) للرحلة الكاملة: pass

### Nice to Have (Commercial)
- [ ] Lighthouse Accessibility ≥ 80 على 3 صفحات حرجة
- [ ] Lighthouse Performance ≥ 70 على POS page
- [ ] كل 🟡 important مغلقة
- [ ] Dark mode يعمل بدون كسر

---

## ⚠️ قواعد صارمة

1. **لا تغيّر business logic** — دورك UI/UX فقط. لو اكتشفت bug في المنطق: افتح Handoff.
2. **لا تكسر الـ E2E** — شغّله بعد كل مجموعة fixes.
3. **لا تضيف dependencies** بدون سبب واضح ومكتوب.
4. **RTL أولاً** — start/end مش left/right.
5. **Arabic-only في الواجهة** — لا كلمة إنجليزية مرئية للمستخدم.
6. **وثّق كل تغيير** في `docs/agent_reports/PROGRESS.md`.
7. **Handoffs واضحة** — لو مشكلة تحتاج Agent آخر (backend/data/auth): سجّلها في `HANDOFFS.md` مع owner + repro + definition of done.

---

## 🔗 تعتمد على

- **Agent-03**: Design System الأصلي (globals.css + tokens + shared components)
- **Agent-04/05/06**: الصفحات الوظيفية (POS/Finance/Reports)
- **Agent-07/08**: Backend/API (لو فيه مشاكل data أو response shapes)
- **Agent-10**: E2E + Release Readiness (نتائج Agent-11 تدخل في قرار Gate 4)
