-- ============================================================
-- CorePOS — Supabase/PostgreSQL Database Schema
-- الإصدار: 1.1 | التاريخ: 17 أبريل 2026
-- التغييرات: إصلاح barcode/sku uniqueness، إضافة ترقيم الفواتير YYMM-NNN
-- ============================================================

-- ────────────────────────────────────────
-- 1. الشركة والفروع والمخازن
-- ────────────────────────────────────────

CREATE TABLE companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  name_en     TEXT,
  logo_url    TEXT,
  address     TEXT,
  phone       TEXT,
  email       TEXT,
  tax_number  TEXT,                    -- الرقم الضريبي
  vat_rate    NUMERIC(5,2) DEFAULT 0, -- نسبة الضريبة (مثلاً 15.00)
  currency    TEXT DEFAULT 'EGP',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE branches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  address     TEXT,
  phone       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE warehouses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id   UUID REFERENCES branches(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  is_default  BOOLEAN DEFAULT FALSE,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 2. المستخدمون والصلاحيات
-- ────────────────────────────────────────

-- ملاحظة: auth.users موجودة في Supabase تلقائياً
-- نضيف جدول profiles مرتبط بها

CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id   UUID REFERENCES companies(id),
  branch_id    UUID REFERENCES branches(id),
  full_name    TEXT NOT NULL,
  role         TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cashier', 'viewer')),
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- صلاحيات مفصلة (اختياري — للتوسع مستقبلاً)
CREATE TABLE role_permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role        TEXT NOT NULL,
  module      TEXT NOT NULL, -- مثل: inventory, sales, reports
  action      TEXT NOT NULL, -- مثل: view, create, edit, delete
  UNIQUE(role, module, action)
);

-- ────────────────────────────────────────
-- 3. المنتجات والمخزون
-- ────────────────────────────────────────

CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  parent_id   UUID REFERENCES categories(id), -- للتصنيفات الفرعية
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE units (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,          -- مثل: قطعة، كيلو، متر
  name_en     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  category_id     UUID REFERENCES categories(id),
  unit_id         UUID REFERENCES units(id),
  name            TEXT NOT NULL,
  name_en         TEXT,
  -- ✅ إصلاح الثغرة 2 و5: barcode وsku فريدان على مستوى الشركة فقط
  -- (نفس الباركود يمكن أن يوجد في شركتين مختلفتين)
  barcode         TEXT,
  sku             TEXT,
  description     TEXT,
  image_url       TEXT,               -- Supabase Storage
  price1          NUMERIC(12,2) DEFAULT 0, -- سعر التجزئة
  price2          NUMERIC(12,2) DEFAULT 0, -- سعر الجملة
  price3          NUMERIC(12,2) DEFAULT 0, -- سعر خاص
  cost_price      NUMERIC(12,2) DEFAULT 0, -- آخر سعر شراء
  avg_cost        NUMERIC(12,2) DEFAULT 0, -- التكلفة المتوسطة (تحسب تلقائياً)
  min_qty         NUMERIC(12,3) DEFAULT 0, -- حد أدنى للمخزون
  has_serial      BOOLEAN DEFAULT FALSE,   -- هل يتبع أرقام سيريال؟
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- المخزون الفعلي لكل منتج في كل مخزن
CREATE TABLE product_stock (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  warehouse_id  UUID REFERENCES warehouses(id) ON DELETE CASCADE NOT NULL,
  qty           NUMERIC(12,3) DEFAULT 0,    -- الكمية الحالية
  avg_cost      NUMERIC(12,2) DEFAULT 0,    -- التكلفة المتوسطة في هذا المخزن
  UNIQUE(product_id, warehouse_id)
);

-- أرقام السيريال (P2)
CREATE TABLE serial_numbers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id),
  warehouse_id UUID REFERENCES warehouses(id),
  serial      TEXT NOT NULL UNIQUE,
  status      TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold', 'returned')),
  invoice_id  UUID,                          -- الفاتورة التي بيع فيها
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 4. العملاء والموردون
-- ────────────────────────────────────────

CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name          TEXT NOT NULL,
  phone         TEXT,
  phone2        TEXT,
  address       TEXT,
  email         TEXT,
  tax_number    TEXT,
  default_price_list  INTEGER DEFAULT 1 CHECK (default_price_list IN (1, 2, 3)),
  credit_limit  NUMERIC(12,2) DEFAULT 0,  -- حد الائتمان
  balance       NUMERIC(12,2) DEFAULT 0,  -- الرصيد (موجب = مدين للمحل)
  notes         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suppliers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT,
  phone2      TEXT,
  address     TEXT,
  email       TEXT,
  tax_number  TEXT,
  balance     NUMERIC(12,2) DEFAULT 0,  -- الرصيد (موجب = المحل مدين له)
  notes       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- مندوبو المبيعات
CREATE TABLE salesmen (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  phone       TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 0, -- نسبة العمولة
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 5. الفواتير (جدول موحد لجميع أنواع الحركات)
-- ────────────────────────────────────────

-- ✅ إصلاح الثغرة 1: جدول تسلسل الفواتير لكل شركة
-- يضمن أرقاماً فريدة بصيغة YYMM-NNN (مثال: 2604-001)
CREATE TABLE invoice_sequences (
  company_id    UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  invoice_type  TEXT NOT NULL,    -- 'sale', 'purchase', 'quotation', 'sale_return', 'purchase_return'
  year_month    TEXT NOT NULL,    -- 'YYMM' — مثال: '2604' لشهر أبريل 2026
  last_number   INTEGER DEFAULT 0,
  PRIMARY KEY (company_id, invoice_type, year_month)
);

-- دالة توليد رقم الفاتورة التالي (atomic — thread-safe)
CREATE OR REPLACE FUNCTION next_invoice_number(
  p_company_id UUID,
  p_type       TEXT DEFAULT 'sale'
) RETURNS TEXT AS $$
DECLARE
  v_ym    TEXT := TO_CHAR(NOW(), 'YYMM');   -- مثال: '2604'
  v_num   INTEGER;
BEGIN
  INSERT INTO invoice_sequences (company_id, invoice_type, year_month, last_number)
  VALUES (p_company_id, p_type, v_ym, 1)
  ON CONFLICT (company_id, invoice_type, year_month)
  DO UPDATE SET last_number = invoice_sequences.last_number + 1
  RETURNING last_number INTO v_num;

  -- الصيغة: 2604-001 | 2604-999 | 2604-1000 (تتوسع تلقائياً)
  RETURN v_ym || '-' || LPAD(v_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

CREATE TABLE invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID REFERENCES companies(id) NOT NULL,
  branch_id         UUID REFERENCES branches(id) NOT NULL,
  warehouse_id      UUID REFERENCES warehouses(id) NOT NULL,

  -- ✅ رقم الفاتورة التسلسلي (YYMM-NNN) — يُملأ تلقائياً عند التأكيد
  invoice_number    TEXT,

  -- نوع الفاتورة
  type              TEXT NOT NULL CHECK (type IN (
    'sale',             -- فاتورة مبيعات
    'purchase',         -- فاتورة مشتريات
    'sale_return',      -- مرتجع مبيعات
    'purchase_return',  -- مرتجع مشتريات
    'quotation',        -- عرض أسعار
    'purchase_order',   -- أمر شراء
    'stock_transfer'    -- تحويل بين مخازن
  )),

  -- الحالة
  status            TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN (
    'draft',      -- مسودة (بدون رقم بعد)
    'confirmed',  -- مؤكدة (تُولَد الرقم هنا)
    'partial',    -- مدفوعة جزئياً
    'paid',       -- مدفوعة كاملاً
    'void',       -- ملغاة
    'converted'   -- تم تحويلها لفاتورة (للـ quotation)
  )),

  -- الأطراف
  customer_id       UUID REFERENCES customers(id),
  supplier_id       UUID REFERENCES suppliers(id),
  salesman_id       UUID REFERENCES salesmen(id),
  cashier_id        UUID REFERENCES profiles(id),   -- من أنشأ الفاتورة

  -- التواريخ
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date          DATE,                           -- تاريخ الاستحقاق للآجل

  -- المبالغ
  subtotal          NUMERIC(12,2) DEFAULT 0,        -- المجموع قبل خصم وضريبة
  discount_type     TEXT DEFAULT 'amount' CHECK (discount_type IN ('amount', 'percent')),
  discount_value    NUMERIC(12,2) DEFAULT 0,
  discount_amount   NUMERIC(12,2) DEFAULT 0,        -- قيمة الخصم الفعلية
  tax_rate          NUMERIC(5,2) DEFAULT 0,
  tax_amount        NUMERIC(12,2) DEFAULT 0,
  total             NUMERIC(12,2) DEFAULT 0,        -- الإجمالي النهائي
  paid              NUMERIC(12,2) DEFAULT 0,        -- المدفوع
  remaining         NUMERIC(12,2) DEFAULT 0,        -- المتبقي

  -- معلومات إضافية
  notes             TEXT,
  reference_id      UUID REFERENCES invoices(id),  -- للمرتجع أو التحويل
  parent_id         UUID REFERENCES invoices(id),  -- للـ quotation المحوّل

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  -- ضمان: رقم الفاتورة المؤكدة فريد داخل الشركة
  UNIQUE(company_id, invoice_number)
);

