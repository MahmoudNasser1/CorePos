-- ============================================================
-- CorePOS — Finance & Sales RPC Functions
-- ============================================================

-- 1. دالة إنشاء فاتورة مبيعات (Atomic Transaction)
CREATE OR REPLACE FUNCTION create_sale_invoice(
  p_invoice  JSONB,
  p_items    JSONB, -- مصفوفة من الأصناف
  p_payments JSONB  -- مصفوفة من المدفوعات
) RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_item       RECORD;
  v_payment    RECORD;
  v_company_id UUID;
BEGIN
  -- استخراج company_id من الفاتورة
  v_company_id := (p_invoice->>'company_id')::UUID;

  -- 1. إنشاء رأس الفاتورة
  INSERT INTO invoices (
    company_id, branch_id, warehouse_id, type, status, 
    customer_id, salesman_id, cashier_id, date, due_date,
    subtotal, discount_type, discount_value, discount_amount, 
    tax_rate, tax_amount, total, paid, remaining, notes
  ) VALUES (
    v_company_id, 
    (p_invoice->>'branch_id')::UUID,
    (p_invoice->>'warehouse_id')::UUID,
    'sale',
    COALESCE(p_invoice->>'status', 'confirmed'),
    (p_invoice->>'customer_id')::UUID,
    (p_invoice->>'salesman_id')::UUID,
    (p_invoice->>'cashier_id')::UUID,
    COALESCE((p_invoice->>'date')::DATE, CURRENT_DATE),
    (p_invoice->>'due_date')::DATE,
    (p_invoice->>'subtotal')::NUMERIC,
    COALESCE(p_invoice->>'discount_type', 'amount'),
    (p_invoice->>'discount_value')::NUMERIC,
    (p_invoice->>'discount_amount')::NUMERIC,
    (p_invoice->>'tax_rate')::NUMERIC,
    (p_invoice->>'tax_amount')::NUMERIC,
    (p_invoice->>'total')::NUMERIC,
    (p_invoice->>'paid')::NUMERIC,
    (p_invoice->>'remaining')::NUMERIC,
    p_invoice->>'notes'
  ) RETURNING id INTO v_invoice_id;

  -- 2. إنشاء الأصناف وتحديث المخزون
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id UUID, warehouse_id UUID, qty NUMERIC, unit_price NUMERIC, 
    cost_price NUMERIC, discount_type TEXT, discount_value NUMERIC, 
    discount_amount NUMERIC, total_line NUMERIC, profit NUMERIC, notes TEXT
  ) LOOP
    INSERT INTO invoice_items (
      invoice_id, product_id, warehouse_id, qty, unit_price, cost_price,
      discount_type, discount_value, discount_amount, total_line, profit, notes
    ) VALUES (
      v_invoice_id, v_item.product_id, COALESCE(v_item.warehouse_id, (p_invoice->>'warehouse_id')::UUID),
      v_item.qty, v_item.unit_price, v_item.cost_price,
      v_item.discount_type, v_item.discount_value, v_item.discount_amount, v_item.total_line, v_item.profit, v_item.notes
    );

    -- خصم من المخزون
    UPDATE product_stock 
    SET qty = qty - v_item.qty
    WHERE product_id = v_item.product_id 
    AND warehouse_id = COALESCE(v_item.warehouse_id, (p_invoice->>'warehouse_id')::UUID);
    
    -- إذا لم يوجد سجل مخزون، ننشئ واحداً بالسالب (أو يمكننا منع ذلك حسب السياسة)
    IF NOT FOUND THEN
      INSERT INTO product_stock (product_id, warehouse_id, qty)
      VALUES (v_item.product_id, COALESCE(v_item.warehouse_id, (p_invoice->>'warehouse_id')::UUID), -v_item.qty);
    END IF;
  END LOOP;

  -- 3. تحديث رصيد العميل (إضافة المديونية)
  IF (p_invoice->>'customer_id') IS NOT NULL AND (p_invoice->>'remaining')::NUMERIC > 0 THEN
    UPDATE customers 
    SET balance = balance + (p_invoice->>'remaining')::NUMERIC
    WHERE id = (p_invoice->>'customer_id')::UUID;
  END IF;

  -- 4. معالجة المدفوعات
  FOR v_payment IN SELECT * FROM jsonb_to_recordset(p_payments) AS x(
    treasury_id UUID, method TEXT, amount NUMERIC, notes TEXT, check_number TEXT, check_date DATE
  ) LOOP
    INSERT INTO payments (
      company_id, invoice_id, customer_id, treasury_id, type, method, amount, notes, check_number, check_date
    ) VALUES (
      v_company_id, v_invoice_id, (p_invoice->>'customer_id')::UUID, v_payment.treasury_id, 'receipt', 
      v_payment.method, v_payment.amount, v_payment.notes, v_payment.check_number, v_payment.check_date
    );

    -- تأثير الخزينة
    IF v_payment.method IN ('cash', 'card', 'transfer') THEN
      INSERT INTO treasury_transactions (
        treasury_id, type, amount, reference_id, reference_type, notes
      ) VALUES (
        v_payment.treasury_id, 'in', v_payment.amount, v_invoice_id, 'sale_invoice', 
        v_payment.notes
      );
    END IF;
  END LOOP;

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- 2. دالة إنشاء فاتورة مشتريات
CREATE OR REPLACE FUNCTION create_purchase_invoice(
  p_invoice  JSONB,
  p_items    JSONB,
  p_payments JSONB
) RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_item       RECORD;
  v_payment    RECORD;
  v_company_id UUID;
