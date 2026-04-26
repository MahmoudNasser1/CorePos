import requests

BASE_URL = "http://localhost:4000"
AUTH_CREDENTIALS = {"email": "admin@pos-sahl.com", "password": "password123"}
TIMEOUT = 30


def test_post_finance_sales_with_valid_invoice_data():
    session = requests.Session()
    # 1. Login to get authentication cookie (httpOnly JWT cookie)
    login_resp = session.post(
        f"{BASE_URL}/auth/login",
        json=AUTH_CREDENTIALS,
        timeout=TIMEOUT,
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    # Confirm session is active
    session_resp = session.get(f"{BASE_URL}/auth/session", timeout=TIMEOUT)
    assert session_resp.status_code == 200, f"Session invalid after login: {session_resp.text}"

    # 2. Create a product (required for invoice line)
    product_payload = {
        "name": "Test Product Invoice",
        "price": 25.5,
        "barcode": "INVTEST123456",
        "category": "Test Category",
        "unit": "pcs",
    }
    product_resp = session.post(
        f"{BASE_URL}/inventory/products", json=product_payload, timeout=TIMEOUT
    )
    assert product_resp.status_code == 201, f"Product creation failed: {product_resp.text}"
    product_data = product_resp.json()
    product_id = product_data.get("id")
    assert product_id, "Product ID not returned"

    # 3. Create a customer
    customer_payload = {
        "name": "Invoice Test Customer",
        "phone": "+1234567890",
        "email": "invoicetestcustomer@example.com",
    }
    customer_resp = session.post(
        f"{BASE_URL}/contacts/customers", json=customer_payload, timeout=TIMEOUT
    )
    assert customer_resp.status_code == 201, f"Customer creation failed: {customer_resp.text}"
    customer_data = customer_resp.json()
    customer_id = customer_data.get("id")
    assert customer_id, "Customer ID not returned"

    # 4. Create sales invoice with customerId, lines, discounts, and payments
    # Prepare invoice lines
    invoice_lines = [
        {
            "productId": product_id,
            "qty": 3,
            "price": product_payload["price"],
        }
    ]
    # Example discount and payments - assuming discounts and payments arrays allowed; if optional, include minimal data
    discounts = [
        {
            "type": "percent",
            "value": 10
        }
    ]
    payments = [
        {
            "method": "cash",
            "amount": 68.85
        }
    ]

    invoice_payload = {
        "customerId": customer_id,
        "lines": invoice_lines,
        "discounts": discounts,
        "payments": payments,
    }

    try:
        invoice_resp = session.post(
            f"{BASE_URL}/finance/sales", json=invoice_payload, timeout=TIMEOUT
        )
        assert invoice_resp.status_code == 201, f"Invoice creation failed: {invoice_resp.text}"
        invoice_data = invoice_resp.json()
        invoice_id = invoice_data.get("invoiceId")
        invoice_number = invoice_data.get("invoiceNumber")
        status = invoice_data.get("status")
        assert invoice_id, "invoiceId missing in response"
        assert invoice_number, "invoiceNumber missing in response"
        assert status, "status missing in response"
        # Check invoiceNumber format: YYMM-NNN (e.g. 2604-001)
        import re
        assert re.match(r"^\d{4}-\d{3}$", invoice_number), f"invoiceNumber format invalid: {invoice_number}"

    finally:
        # Clean up: delete created invoice, customer, and product if API supports delete
        # No delete endpoints in PRD, so skip actual deletion for this test case.
        pass


test_post_finance_sales_with_valid_invoice_data()
