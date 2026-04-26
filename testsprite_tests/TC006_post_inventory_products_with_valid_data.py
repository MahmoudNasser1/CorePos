import requests

BASE_URL = "http://localhost:4000"
USERNAME = "admin@pos-sahl.com"
PASSWORD = "password123"
TIMEOUT = 30

def test_post_inventory_products_with_valid_data():
    session = requests.Session()

    login_url = f"{BASE_URL}/auth/login"
    login_payload = {"email": USERNAME, "password": PASSWORD}
    try:
        login_resp = session.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
    except Exception as e:
        raise AssertionError(f"Login request failed: {e}")

    session_url = f"{BASE_URL}/auth/session"
    try:
        session_resp = session.get(session_url, timeout=TIMEOUT)
        assert session_resp.status_code == 200, f"Session check failed with status {session_resp.status_code}"
        session_json = session_resp.json()
        required_keys = {"user", "profile", "company", "subscription"}
        assert required_keys.issubset(session_json.keys()), f"Session response missing keys: {required_keys - session_json.keys()}"
    except Exception as e:
        raise AssertionError(f"Session request failed: {e}")

    product_url = f"{BASE_URL}/inventory/products"
    product_payload = {
        "name": "Test Product TC006",
        "price": 19.99,
        "barcode": "1234567890123"
    }

    product_id = None

    try:
        create_resp = session.post(product_url, json=product_payload, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Product creation failed with status {create_resp.status_code}"
        created_product = create_resp.json()
        # If response wraps product inside a key, unwrap it
        if isinstance(created_product, dict) and "product" in created_product:
            created_product = created_product["product"]
        keys_needed = ["id", "name", "price", "barcode"]
        missing_keys = [k for k in keys_needed if k not in created_product]
        assert not missing_keys, f"Created product missing expected fields: {missing_keys}"

        product_id = created_product["id"]
        assert created_product["name"] == product_payload["name"], "Created product name mismatch"
        assert float(created_product["price"]) == product_payload["price"], "Created product price mismatch"
        assert created_product["barcode"] == product_payload["barcode"], "Created product barcode mismatch"

        get_resp = session.get(f"{product_url}?id={product_id}", timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"Product retrieval failed with status {get_resp.status_code}"
        product_details = get_resp.json()
        if isinstance(product_details, list):
            product_details = product_details[0] if product_details else None
        assert product_details is not None, "Product details response empty"
        assert product_details["id"] == product_id, "Retrieved product ID mismatch"
        assert product_details["name"] == product_payload["name"], "Retrieved product name mismatch"
        assert float(product_details["price"]) == product_payload["price"], "Retrieved product price mismatch"
        assert product_details["barcode"] == product_payload["barcode"], "Retrieved product barcode mismatch"

    finally:
        if product_id:
            try:
                del_resp = session.delete(f"{product_url}/{product_id}", timeout=TIMEOUT)
                if del_resp.status_code not in [200, 204]:
                    print(f"Warning: Product deletion returned status {del_resp.status_code}")
            except Exception as e:
                print(f"Warning: Failed to delete product {product_id}: {e}")

test_post_inventory_products_with_valid_data()