BEGIN
  v_company_id := (p_invoice->>'company_id')::UUID;

  INSERT INTO invoices (
    company_id, branch_id, warehouse_id, type, status, 
    supplier_id, date, subtotal, discount_amount, 
    tax_amount, total, paid, remaining, notes
  ) VALUES (
    v_company_id, (p_invoice->>'branch_id')::UUID, (p_invoice->>'warehouse_id')::UUID,
    'purchase', 'confirmed', (p_invoice->>'supplier_id')::UUID,
    COALESCE((p_invoice->>'date')::DATE, CURRENT_DATE),
    (p_invoice->>'subtotal')::NUMERIC, (p_invoice->>'discount_amount')::NUMERIC,
    (p_invoice->>'tax_amount')::NUMERIC, (p_invoice->>'total')::NUMERIC,
    (p_invoice->>'paid')::NUMERIC, (p_invoice->>'remaining')::NUMERIC,
    p_invoice->>'notes'
  ) RETURNING id INTO v_invoice_id;

  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id UUID, qty NUMERIC, unit_price NUMERIC, total_line NUMERIC
  ) LOOP
    INSERT INTO invoice_items (
      invoice_id, product_id, warehouse_id, qty, unit_price, cost_price, total_line
    ) VALUES (
      v_invoice_id, v_item.product_id, (p_invoice->>'warehouse_id')::UUID,
      v_item.qty, v_item.unit_price, v_item.unit_price, v_item.total_line
    );

    -- إضافة للمخزون وتحديث التكلفة (استخدام avg_cost logic)
    -- ملاحظة: Trigger update_avg_cost سيقوم بهذا العمل لو تم تفعيله، 
    -- لكني هنا سأكتب المنطق للتأكد.
    UPDATE product_stock 
    SET 
      avg_cost = ((qty * avg_cost) + (v_item.qty * v_item.unit_price)) / (qty + v_item.qty),
      qty = qty + v_item.qty
    WHERE product_id = v_item.product_id AND warehouse_id = (p_invoice->>'warehouse_id')::UUID;
    
    IF NOT FOUND THEN
      INSERT INTO product_stock (product_id, warehouse_id, qty, avg_cost)
      VALUES (v_item.product_id, (p_invoice->>'warehouse_id')::UUID, v_item.qty, v_item.unit_price);
    END IF;
    
    -- تحديث التكلفة المتوسطة في جدول المنتجات أيضاً
    UPDATE products SET avg_cost = (
      SELECT AVG(avg_cost) FROM product_stock WHERE product_id = v_item.product_id
    ) WHERE id = v_item.product_id;
  END LOOP;

  -- تحديث رصيد المورد
  IF (p_invoice->>'supplier_id') IS NOT NULL AND (p_invoice->>'remaining')::NUMERIC > 0 THEN
    UPDATE suppliers 
    SET balance = balance + (p_invoice->>'remaining')::NUMERIC
    WHERE id = (p_invoice->>'supplier_id')::UUID;
  END IF;

  -- معالجة المدفوعات (صرف)
  FOR v_payment IN SELECT * FROM jsonb_to_recordset(p_payments) AS x(
    treasury_id UUID, method TEXT, amount NUMERIC
  ) LOOP
    INSERT INTO payments (
      company_id, invoice_id, supplier_id, treasury_id, type, method, amount
    ) VALUES (
      v_company_id, v_invoice_id, (p_invoice->>'supplier_id')::UUID, v_payment.treasury_id, 'payment', 
      v_payment.method, v_payment.amount
    );

    IF v_payment.method IN ('cash', 'card', 'transfer') THEN
      INSERT INTO treasury_transactions (
        treasury_id, type, amount, reference_id, reference_type
      ) VALUES (
        v_payment.treasury_id, 'out', v_payment.amount, v_invoice_id, 'purchase_invoice'
      );
    END IF;
  END LOOP;

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- 3. دالة إضافة سند قبض/صرف
CREATE OR REPLACE FUNCTION add_payment_receipt(
  p_payment JSONB
) RETURNS UUID AS $$
DECLARE
  v_payment_id UUID;
  v_company_id UUID;
  v_amount     NUMERIC;
