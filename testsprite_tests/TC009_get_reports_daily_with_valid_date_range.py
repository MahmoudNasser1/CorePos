import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/auth/login"
SESSION_ENDPOINT = "/auth/session"
PRODUCTS_ENDPOINT = "/inventory/products"
CUSTOMERS_ENDPOINT = "/contacts/customers"
REPORTS_DAILY_ENDPOINT = "/reports/daily"

USERNAME = "admin@pos-sahl.com"
PASSWORD = "password123"
TIMEOUT = 30


def test_get_reports_daily_with_valid_date_range():
    session = requests.Session()
    try:
        # Step 1: Login
        login_payload = {
            "email": USERNAME,
            "password": PASSWORD
        }
        login_resp = session.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=login_payload,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"

        # Step 2: Create product
        product_payload = {
            "name": "Test Product TC009",
            "price": 10.99,
            "barcode": "TC009123456789",
            "category": "Test Category",
            "unit": "pcs"
        }
        product_resp = session.post(
            BASE_URL + PRODUCTS_ENDPOINT,
            json=product_payload,
            timeout=TIMEOUT
        )
        assert product_resp.status_code == 201, f"Product creation failed: {product_resp.text}"
        product_data = product_resp.json()
        product_id = product_data.get("id") or product_data.get("_id")
        assert product_id is not None, "Created product id missing"

        # Step 3: List products with search to verify product exists
        list_products_resp = session.get(
            BASE_URL + PRODUCTS_ENDPOINT,
            params={"q": "TC009123456789", "page": 1, "perPage": 20},
            timeout=TIMEOUT
        )
        assert list_products_resp.status_code == 200, f"List products failed: {list_products_resp.text}"
        products_list = list_products_resp.json()
        found_product = False
        if isinstance(products_list, dict):
            if "items" in products_list and isinstance(products_list["items"], list):
                found_product = any(p.get("id") == product_id or p.get("_id") == product_id for p in products_list["items"])
            elif "data" in products_list and isinstance(products_list["data"], list):
                found_product = any(p.get("id") == product_id or p.get("_id") == product_id for p in products_list["data"])
            else:
                if isinstance(products_list, list):
                    found_product = any(p.get("id") == product_id or p.get("_id") == product_id for p in products_list)
        elif isinstance(products_list, list):
            found_product = any(p.get("id") == product_id or p.get("_id") == product_id for p in products_list)
        assert found_product, "Created product not found in product list"

        # Step 4: Create customer
        customer_payload = {
            "name": "Test Customer TC009",
            "phone": "1234567890",
            "email": "tc009_customer@example.com"
        }
        customer_resp = session.post(
            BASE_URL + CUSTOMERS_ENDPOINT,
            json=customer_payload,
            timeout=TIMEOUT
        )
        assert customer_resp.status_code == 201, f"Customer creation failed: {customer_resp.text}"
        customer_data = customer_resp.json()
        customer_id = customer_data.get("id") or customer_data.get("_id")
        assert customer_id is not None, "Created customer id missing"

        # Step 5: List customers with search query to verify customer exists
        list_customers_resp = session.get(
            BASE_URL + CUSTOMERS_ENDPOINT,
            params={"query": "tc009_customer@example.com"},
            timeout=TIMEOUT
        )
        assert list_customers_resp.status_code == 200, f"List customers failed: {list_customers_resp.text}"
        customers_list = list_customers_resp.json()
        found_customer = False
        if isinstance(customers_list, dict):
            if "items" in customers_list and isinstance(customers_list["items"], list):
                found_customer = any(c.get("id") == customer_id or c.get("_id") == customer_id for c in customers_list["items"])
            elif "data" in customers_list and isinstance(customers_list["data"], list):
                found_customer = any(c.get("id") == customer_id or c.get("_id") == customer_id for c in customers_list["data"])
            else:
                if isinstance(customers_list, list):
                    found_customer = any(c.get("id") == customer_id or c.get("_id") == customer_id for c in customers_list)
        elif isinstance(customers_list, list):
            found_customer = any(c.get("id") == customer_id or c.get("_id") == customer_id for c in customers_list)
        assert found_customer, "Created customer not found in customer list"

        # Step 6: Fetch daily reports with valid date range
        today = datetime.utcnow().date()
        from_date = today - timedelta(days=7)
        to_date = today

        reports_params = {
            "from": from_date.isoformat(),
            "to": to_date.isoformat()
        }
        reports_resp = session.get(
            BASE_URL + REPORTS_DAILY_ENDPOINT,
            params=reports_params,
            timeout=TIMEOUT
        )
        assert reports_resp.status_code == 200, f"Reports daily fetch failed: {reports_resp.text}"
        reports_data = reports_resp.json()
        assert isinstance(reports_data, dict), "Reports daily response is not a dict"
        assert (
            any(k.lower() in reports_data for k in ["dailySales", "data", "sales", "items"])
            or len(reports_data) > 0
        ), "Reports daily response missing expected sales data"

    finally:
        session.close()


test_get_reports_daily_with_valid_date_range()
