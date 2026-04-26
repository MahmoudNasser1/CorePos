import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/auth/login"
SESSION_ENDPOINT = "/auth/session"
PRODUCTS_ENDPOINT = "/inventory/products"
CUSTOMERS_ENDPOINT = "/contacts/customers"
POS_SALE_ENDPOINT = "/finance/pos-sale"
SALES_ENDPOINT = "/finance/sales"
REPORTS_DAILY_ENDPOINT = "/reports/daily"
REPORTS_SALES_ENDPOINT = "/reports/sales"
TREASURY_ENDPOINT = "/finance/treasury"
LOGOUT_ENDPOINT = "/auth/logout"

AUTH_CREDENTIALS = {"email": "admin@pos-sahl.com", "password": "password123"}
TIMEOUT = 30


def test_get_auth_session_with_valid_cookie():
    session = requests.Session()

    # Login
    login_payload = {
        "email": AUTH_CREDENTIALS["email"],
        "password": AUTH_CREDENTIALS["password"]
    }
    login_resp = session.post(f"{BASE_URL}{LOGIN_ENDPOINT}", json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    # Check that cookie is set
    assert session.cookies, "No cookies set on login"

    try:
        # Get auth session
        session_resp = session.get(f"{BASE_URL}{SESSION_ENDPOINT}", timeout=TIMEOUT)
        assert session_resp.status_code == 200, f"Auth session failed: {session_resp.text}"
        session_data = session_resp.json()
        # Validate keys in response
        for key in ["user", "profile", "company", "subscription"]:
            assert key in session_data, f"Key '{key}' missing in auth session response"

        # Create product to ensure flow for product create/list
        product_payload = {
            "name": "Test Product TC003",
            "price": 99.99,
            "barcode": "TC003-1234567890",
            "category": "Test Category",
            "unit": "pcs"
        }
        product_create_resp = session.post(f"{BASE_URL}{PRODUCTS_ENDPOINT}", json=product_payload, timeout=TIMEOUT)
        assert product_create_resp.status_code == 201, f"Product creation failed: {product_create_resp.text}"
        product_created = product_create_resp.json()
        product_id = product_created.get("id")
        assert product_id, "Created product ID missing"

        # List products (pagination default to page=1, perPage=20 assumed)
        product_list_resp = session.get(f"{BASE_URL}{PRODUCTS_ENDPOINT}?page=1&perPage=20", timeout=TIMEOUT)
        assert product_list_resp.status_code == 200, f"List products failed: {product_list_resp.text}"
        product_list_data = product_list_resp.json()
        assert isinstance(product_list_data, dict) or isinstance(product_list_data, list), "Invalid product list response"

        # Create customer
        customer_payload = {
            "name": "Test Customer TC003",
            "phone": "1234567890",
            "email": "tc003.customer@example.com"
        }
        customer_create_resp = session.post(f"{BASE_URL}{CUSTOMERS_ENDPOINT}", json=customer_payload, timeout=TIMEOUT)
        assert customer_create_resp.status_code == 201, f"Customer creation failed: {customer_create_resp.text}"
        customer_created = customer_create_resp.json()
        customer_id = customer_created.get("id")
        assert customer_id, "Created customer ID missing"

        # List customers (search with empty query since no specific search term provided)
        customer_list_resp = session.get(f"{BASE_URL}{CUSTOMERS_ENDPOINT}?query=", timeout=TIMEOUT)
        assert customer_list_resp.status_code == 200, f"List customers failed: {customer_list_resp.text}"
        customer_list_data = customer_list_resp.json()
        assert isinstance(customer_list_data, dict) or isinstance(customer_list_data, list), "Invalid customer list response"

        # Fetch dashboard reports daily (use a valid date range: last 7 days)
        import datetime
        today = datetime.date.today()
        from_date = (today - datetime.timedelta(days=7)).isoformat()
        to_date = today.isoformat()

        reports_daily_resp = session.get(f"{BASE_URL}{REPORTS_DAILY_ENDPOINT}?from={from_date}&to={to_date}", timeout=TIMEOUT)
        assert reports_daily_resp.status_code == 200, f"Daily reports fetch failed: {reports_daily_resp.text}"
        reports_daily_data = reports_daily_resp.json()
        assert isinstance(reports_daily_data, dict) or isinstance(reports_daily_data, list), "Invalid daily reports response"

    finally:
        # Cleanup created product
        try:
            if 'product_id' in locals():
                session.delete(f"{BASE_URL}{PRODUCTS_ENDPOINT}/{product_id}", timeout=TIMEOUT)
        except Exception:
            pass

        # Cleanup created customer
        try:
            if 'customer_id' in locals():
                session.delete(f"{BASE_URL}{CUSTOMERS_ENDPOINT}/{customer_id}", timeout=TIMEOUT)
        except Exception:
            pass

        # Logout to clear session cookie
        try:
            session.post(f"{BASE_URL}{LOGOUT_ENDPOINT}", timeout=TIMEOUT)
        except Exception:
            pass


test_get_auth_session_with_valid_cookie()