BEGIN
  v_company_id := (p_payment->>'company_id')::UUID;
  v_amount     := (p_payment->>'amount')::NUMERIC;

  INSERT INTO payments (
    company_id, customer_id, supplier_id, treasury_id, invoice_id,
    type, method, amount, notes, date, created_by
  ) VALUES (
    v_company_id, 
    (p_payment->>'customer_id')::UUID, 
    (p_payment->>'supplier_id')::UUID,
    (p_payment->>'treasury_id')::UUID,
    (p_payment->>'invoice_id')::UUID,
    p_payment->>'type', 
    p_payment->>'method', 
    v_amount, 
    p_payment->>'notes',
    COALESCE((p_payment->>'date')::DATE, CURRENT_DATE),
    (p_payment->>'created_by')::UUID
  ) RETURNING id INTO v_payment_id;

  -- تحديث الأرصدة (عميل / مورد)
  IF p_payment->>'type' = 'receipt' AND (p_payment->>'customer_id') IS NOT NULL THEN
    UPDATE customers SET balance = balance - v_amount WHERE id = (p_payment->>'customer_id')::UUID;
  ELSIF p_payment->>'type' = 'payment' AND (p_payment->>'supplier_id') IS NOT NULL THEN
    UPDATE suppliers SET balance = balance - v_amount WHERE id = (p_payment->>'supplier_id')::UUID;
  END IF;

  -- تأثير الخزينة
  IF p_payment->>'method' IN ('cash', 'card', 'transfer') THEN
    INSERT INTO treasury_transactions (
      treasury_id, type, amount, reference_id, reference_type, notes
    ) VALUES (
      (p_payment->>'treasury_id')::UUID, 
      CASE WHEN p_payment->>'type' = 'receipt' THEN 'in' ELSE 'out' END,
      v_amount, 
      v_payment_id, 
      'payment',
      p_payment->>'notes'
    );
  END IF;

  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql;

-- 4. إنشاء عرض سعر (بدون تأثير مالي أو مخزني)
CREATE OR REPLACE FUNCTION create_quotation(
    p_invoice JSONB,
    p_items JSONB
) RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
    v_item RECORD;
BEGIN
    INSERT INTO invoices (
        company_id, branch_id, warehouse_id, 
        type, status, date,
        customer_id, subtotal, discount_type, discount_value,
        discount_amount, tax_rate, tax_amount, total,
        notes, cashier_id
    ) VALUES (
        (p_invoice->>'company_id')::UUID, (p_invoice->>'branch_id')::UUID, (p_invoice->>'warehouse_id')::UUID,
        'quotation', 'confirmed', (p_invoice->>'date')::DATE,
        (p_invoice->>'customer_id')::UUID, (p_invoice->>'subtotal')::NUMERIC, (p_invoice->>'discount_type'), (p_invoice->>'discount_value')::NUMERIC,
        (p_invoice->>'discount_amount')::NUMERIC, (p_invoice->>'tax_rate')::NUMERIC, (p_invoice->>'tax_amount')::NUMERIC, (p_invoice->>'total')::NUMERIC,
        (p_invoice->>'notes'), (p_invoice->>'cashier_id')::UUID
    ) RETURNING id INTO v_invoice_id;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID, qty NUMERIC, unit_price NUMERIC, 
        discount_type TEXT, discount_value NUMERIC, discount_amount NUMERIC,
        total_line NUMERIC, notes TEXT
    ) LOOP
        INSERT INTO invoice_items (
            invoice_id, product_id, qty, unit_price,
            discount_type, discount_value, discount_amount, total_line, notes
        ) VALUES (
            v_invoice_id, v_item.product_id, v_item.qty, v_item.unit_price,
            v_item.discount_type, v_item.discount_value, v_item.discount_amount, v_item.total_line, v_item.notes
        );
    END LOOP;

    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- 5. إنشاء مرتجع مبيعات
CREATE OR REPLACE FUNCTION create_sale_return(
    p_invoice JSONB,
    p_items JSONB,
    p_treasury_id UUID
) RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
    v_item RECORD;
