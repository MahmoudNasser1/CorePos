import requests

BASE_URL = "http://localhost:4000"
AUTH_CREDENTIALS = {"email": "admin@pos-sahl.com", "password": "password123"}
TIMEOUT = 30


def test_post_finance_pos_sale_with_valid_data():
    session = requests.Session()
    try:
        # Login POST /auth/login
        login_resp = session.post(
            f"{BASE_URL}/auth/login",
            json=AUTH_CREDENTIALS,
            timeout=TIMEOUT,
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        # After login, the session should have received httpOnly JWT cookie automatically via cookies in session

        # Verify session with GET /auth/session
        session_resp = session.get(f"{BASE_URL}/auth/session", timeout=TIMEOUT)
        assert session_resp.status_code == 200, f"Session fetch failed: {session_resp.text}"
        session_data = session_resp.json()
        # Confirm keys exist in session response
        for key in ("user", "profile", "company", "subscription"):
            assert key in session_data, f"Missing {key} in session data"

        # Create a product to use in POS sale
        product_data = {
            "name": "Test Product POS",
            "price": 10.5,
            "barcode": "1234567890123",
            "category": "Test Category",
            "unit": "pcs",
        }
        create_product_resp = session.post(
            f"{BASE_URL}/inventory/products", json=product_data, timeout=TIMEOUT
        )
        assert create_product_resp.status_code == 201, f"Product creation failed: {create_product_resp.text}"
        created_product = create_product_resp.json()
        # product might be nested inside an envelope
        product_obj = created_product.get('product') or created_product
        product_id = product_obj.get("id")
        assert product_id, "Created product missing id"

        # List products to confirm product exists
        list_products_resp = session.get(f"{BASE_URL}/inventory/products?page=1&perPage=20", timeout=TIMEOUT)
        assert list_products_resp.status_code == 200, f"List products failed: {list_products_resp.text}"
        products_list = list_products_resp.json()
        # products might be in 'items' or directly list
        products_items = products_list.get('items') or products_list
        assert any(p.get("id") == product_id for p in products_items), "Product not found in products list"

        # Create customer to use in POS sale
        customer_data = {
            "name": "Test Customer POS",
            "phone": "+1234567890",
            "email": "test.customer.pos@example.com"
        }
        create_customer_resp = session.post(
            f"{BASE_URL}/contacts/customers", json=customer_data, timeout=TIMEOUT
        )
        assert create_customer_resp.status_code == 201, f"Customer creation failed: {create_customer_resp.text}"
        created_customer = create_customer_resp.json()
        customer_obj = created_customer.get('customer') or created_customer
        customer_id = customer_obj.get("id")
        assert customer_id, "Created customer missing id"

        # List customers to confirm creation
        list_customers_resp = session.get(f"{BASE_URL}/contacts/customers?query=Test%20Customer%20POS", timeout=TIMEOUT)
        assert list_customers_resp.status_code == 200, f"List customers failed: {list_customers_resp.text}"
        customers_list = list_customers_resp.json()
        customers_items = customers_list.get('items') or customers_list
        assert any(c.get("id") == customer_id for c in customers_items), "Customer not found in customers list"

        # List branches - from instructions branch data is required
        list_branches_resp = session.get(f"{BASE_URL}/dashboard/settings/branches", timeout=TIMEOUT)
        assert list_branches_resp.status_code == 200, f"List branches failed: {list_branches_resp.text}"
        branches = list_branches_resp.json()
        # branches could be list or object with items
        branches_items = branches.get('items') if isinstance(branches, dict) else branches
        assert isinstance(branches_items, list) and len(branches_items) > 0, "No branches found to assign"
        branch = branches_items[0]
        branch_id = branch.get("id")
        assert branch_id, "Branch missing id"

        # Prepare sales lines with created product
        lines = [
            {
                "productId": product_id,
                "qty": 2,
                "price": product_data["price"],
                "discount": 0,
            }
        ]

        # Prepare payments - assume cash payment with full amount
        total_amount = lines[0]["qty"] * lines[0]["price"]
        payments = [
            {
                "type": "cash",
                "amount": total_amount
            }
        ]

        # Assemble POS-sale payload
        pos_sale_payload = {
            "lines": lines,
            "payments": payments,
            "customer": {
                "id": customer_id
            },
            "branch": {
                "id": branch_id
            }
        }

        # POST /finance/pos-sale
        pos_sale_resp = session.post(
            f"{BASE_URL}/finance/pos-sale",
            json=pos_sale_payload,
            timeout=TIMEOUT,
        )
        assert pos_sale_resp.status_code == 201, f"POS sale creation failed: {pos_sale_resp.text}"

        pos_sale_data = pos_sale_resp.json()
        assert "invoiceId" in pos_sale_data, "Response missing invoiceId"
        assert "invoiceNumber" in pos_sale_data, "Response missing invoiceNumber"
        assert "status" in pos_sale_data, "Response missing status"

    finally:
        # Clean up: delete created customer
        if 'customer_id' in locals():
            session.delete(f"{BASE_URL}/contacts/customers?id={customer_id}", timeout=TIMEOUT)
        # Clean up: delete created product
        if 'product_id' in locals():
            session.delete(f"{BASE_URL}/inventory/products?id={product_id}", timeout=TIMEOUT)


test_post_finance_pos_sale_with_valid_data()