-- Trigger: توليد رقم الفاتورة تلقائياً عند التأكيد
CREATE OR REPLACE FUNCTION assign_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  -- يُولَّد الرقم فقط عند الانتقال من draft لـ confirmed
  -- أو مباشرة عند الإنشاء كـ confirmed
  IF NEW.status IN ('confirmed', 'partial', 'paid') AND NEW.invoice_number IS NULL THEN
    NEW.invoice_number := next_invoice_number(NEW.company_id, NEW.type);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_number_trigger
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION assign_invoice_number();

-- تفاصيل أصناف الفاتورة
CREATE TABLE invoice_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  product_id      UUID REFERENCES products(id) NOT NULL,
  warehouse_id    UUID REFERENCES warehouses(id),
  qty             NUMERIC(12,3) NOT NULL,
  unit_price      NUMERIC(12,2) NOT NULL,   -- سعر البيع أو الشراء
  cost_price      NUMERIC(12,2) DEFAULT 0,  -- تكلفة الصنف وقت الفاتورة (للأرباح)
  discount_type   TEXT DEFAULT 'amount' CHECK (discount_type IN ('amount', 'percent')),
  discount_value  NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  total_line      NUMERIC(12,2) NOT NULL,   -- qty * unit_price - discount
  profit          NUMERIC(12,2) DEFAULT 0,  -- total_line - (qty * cost_price)
  notes           TEXT,
  sort_order      INTEGER DEFAULT 0
);

-- ────────────────────────────────────────
-- 6. الخزينة
-- ────────────────────────────────────────

CREATE TABLE treasuries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) NOT NULL,
  branch_id   UUID REFERENCES branches(id),
  name        TEXT NOT NULL,
  type        TEXT DEFAULT 'cash' CHECK (type IN ('cash', 'bank')),
  balance     NUMERIC(12,2) DEFAULT 0,
  is_default  BOOLEAN DEFAULT FALSE,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE treasury_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treasury_id   UUID REFERENCES treasuries(id) NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('in', 'out', 'transfer')),
  amount        NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2),                -- الرصيد بعد العملية
  reference_id  UUID,                         -- مرجع (invoice_id أو payment_id)
  reference_type TEXT,                        -- نوع المرجع
  notes         TEXT,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 7. المدفوعات وطرق السداد
-- ────────────────────────────────────────

CREATE TABLE payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID REFERENCES companies(id) NOT NULL,
  invoice_id    UUID REFERENCES invoices(id),       -- مرتبط بفاتورة (اختياري)
  customer_id   UUID REFERENCES customers(id),
  supplier_id   UUID REFERENCES suppliers(id),
  treasury_id   UUID REFERENCES treasuries(id),

  type          TEXT NOT NULL CHECK (type IN (
    'receipt',    -- قبض من عميل
    'payment',    -- صرف لمورد
    'expense'     -- مصروف
  )),

  method        TEXT NOT NULL CHECK (method IN (
    'cash',     -- نقدي
    'card',     -- بطاقة ائتمان/شبكة
    'check',    -- شيك
    'transfer', -- تحويل بنكي
    'deferred'  -- آجل
  )),

  amount        NUMERIC(12,2) NOT NULL,
  check_number  TEXT,                     -- رقم الشيك
  check_date    DATE,                     -- تاريخ استحقاق الشيك
  check_status  TEXT DEFAULT 'pending'    -- pending / deposited / returned
                CHECK (check_status IN ('pending', 'deposited', 'returned')),
  notes         TEXT,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 8. المصروفات
-- ────────────────────────────────────────