BEGIN
    -- 1. إدراج رأس المرتجع
    INSERT INTO invoices (
        company_id, branch_id, warehouse_id, 
        type, status, date,
        customer_id, subtotal, discount_type, discount_value,
        discount_amount, tax_rate, tax_amount, total,
        paid, remaining, notes, cashier_id, reference_id
    ) VALUES (
        (p_invoice->>'company_id')::UUID, (p_invoice->>'branch_id')::UUID, (p_invoice->>'warehouse_id')::UUID,
        'sale_return', 'paid', (p_invoice->>'date')::DATE,
        (p_invoice->>'customer_id')::UUID, (p_invoice->>'subtotal')::NUMERIC, (p_invoice->>'discount_type'), (p_invoice->>'discount_value')::NUMERIC,
        (p_invoice->>'discount_amount')::NUMERIC, (p_invoice->>'tax_rate')::NUMERIC, (p_invoice->>'tax_amount')::NUMERIC, (p_invoice->>'total')::NUMERIC,
        (p_invoice->>'paid')::NUMERIC, 0, (p_invoice->>'notes'), (p_invoice->>'cashier_id')::UUID, (p_invoice->>'reference_id')::UUID
    ) RETURNING id INTO v_invoice_id;

    -- 2. إدراج الأصناف وإرجاع المخزون
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID, qty NUMERIC, unit_price NUMERIC, total_line NUMERIC, warehouse_id UUID
    ) LOOP
        INSERT INTO invoice_items (
            invoice_id, product_id, qty, unit_price, total_line, warehouse_id
        ) VALUES (
            v_invoice_id, v_item.product_id, v_item.qty, v_item.unit_price, v_item.total_line, v_item.warehouse_id
        );

        -- إرجاع للمخزون
        UPDATE product_stock 
        SET qty = qty + v_item.qty
        WHERE product_id = v_item.product_id AND warehouse_id = v_item.warehouse_id;
    END LOOP;

    -- 3. خصم من الخزينة (لو تم الاسترداد نقداً)
    IF (p_invoice->>'paid')::NUMERIC > 0 THEN
        INSERT INTO treasury_transactions (
            treasury_id, type, amount, reference_id, reference_type, notes, created_by
        ) VALUES (
            p_treasury_id, 'out', (p_invoice->>'paid')::NUMERIC, v_invoice_id, 'sale_return', 
            'استرداد نقدي لمرتجع مبيعات رقم ' || v_invoice_id, (p_invoice->>'cashier_id')::UUID
        );
    END IF;

    -- 4. تحديث رصيد العميل (بمبلغ المرتجع المتبقي)
    IF (p_invoice->>'customer_id') IS NOT NULL THEN
        UPDATE customers 
        SET balance = balance - ((p_invoice->>'total')::NUMERIC - (p_invoice->>'paid')::NUMERIC)
        WHERE id = (p_invoice->>'customer_id')::UUID;
    END IF;

    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- 6. إنشاء أمر شراء (بدون تأثير مالي أو مخزني)
CREATE OR REPLACE FUNCTION create_purchase_order(
    p_invoice JSONB,
    p_items JSONB
) RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
    v_item RECORD;
BEGIN
    INSERT INTO invoices (
        company_id, branch_id, warehouse_id, 
        type, status, date,
        supplier_id, subtotal, discount_type, discount_value,
        discount_amount, tax_rate, tax_amount, total,
        notes, cashier_id
    ) VALUES (
        (p_invoice->>'company_id')::UUID, (p_invoice->>'branch_id')::UUID, (p_invoice->>'warehouse_id')::UUID,
        'purchase_order', 'confirmed', (p_invoice->>'date')::DATE,
        (p_invoice->>'supplier_id')::UUID, (p_invoice->>'subtotal')::NUMERIC, (p_invoice->>'discount_type'), (p_invoice->>'discount_value')::NUMERIC,
        (p_invoice->>'discount_amount')::NUMERIC, (p_invoice->>'tax_rate')::NUMERIC, (p_invoice->>'tax_amount')::NUMERIC, (p_invoice->>'total')::NUMERIC,
        (p_invoice->>'notes'), (p_invoice->>'cashier_id')::UUID
    ) RETURNING id INTO v_invoice_id;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID, qty NUMERIC, unit_price NUMERIC, total_line NUMERIC, notes TEXT
    ) LOOP
        INSERT INTO invoice_items (
            invoice_id, product_id, qty, unit_price, total_line, notes
        ) VALUES (
            v_invoice_id, v_item.product_id, v_item.qty, v_item.unit_price, v_item.total_line, v_item.notes
        );
    END LOOP;

    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

