-- ============================================================
-- Pos-Sahl — SaaS Layer (Multi-Tenancy + Subscriptions)
-- يُضاف فوق ملف database_schema.sql الأساسي
-- الإصدار: 1.0 | التاريخ: 17 أبريل 2026
-- ============================================================

-- ────────────────────────────────────────
-- 1. خطط الاشتراك (Plans)
-- ────────────────────────────────────────

CREATE TABLE plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,               -- 'مجاني', 'أساسي', 'احترافي'
  name_en       TEXT NOT NULL,               -- 'free', 'starter', 'pro'
  slug          TEXT UNIQUE NOT NULL,        -- 'free' | 'starter' | 'pro'
  description   TEXT,

  -- السعر
  price_monthly      NUMERIC(10,2) DEFAULT 0,   -- السعر شهرياً بالجنيه
  price_yearly       NUMERIC(10,2) DEFAULT 0,   -- السعر سنوياً بالجنيه
  price_lifetime     NUMERIC(10,2) DEFAULT 0,   -- سعر الشراء مرة واحدة

  -- حدود الخطة
  max_users          INTEGER DEFAULT 1,          -- عدد المستخدمين المسموح
  max_branches       INTEGER DEFAULT 1,          -- عدد الفروع المسموح
  max_warehouses     INTEGER DEFAULT 1,          -- عدد المخازن
  max_products       INTEGER DEFAULT 100,        -- عدد الأصناف
  max_invoices_month INTEGER DEFAULT 200,        -- فواتير شهرياً
  storage_mb         INTEGER DEFAULT 500,        -- مساحة التخزين (Supabase Storage)

  -- الميزات المتوفرة في الخطة
  features JSONB DEFAULT '{}',
  -- مثال:
  -- {
  --   "reports_advanced": false,
  --   "multi_branch": false,
  --   "api_access": false,
  --   "zatca": false,
  --   "excel_export": true,
  --   "barcode_print": true,
  --   "custom_invoice": false
  -- }

  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- إدراج الخطط الافتراضية
INSERT INTO plans (name, name_en, slug, description, price_monthly, price_yearly, price_lifetime,
                   max_users, max_branches, max_warehouses, max_products, max_invoices_month, storage_mb, features, sort_order)
VALUES
  (
    'مجاني', 'Free', 'free',
    'جرّب البرنامج مجاناً لمدة 14 يوم',
    0, 0, 0,
    1, 1, 1, 50, 50, 100,
    '{"reports_advanced": false, "multi_branch": false, "excel_export": false, "barcode_print": false, "custom_invoice": false, "api_access": false, "zatca": false}',
    0
  ),
  (
    'أساسي', 'Starter', 'starter',
    'مثالي للمحلات الصغيرة',
    199, 1499, 3999,
    3, 1, 2, 500, 500, 1000,
    '{"reports_advanced": false, "multi_branch": false, "excel_export": true, "barcode_print": true, "custom_invoice": false, "api_access": false, "zatca": false}',
    1
  ),
  (
    'احترافي', 'Pro', 'pro',
    'للنمو والتوسع — فروع متعددة + تقارير متقدمة',
    399, 2999, 7999,
    10, 5, 10, 5000, 5000, 5000,
    '{"reports_advanced": true, "multi_branch": true, "excel_export": true, "barcode_print": true, "custom_invoice": true, "api_access": true, "zatca": true}',
    2
  );

-- ────────────────────────────────────────
-- 2. اشتراكات الشركات (Subscriptions)
-- ────────────────────────────────────────

CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  plan_id         UUID REFERENCES plans(id) NOT NULL,

  -- نوع الاشتراك
  billing_cycle   TEXT NOT NULL CHECK (billing_cycle IN (
    'trial',     -- تجريبي
    'monthly',   -- شهري
    'yearly',    -- سنوي
    'lifetime'   -- مدى الحياة
  )),

  -- الحالة
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'trialing',   -- في الفترة التجريبية
    'active',     -- نشط ومدفوع
    'past_due',   -- متأخر في الدفع
    'canceled',   -- ملغى (ينتهي في ends_at)
    'expired'     -- منتهي
  )),

  -- التواريخ
  trial_ends_at   TIMESTAMPTZ,                    -- نهاية الفترة التجريبية
  current_period_start TIMESTAMPTZ,               -- بداية الفترة الحالية
  current_period_end   TIMESTAMPTZ,               -- نهاية الفترة الحالية
  canceled_at     TIMESTAMPTZ,                    -- تاريخ الإلغاء
  ends_at         TIMESTAMPTZ,                    -- آخر موعد للعمل بعد الإلغاء

  -- بوابة الدفع (مستقبلاً)
  payment_gateway TEXT DEFAULT 'manual',          -- 'manual' | 'stripe' | 'paymob'
  gateway_sub_id  TEXT,                           -- ID الاشتراك في بوابة الدفع

  -- الفاتورة الأخيرة
  last_invoice_at TIMESTAMPTZ,
  next_invoice_at TIMESTAMPTZ,

  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id)  -- شركة واحدة = اشتراك واحد نشط
);

-- ────────────────────────────────────────
-- 3. سجل فواتير الاشتراك (Billing History)
-- ────────────────────────────────────────

CREATE TABLE billing_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  plan_id         UUID REFERENCES plans(id),

  -- تفاصيل الفاتورة
  amount          NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'EGP',
  billing_cycle   TEXT NOT NULL,
  period_start    TIMESTAMPTZ,
  period_end      TIMESTAMPTZ,

  -- الحالة
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',   -- في الانتظار
    'paid',      -- مدفوعة
    'failed',    -- فشل الدفع
    'refunded'   -- مسترجعة
  )),

  -- بوابة الدفع
  payment_method  TEXT,                     -- 'fawry', 'card', 'bank_transfer'
  gateway_txn_id  TEXT,                     -- رقم العملية من بوابة الدفع
  receipt_url     TEXT,                     -- رابط الإيصال

  paid_at         TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 4. استخدام الحدود الفعلي (Usage Tracking)
-- ────────────────────────────────────────

CREATE TABLE usage_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  month           DATE NOT NULL,            -- أول يوم في الشهر (2026-04-01)

  -- الأرقام الفعلية
  users_count        INTEGER DEFAULT 0,
  branches_count     INTEGER DEFAULT 0,
  warehouses_count   INTEGER DEFAULT 0,
  products_count     INTEGER DEFAULT 0,
  invoices_count     INTEGER DEFAULT 0,     -- فواتير هذا الشهر
  storage_used_mb    NUMERIC(10,2) DEFAULT 0,

  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, month)
);

-- ────────────────────────────────────────
-- 5. Super Admin (لوحة تحكم المشروع)
-- ────────────────────────────────────────

-- جدول مديري المنصة (غير مرتبط بأي شركة)
CREATE TABLE platform_admins (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'support')),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- سجل أحداث المنصة (Audit Log)
CREATE TABLE platform_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES platform_admins(id),
  company_id  UUID REFERENCES companies(id),
  action      TEXT NOT NULL,               -- 'change_plan', 'reset_trial', etc.
  old_values  JSONB,
  new_values  JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- إشعارات المنصة للشركات
CREATE TABLE platform_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id),  -- NULL = لكل الشركات
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  type        TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'billing')),
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 6. تعديل جدول companies لإضافة بيانات SaaS
-- ────────────────────────────────────────

ALTER TABLE companies ADD COLUMN IF NOT EXISTS
  owner_id    UUID REFERENCES auth.users(id);  -- المالك الأول للحساب

ALTER TABLE companies ADD COLUMN IF NOT EXISTS
  slug        TEXT UNIQUE;                      -- رابط فرعي مخصص (اختياري)

ALTER TABLE companies ADD COLUMN IF NOT EXISTS
  timezone    TEXT DEFAULT 'Africa/Cairo';

ALTER TABLE companies ADD COLUMN IF NOT EXISTS
  country     TEXT DEFAULT 'EG';

ALTER TABLE companies ADD COLUMN IF NOT EXISTS
  is_active   BOOLEAN DEFAULT TRUE;

-- ────────────────────────────────────────
-- 7. تعديل جدول profiles لإضافة دور super_admin
-- ────────────────────────────────────────

-- نضيف قيمة super_admin للـ check constraint
-- (لازم نعمل drop وrecreate للـ constraint)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'manager', 'cashier', 'viewer'));
-- ملاحظة: super_admin يكون في جدول platform_admins منفصل