CREATE TABLE expense_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id) NOT NULL,
  name        TEXT NOT NULL  -- إيجار، كهرباء، رواتب، مياه، ...
);

CREATE TABLE expenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID REFERENCES companies(id) NOT NULL,
  branch_id     UUID REFERENCES branches(id),
  treasury_id   UUID REFERENCES treasuries(id),
  category_id   UUID REFERENCES expense_categories(id),
  amount        NUMERIC(12,2) NOT NULL,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  notes         TEXT,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 9. الشيفت (الكاشير)
-- ────────────────────────────────────────

CREATE TABLE shifts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id       UUID REFERENCES branches(id) NOT NULL,
  treasury_id     UUID REFERENCES treasuries(id),
  cashier_id      UUID REFERENCES profiles(id) NOT NULL,
  opened_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at       TIMESTAMPTZ,
  opening_cash    NUMERIC(12,2) DEFAULT 0,   -- رصيد الخزينة عند الفتح
  closing_cash    NUMERIC(12,2),             -- الرصيد الفعلي عند الإغلاق
  expected_cash   NUMERIC(12,2),             -- الرصيد المتوقع من النظام
  difference      NUMERIC(12,2),             -- الفرق
  notes           TEXT,
  status          TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);

-- ────────────────────────────────────────
-- 10. النسخ الاحتياطية
-- ────────────────────────────────────────

CREATE TABLE backup_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id),
  file_url    TEXT,
  size_bytes  BIGINT,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────
-- 11. Triggers التلقائية
-- ────────────────────────────────────────

-- Trigger: تحديث التكلفة المتوسطة عند إضافة فاتورة شراء
CREATE OR REPLACE FUNCTION update_avg_cost()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_type TEXT;
  v_invoice_status TEXT;
  current_qty   NUMERIC;
  current_cost  NUMERIC;
  new_avg       NUMERIC;
BEGIN
  SELECT type, status INTO v_invoice_type, v_invoice_status
  FROM invoices
  WHERE id = NEW.invoice_id;

  -- لا نحدّث المتوسط إلا لفواتير الشراء المؤكدة.
  IF v_invoice_type IS DISTINCT FROM 'purchase' OR v_invoice_status IN ('void', 'draft') THEN
    RETURN NEW;
  END IF;

  -- نجيب الكمية والتكلفة الحالية
  SELECT qty, avg_cost INTO current_qty, current_cost
  FROM product_stock
  WHERE product_id = NEW.product_id AND warehouse_id = NEW.warehouse_id;

  -- حساب المتوسط المرجح الجديد
  IF current_qty <= 0 THEN
    new_avg := NEW.unit_price;
  ELSE
    new_avg := ((current_qty * current_cost) + (NEW.qty * NEW.unit_price))
               / (current_qty + NEW.qty);
  END IF;

  -- تحديث المخزون
  INSERT INTO product_stock (product_id, warehouse_id, qty, avg_cost)
  VALUES (NEW.product_id, NEW.warehouse_id, NEW.qty, new_avg)
  ON CONFLICT (product_id, warehouse_id)
  DO UPDATE SET
    qty = product_stock.qty + NEW.qty,
    avg_cost = new_avg;

  -- تحديث avg_cost في جدول products
  UPDATE products SET avg_cost = new_avg WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_avg_cost
AFTER INSERT ON invoice_items
FOR EACH ROW EXECUTE FUNCTION update_avg_cost();

-- Trigger: تحديث رصيد الخزينة
CREATE OR REPLACE FUNCTION update_treasury_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'in' THEN
    UPDATE treasuries SET balance = balance + NEW.amount WHERE id = NEW.treasury_id;
  ELSIF NEW.type = 'out' THEN
    UPDATE treasuries SET balance = balance - NEW.amount WHERE id = NEW.treasury_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER treasury_balance_trigger
AFTER INSERT ON treasury_transactions
FOR EACH ROW EXECUTE FUNCTION update_treasury_balance();

-- Trigger: تحديث رصيد العميل بعد الفاتورة
CREATE OR REPLACE FUNCTION update_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('void', 'draft') THEN
    RETURN NEW;
  END IF;

  IF NEW.type = 'sale' AND NEW.customer_id IS NOT NULL THEN
    UPDATE customers SET balance = balance + NEW.remaining WHERE id = NEW.customer_id;
  ELSIF NEW.type = 'sale_return' AND NEW.customer_id IS NOT NULL THEN
    UPDATE customers SET balance = balance - NEW.total WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_customer_balance
