import requests
import uuid

BASE_URL = "http://localhost:4000"
TIMEOUT = 30

def test_post_auth_register_new_user():
    session = requests.Session()
    headers = {
        "Content-Type": "application/json"
    }

    # Generate unique user data to avoid conflict
    unique_suffix = str(uuid.uuid4())
    full_name = f"Test User {unique_suffix}"
    email = f"testuser_{unique_suffix}@example.com"
    password = "TestPassword123!"
    company_name = f"Test Company {unique_suffix}"

    register_payload = {
        "fullName": full_name,
        "email": email,
        "password": password,
        "company": company_name
    }

    # Register user
    register_resp = session.post(
        f"{BASE_URL}/auth/register",
        json=register_payload,
        headers=headers,
        timeout=TIMEOUT
    )
    assert register_resp.status_code == 201, f"Expected 201, got {register_resp.status_code}"
    # Verify httpOnly JWT cookie set
    cookie_jar = register_resp.cookies
    jwt_cookie_found = False
    for cookie in cookie_jar:
        # We expect a JWT cookie with httpOnly attribute set (requests does not expose httpOnly attr directly)
        # So we just check cookie name commonly used (e.g., 'jwt', 'token', 'access_token' or similar)
        if cookie.name.lower() in ("jwt", "token", "access_token", "pos_sahl_jwt"):
            jwt_cookie_found = True
            break
    assert jwt_cookie_found, "JWT httpOnly cookie not found in register response."

    try:
        # Use the cookie to get /auth/session and verify created user and company
        session_resp = session.get(
            f"{BASE_URL}/auth/session",
            headers={"Accept": "application/json"},
            timeout=TIMEOUT
        )
        assert session_resp.status_code == 200, f"Expected 200 from /auth/session, got {session_resp.status_code}"
        session_data = session_resp.json()
        # Validate that user and company info are present and match registration data
        assert "user" in session_data, "Response missing 'user' key"
        assert "company" in session_data, "Response missing 'company' key"
        assert session_data["user"]["email"].lower() == email.lower(), "User email does not match registered email"
        # company should be an object and have a name-like field
        company = session_data["company"]
        assert isinstance(company, dict), "Company info is not an object"
        company_name_from_resp = None
        for key in ("name", "companyName", "title"):
            if key in company:
                company_name_from_resp = company[key]
                break
        assert company_name_from_resp is not None, "Company name field missing in session response"
        # Relaxed check: check registered company_name substring in response company name (case insensitive)
        assert company_name.lower() in company_name_from_resp.lower(), "Company name in session response doesn't contain registered company name"
    finally:
        # Cleanup: Attempt to login with created user and then delete user and company if API supported
        # The PRD does not specify delete endpoints for user or company, so no cleanup possible
        # If cleanup needed, implement here.
        pass

test_post_auth_register_new_user()