import requests

BASE_URL = "http://localhost:4000"
USERNAME = "admin@pos-sahl.com"
PASSWORD = "password123"
TIMEOUT = 30

def test_get_inventory_products_with_search_query():
    session = requests.Session()

    # 1. Login to get httpOnly JWT cookie
    login_payload = {"email": USERNAME, "password": PASSWORD}
    login_response = session.post(
        f"{BASE_URL}/auth/login", json=login_payload, timeout=TIMEOUT
    )
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    # 'Set-Cookie' header is standard capitalization
    assert any(h.lower() == 'set-cookie' for h in login_response.headers.keys()), "No cookie set on login"

    # Initialize IDs
    product_id = None
    customer_id = None

    # 2. Create a product to search for
    product_payload = {
        "name": "TestProductSearchTC005",
        "price": 19.99,
        "barcode": "1234567890125",
        "category": "TestCategory",
        "unit": "pcs",
    }
    product_response = session.post(
        f"{BASE_URL}/inventory/products", json=product_payload, timeout=TIMEOUT
    )
    assert product_response.status_code == 201, f"Product creation failed: {product_response.text}"
    created_product = product_response.json()
    product_id = created_product.get("id")
    assert product_id, "Product ID missing in creation response"

    try:
        # 3. Query /inventory/products with search term and pagination
        search_term = "TestProductSearchTC005"
        params = {"q": search_term, "page": 1}
        search_response = session.get(
            f"{BASE_URL}/inventory/products", params=params, timeout=TIMEOUT
        )
        assert search_response.status_code == 200, f"Search failed: {search_response.text}"
        products = search_response.json()
        # products is expected to be a list or contain a list in a key (assuming list of products directly)
        assert isinstance(products, list) or isinstance(products, dict), f"Unexpected response format: {products}"
        # If list, check any product matches the search term
        items = products if isinstance(products, list) else products.get("items", [])
        assert any(
            search_term.lower() in (p.get("name", "") or "").lower() or
            search_term in (p.get("barcode", "") or "")
            for p in items
        ), "No product matches the search query found in the response"

        # 4. Create a customer for completeness
        customer_payload = {
            "name": "TestCustomerTC005",
            "phone": "+12345678901",
            "email": "testcustomer.tc005@example.com"
        }
        customer_response = session.post(
            f"{BASE_URL}/contacts/customers", json=customer_payload, timeout=TIMEOUT
        )
        assert customer_response.status_code == 201, f"Customer creation failed: {customer_response.text}"
        created_customer = customer_response.json()
        customer_id = created_customer.get("id")
        assert customer_id, "Customer ID missing in creation response"

        # 5. List customers with query to verify
        customers_list_response = session.get(
            f"{BASE_URL}/contacts/customers", params={"query": "TestCustomerTC005"}, timeout=TIMEOUT
        )
        assert customers_list_response.status_code == 200, f"List customers failed: {customers_list_response.text}"
        customers_list = customers_list_response.json()
        customers_items = (
            customers_list if isinstance(customers_list, list) else customers_list.get("items", [])
        )
        assert any("TestCustomerTC005" in (c.get("name", "") or "") for c in customers_items), \
            "Created customer not found in customers list"

        # 6. Get dashboard reports (just auth session check)
        session_response = session.get(f"{BASE_URL}/auth/session", timeout=TIMEOUT)
        assert session_response.status_code == 200, f"Auth session failed: {session_response.text}"
        session_json = session_response.json()
        assert all(k in session_json for k in ("user", "profile", "company", "subscription", "flags")), \
            "Missing keys in auth session response"

    finally:
        # Cleanup created product
        if product_id:
            delete_product_resp = session.delete(
                f"{BASE_URL}/inventory/products/{product_id}", timeout=TIMEOUT
            )
            assert delete_product_resp.status_code in (200, 204), f"Failed to delete test product: {delete_product_resp.text}"

        # Cleanup created customer
        if customer_id:
            delete_customer_resp = session.delete(
                f"{BASE_URL}/contacts/customers/{customer_id}", timeout=TIMEOUT
            )
            assert delete_customer_resp.status_code in (200, 204), f"Failed to delete test customer: {delete_customer_resp.text}"

test_get_inventory_products_with_search_query()