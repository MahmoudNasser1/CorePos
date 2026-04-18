-- ============================================================
-- Pos-Sahl — Premium Features Migration
-- تتبع العمليات، التقارير المالية المتقدمة، ونظام الإشعارات
-- ============================================================

-- ١. سجل العمليات (Audit Logs)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,    -- 'CREATE', 'UPDATE', 'DELETE', 'VOID', 'LOGIN'
  entity      TEXT NOT NULL,    -- 'INVOICE', 'PRODUCT', 'EXPENSE', 'SETTING'
  entity_id   UUID,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_company ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity);

-- ٢. إشعارات الشركة (Company Notifications)
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read     BOOLEAN DEFAULT FALSE,
  metadata    JSONB,            -- { "link": "/dashboard/reports/stock", "target_id": "..." }
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_company ON notifications(company_id);

-- ٣. رؤية قائمة الدخل (Profit & Loss View)
-- ────────────────────────────────────────
CREATE OR REPLACE VIEW v_profit_loss_summary AS
SELECT
  i.company_id,
  i.branch_id,
  DATE_TRUNC('day', i.date) as report_date,
  -- المبيعات
  SUM(CASE WHEN i.type = 'sale' THEN i.total ELSE 0 END) as total_sales,
  SUM(CASE WHEN i.type = 'sale' THEN i.tax_amount ELSE 0 END) as sales_tax,
  -- تكلفة المبيعات والأرباح الإجمالية
  SUM(CASE WHEN i.type = 'sale' THEN (
    SELECT SUM(profit) FROM invoice_items WHERE invoice_id = i.id
  ) ELSE 0 END) as gross_profit,
  -- المصروفات
  COALESCE((
    SELECT SUM(amount) FROM expenses
    WHERE company_id = i.company_id
    AND DATE_TRUNC('day', date) = DATE_TRUNC('day', i.date)
  ), 0) as total_expenses
FROM invoices i
WHERE i.status != 'void'
GROUP BY i.company_id, i.branch_id, DATE_TRUNC('day', i.date);

-- ٤. رؤية الأصناف الأكثر مبيعاً (Top Products View)
-- ────────────────────────────────────────
CREATE OR REPLACE VIEW v_top_selling_products AS
SELECT
  i.company_id,
  ii.product_id,
  p.name as product_name,
  SUM(ii.qty) as total_qty,
  SUM(ii.total_line) as total_revenue,
  SUM(ii.profit) as total_profit
FROM invoice_items ii
JOIN invoices i ON i.id = ii.invoice_id
JOIN products p ON p.id = ii.product_id
WHERE i.type = 'sale' AND i.status != 'void'
GROUP BY i.company_id, ii.product_id, p.name
ORDER BY total_profit DESC;

-- ٥. دالة لتسجيل العمليات (Helper Function)
-- ────────────────────────────────────────
CREATE OR REPLACE FUNCTION log_action(
  p_company_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_entity TEXT,
  p_entity_id UUID,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (company_id, user_id, action, entity, entity_id, old_values, new_values)
  VALUES (p_company_id, p_user_id, p_action, p_entity, p_entity_id, p_old_values, p_new_values);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
