import requests
import uuid

BASE_URL = "http://localhost:4000"
TIMEOUT = 30

def test_tc007_get_contacts_customers_with_query():
    session = requests.Session()
    try:
        # Step 1: Login with valid credentials (basic token auth simulated with JSON body)
        login_payload = {"email": "admin@pos-sahl.com", "password": "password123"}
        login_resp = session.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"

        # Step 2: Create a product (required before creating customer per instructions)
        product_data = {
            "name": f"TestProduct-{uuid.uuid4()}",
            "price": 9.99,
            "barcode": f"BC-{uuid.uuid4().hex[:12]}",
            "category": "TestCategory",
            "unit": "pcs"
        }
        prod_resp = session.post(f"{BASE_URL}/inventory/products", json=product_data, timeout=TIMEOUT)
        assert prod_resp.status_code == 201, f"Product creation failed with status {prod_resp.status_code}"
        product = prod_resp.json()
        product_id = product.get("id")
        assert product_id, "Created product ID not returned"

        # Step 3: List products (optional verification)
        list_products_resp = session.get(f"{BASE_URL}/inventory/products?page=1&perPage=20", timeout=TIMEOUT)
        assert list_products_resp.status_code == 200, f"List products failed with status {list_products_resp.status_code}"

        # Step 4: Create a customer (to test searching)
        unique_str = uuid.uuid4().hex[:8]
        customer_data = {
            "name": f"Customer {unique_str}",
            "phone": f"+100000000{unique_str[:4]}",
            "email": f"customer{unique_str}@example.com"
        }
        cust_resp = session.post(f"{BASE_URL}/contacts/customers", json=customer_data, timeout=TIMEOUT)
        assert cust_resp.status_code == 201, f"Customer creation failed with status {cust_resp.status_code}"
        customer = cust_resp.json()
        customer_id = customer.get("id")
        assert customer_id, "Created customer ID not returned"

        # Step 5: List customers with query - use part of customer name to search
        query_term = unique_str  # part of the unique name used
        customers_resp = session.get(f"{BASE_URL}/contacts/customers", params={"query": query_term}, timeout=TIMEOUT)
        assert customers_resp.status_code == 200, f"Customer search failed with status {customers_resp.status_code}"
        customers_list = customers_resp.json()
        assert isinstance(customers_list, list), "Expected list of customers in response"
        # Check that created customer is in the results by ID or name
        matches = [c for c in customers_list if (c.get("id") == customer_id) or (customer_data["name"] in c.get("name", ""))]
        assert len(matches) > 0, "Created customer not found in search results"

        # Step 6: Fetch dashboard reports to complete flow
        dashboard_resp = session.get(f"{BASE_URL}/auth/session", timeout=TIMEOUT)
        assert dashboard_resp.status_code == 200, f"Dashboard session fetch failed with status {dashboard_resp.status_code}"
        session_data = dashboard_resp.json()
        assert "user" in session_data and "company" in session_data, "Dashboard session response missing expected keys"

    finally:
        # Cleanup: delete created customer
        try:
            if 'customer_id' in locals():
                session.delete(f"{BASE_URL}/contacts/customers/{customer_id}", timeout=TIMEOUT)
        except Exception:
            pass
        # Cleanup: delete created product
        try:
            if 'product_id' in locals():
                session.delete(f"{BASE_URL}/inventory/products/{product_id}", timeout=TIMEOUT)
        except Exception:
            pass

test_tc007_get_contacts_customers_with_query()
