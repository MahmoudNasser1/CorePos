-- ============================================================
-- CorePOS — RLS Policies
-- ============================================================

-- ────────────────────────────────────────
-- تفعيل Row Level Security على جميع الجداول
-- ────────────────────────────────────────

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE salesmen ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────
-- SaaS Tables RLS
-- ────────────────────────────────────────
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_notifications ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────
-- سياسات العزل للشركات (Company Isolation)
-- ────────────────────────────────────────
-- النمط الموحد: company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())

-- 1. Profiles (رؤية ملفات الموظفين نفس الشركة فقط)
CREATE POLICY "profiles_company_isolation" ON profiles
  FOR ALL USING (
    id = auth.uid() OR company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- 2. Companies (كل مستخدم يرى شركته فقط)
CREATE POLICY "companies_isolation" ON companies
  FOR SELECT USING (
    id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- 3. Branches
CREATE POLICY "branches_company_isolation" ON branches
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 4. Warehouses (مرتبطة بفرع)
CREATE POLICY "warehouses_company_isolation" ON warehouses
  FOR ALL USING (
    branch_id IN (SELECT id FROM branches WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()))
  );

-- 5. Categories
CREATE POLICY "categories_company_isolation" ON categories
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 6. Units
CREATE POLICY "units_company_isolation" ON units
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 7. Products
CREATE POLICY "products_company_isolation" ON products
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 8. Product Stock (مرتبط بمنتج)
CREATE POLICY "product_stock_company_isolation" ON product_stock
  FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()))
  );

-- 9. Serial Numbers (مرتبط بمنتج)
CREATE POLICY "serial_numbers_company_isolation" ON serial_numbers
  FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()))
  );

-- 10. Customers
CREATE POLICY "customers_company_isolation" ON customers
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 11. Suppliers
CREATE POLICY "suppliers_company_isolation" ON suppliers
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 12. Salesmen
CREATE POLICY "salesmen_company_isolation" ON salesmen
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 13. Invoice Sequences
CREATE POLICY "invoice_sequences_company_isolation" ON invoice_sequences
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 14. Invoices
CREATE POLICY "invoices_company_isolation" ON invoices
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 15. Invoice Items (مرتبطة بفاتورة)
CREATE POLICY "invoice_items_company_isolation" ON invoice_items
  FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()))
  );

-- 16. Payments
CREATE POLICY "payments_company_isolation" ON payments
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 17. Treasuries
CREATE POLICY "treasuries_company_isolation" ON treasuries
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 18. Treasury Transactions (مرتبطة بخزينة)
CREATE POLICY "treasury_transactions_company_isolation" ON treasury_transactions
  FOR ALL USING (
    treasury_id IN (SELECT id FROM treasuries WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()))
  );

-- 19. Expense Categories
CREATE POLICY "expense_categories_company_isolation" ON expense_categories
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 20. Expenses
CREATE POLICY "expenses_company_isolation" ON expenses
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- 21. Shifts (مرتبطة بفرع)
CREATE POLICY "shifts_company_isolation" ON shifts
  FOR ALL USING (
    branch_id IN (SELECT id FROM branches WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()))
  );

-- 22. Backup Logs
CREATE POLICY "backup_logs_company_isolation" ON backup_logs
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- ────────────────────────────────────────
-- سياسات SaaS والتقارير
-- ────────────────────────────────────────

-- Usage Stats
CREATE POLICY "usage_stats_company_isolation" ON usage_stats
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Plans (الكل يقرأ)
CREATE POLICY "plans_public_read" ON plans 
  FOR SELECT USING (is_active = TRUE);

-- Subscriptions
CREATE POLICY "subscriptions_company_isolation" ON subscriptions 
  FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Billing History
CREATE POLICY "billing_company_isolation" ON billing_history 
  FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Platform Admins (فقط الآدمنز للمنصة)
CREATE POLICY "platform_admins_only" ON platform_admins 
  FOR ALL USING (id = auth.uid());

-- Platform Audit Log
CREATE POLICY "platform_audit_log_admin_only" ON platform_audit_log 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE id = auth.uid())
  );

-- Platform Notifications
CREATE POLICY "platform_notifications_company_isolation" ON platform_notifications 
  FOR SELECT USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()) OR company_id IS NULL
  );