AFTER INSERT ON invoices
FOR EACH ROW EXECUTE FUNCTION update_customer_balance();

-- ────────────────────────────────────────
-- ────────────────────────────────────────
-- 13. Indexes للأداء
-- ────────────────────────────────────────

-- ✅ إصلاح الثغرة 2 و5: barcode وsku فريدان على مستوى الشركة (ليس globally)
CREATE UNIQUE INDEX idx_products_barcode_company
  ON products(company_id, barcode) WHERE barcode IS NOT NULL;
CREATE UNIQUE INDEX idx_products_sku_company
  ON products(company_id, sku) WHERE sku IS NOT NULL;

-- indexes البحث السريع
CREATE INDEX idx_products_company    ON products(company_id);
CREATE INDEX idx_products_barcode    ON products(barcode);  -- للبحث السريع في POS
CREATE INDEX idx_products_active     ON products(company_id, is_active);
CREATE INDEX idx_invoices_number     ON invoices(company_id, invoice_number);
CREATE INDEX idx_invoices_date       ON invoices(date);
CREATE INDEX idx_invoices_company_date ON invoices(company_id, date);
CREATE INDEX idx_invoices_type       ON invoices(type);
CREATE INDEX idx_invoices_customer   ON invoices(customer_id);
CREATE INDEX idx_invoices_supplier   ON invoices(supplier_id);
CREATE INDEX idx_invoice_items_invoice    ON invoice_items(invoice_id);
CREATE INDEX idx_product_stock_product    ON product_stock(product_id);
CREATE INDEX idx_payments_invoice    ON payments(invoice_id);
CREATE INDEX idx_treasury_txns_treasury  ON treasury_transactions(treasury_id);
CREATE INDEX idx_treasury_txns_date  ON treasury_transactions(date);

-- ────────────────────────────────────────
-- 14. Views مساعدة للتقارير
-- ────────────────────────────────────────

-- عرض: المخزون الكامل مع بيانات المنتج
CREATE VIEW v_stock_report AS
  SELECT
    p.id, p.name, p.barcode,
    c.name AS category_name,
    ps.warehouse_id,
    w.name AS warehouse_name,
    ps.qty,
    ps.avg_cost,
    ps.qty * ps.avg_cost AS stock_value,
    p.price1, p.price2, p.price3,
    p.min_qty,
    CASE WHEN ps.qty <= p.min_qty THEN TRUE ELSE FALSE END AS low_stock
  FROM products p
  LEFT JOIN product_stock ps ON ps.product_id = p.id
  LEFT JOIN warehouses w ON w.id = ps.warehouse_id
  LEFT JOIN categories c ON c.id = p.category_id
  WHERE p.is_active = TRUE;

-- عرض: ملخص الفواتير اليومية
CREATE VIEW v_daily_summary AS
  SELECT
    date,
    branch_id,
    SUM(CASE WHEN type = 'sale' THEN total ELSE 0 END) AS total_sales,
    SUM(CASE WHEN type = 'purchase' THEN total ELSE 0 END) AS total_purchases,
    SUM(CASE WHEN type = 'sale' THEN (total - discount_amount) ELSE 0 END) AS net_sales,
    COUNT(CASE WHEN type = 'sale' THEN 1 END) AS sales_count
  FROM invoices
  WHERE status NOT IN ('void', 'draft')
  GROUP BY date, branch_id;

-- عرض: أرباح الفواتير
CREATE VIEW v_invoice_profits AS
  SELECT
    i.id, i.date, i.type,
    i.customer_id, c.name AS customer_name,
    i.total,
    SUM(ii.total_line) AS revenue,
    SUM(ii.qty * ii.cost_price) AS cost,
    SUM(ii.profit) AS gross_profit,
    CASE
      WHEN SUM(ii.total_line) > 0
      THEN (SUM(ii.profit) / SUM(ii.total_line) * 100)
      ELSE 0
    END AS profit_margin
  FROM invoices i
  LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
  LEFT JOIN customers c ON c.id = i.customer_id
  WHERE i.type = 'sale' AND i.status NOT IN ('void', 'draft')
  GROUP BY i.id, i.date, i.type, i.customer_id, c.name, i.total;