-- ────────────────────────────────────────
-- 8. Functions للتحقق من حدود الخطة
-- ────────────────────────────────────────

-- دالة: جلب حدود الخطة الحالية للشركة
CREATE OR REPLACE FUNCTION get_company_limits(p_company_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_limits JSONB;
BEGIN
  SELECT jsonb_build_object(
    'max_users',          pl.max_users,
    'max_branches',       pl.max_branches,
    'max_warehouses',     pl.max_warehouses,
    'max_products',       pl.max_products,
    'max_invoices_month', pl.max_invoices_month,
    'storage_mb',         pl.storage_mb,
    'features',           pl.features,
    'plan_slug',          pl.slug,
    'status',             s.status,
    'trial_ends_at',      s.trial_ends_at,
    'current_period_end', s.current_period_end
  ) INTO v_limits
  FROM subscriptions s
  JOIN plans pl ON pl.id = s.plan_id
  WHERE s.company_id = p_company_id;

  RETURN COALESCE(v_limits, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة: التحقق ما إذا كانت الشركة يمكنها إضافة مستخدم جديد
CREATE OR REPLACE FUNCTION can_add_user(p_company_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_users   INTEGER;
  v_current     INTEGER;
  v_status      TEXT;
BEGIN
  -- جلب الحد المسموح
  SELECT pl.max_users, s.status
  INTO v_max_users, v_status
  FROM subscriptions s
  JOIN plans pl ON pl.id = s.plan_id
  WHERE s.company_id = p_company_id;

  -- إذا الاشتراك منتهي أو غير موجود
  IF v_status NOT IN ('active', 'trialing') THEN
    RETURN FALSE;
  END IF;

  -- حساب المستخدمين الحاليين
  SELECT COUNT(*) INTO v_current
  FROM profiles
  WHERE company_id = p_company_id AND is_active = TRUE;

  RETURN v_current < v_max_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة: التحقق من حد الفواتير الشهرية
CREATE OR REPLACE FUNCTION can_create_invoice(p_company_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_invoices  INTEGER;
  v_current       INTEGER;
  v_status        TEXT;
BEGIN
  SELECT pl.max_invoices_month, s.status
  INTO v_max_invoices, v_status
  FROM subscriptions s
  JOIN plans pl ON pl.id = s.plan_id
  WHERE s.company_id = p_company_id;

  IF v_status NOT IN ('active', 'trialing') THEN
    RETURN FALSE;
  END IF;

  -- فواتير هذا الشهر
  SELECT COUNT(*) INTO v_current
  FROM invoices
  WHERE company_id = p_company_id
    AND type in ('sale', 'purchase')
    AND date >= DATE_TRUNC('month', CURRENT_DATE)
    AND status != 'void';

  RETURN v_current < v_max_invoices;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة: تحديث إحصاءات الاستخدام الشهرية
CREATE OR REPLACE FUNCTION refresh_usage_stats(p_company_id UUID)
RETURNS VOID AS $$
DECLARE
  v_month DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
BEGIN
  INSERT INTO usage_stats (company_id, month, users_count, branches_count,
                           warehouses_count, products_count, invoices_count)
  SELECT
    p_company_id,
    v_month,
    (SELECT COUNT(*) FROM profiles WHERE company_id = p_company_id AND is_active = TRUE),
    (SELECT COUNT(*) FROM branches WHERE company_id = p_company_id AND is_active = TRUE),
    (SELECT COUNT(*) FROM warehouses w JOIN branches b ON b.id = w.branch_id WHERE b.company_id = p_company_id AND w.is_active = TRUE),
    (SELECT COUNT(*) FROM products WHERE company_id = p_company_id AND is_active = TRUE),
    (SELECT COUNT(*) FROM invoices WHERE company_id = p_company_id AND type IN ('sale','purchase') AND date >= v_month AND status != 'void')
  ON CONFLICT (company_id, month)
  DO UPDATE SET
    users_count      = EXCLUDED.users_count,
    branches_count   = EXCLUDED.branches_count,
    warehouses_count = EXCLUDED.warehouses_count,
    products_count   = EXCLUDED.products_count,
    invoices_count   = EXCLUDED.invoices_count,
    updated_at       = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────
-- 9. Trigger: إنشاء اشتراك تجريبي تلقائياً
--    عند إنشاء شركة جديدة
-- ────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
DECLARE
  v_free_plan_id UUID;
BEGIN
  -- جلب ID الخطة المجانية
  SELECT id INTO v_free_plan_id FROM plans WHERE slug = 'free' LIMIT 1;

  -- إنشاء اشتراك تجريبي لمدة 14 يوم
  INSERT INTO subscriptions (
    company_id,
    plan_id,
    billing_cycle,
    status,
    trial_ends_at,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    v_free_plan_id,
    'trial',
    'trialing',
    NOW() + INTERVAL '14 days',
    NOW(),
    NOW() + INTERVAL '14 days'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_company_created_trial
AFTER INSERT ON companies
FOR EACH ROW EXECUTE FUNCTION create_trial_subscription();

-- ────────────────────────────────────────
-- 10. RLS لجداول SaaS
-- ────────────────────────────────────────

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_notifications ENABLE ROW LEVEL SECURITY;

-- الخطط: كل المستخدمين يقرأونها
CREATE POLICY "plans_public_read" ON plans FOR SELECT USING (is_active = TRUE);

-- الاشتراكات: كل شركة ترى اشتراكها فقط
CREATE POLICY "subscriptions_company_isolation"
  ON subscriptions FOR SELECT
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- الفواتير: نفس عزل الشركة
CREATE POLICY "billing_company_isolation"
  ON billing_history FOR SELECT
  USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Platform Admins: super admin فقط
CREATE POLICY "platform_admins_only"
  ON platform_admins FOR ALL
  USING (id = auth.uid());

-- ────────────────────────────────────────
-- 11. Indexes لجداول SaaS
-- ────────────────────────────────────────

CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_ends ON subscriptions(current_period_end);
CREATE INDEX idx_billing_company ON billing_history(company_id);
CREATE INDEX idx_usage_company_month ON usage_stats(company_id, month);
CREATE INDEX idx_platform_notifications_company ON platform_notifications(company_id);

-- ────────────────────────────────────────
-- 12. Views للـ Super Admin Dashboard
-- ────────────────────────────────────────

-- نظرة عامة على كل الشركات والاشتراكات
CREATE VIEW v_saas_overview AS
  SELECT
    c.id AS company_id,
    c.name AS company_name,
    c.email AS company_email,
    c.created_at AS joined_at,
    pl.name AS plan_name,
    pl.slug AS plan_slug,
    s.status AS subscription_status,
    s.billing_cycle,
    s.trial_ends_at,
    s.current_period_end,
    u.users_count,
    u.products_count,
    u.invoices_count,
    u.branches_count
  FROM companies c
  LEFT JOIN subscriptions s ON s.company_id = c.id
  LEFT JOIN plans pl ON pl.id = s.plan_id
  LEFT JOIN usage_stats u ON u.company_id = c.id
    AND u.month = DATE_TRUNC('month', CURRENT_DATE)::DATE
  WHERE c.is_active = TRUE
  ORDER BY c.created_at DESC;

-- إيرادات الاشتراكات
CREATE VIEW v_saas_revenue AS
  SELECT
    DATE_TRUNC('month', bh.paid_at) AS month,
    pl.slug AS plan,
    COUNT(*) AS payments_count,
    SUM(bh.amount) AS total_revenue
  FROM billing_history bh
  JOIN plans pl ON pl.id = bh.plan_id
  WHERE bh.status = 'paid'
  GROUP BY DATE_TRUNC('month', bh.paid_at), pl.slug
  ORDER BY month DESC;

-- شركات قاربت على انتهاء الفترة التجريبية
CREATE VIEW v_trials_expiring_soon AS
  SELECT
    c.id, c.name, c.email,
    s.trial_ends_at,
    (s.trial_ends_at - NOW()) AS time_left
  FROM companies c
  JOIN subscriptions s ON s.company_id = c.id
  WHERE s.status = 'trialing'
    AND s.trial_ends_at <= NOW() + INTERVAL '3 days'
  ORDER BY s.trial_ends_at ASC;
