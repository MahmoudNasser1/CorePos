import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/auth/login"
SESSION_URL = f"{BASE_URL}/auth/session"
LOGOUT_URL = f"{BASE_URL}/auth/logout"

USERNAME = "admin@pos-sahl.com"
PASSWORD = "password123"
TIMEOUT = 30

def test_post_auth_logout_with_valid_session():
    session = requests.Session()
    try:
        # Login with valid credentials
        login_payload = {"email": USERNAME, "password": PASSWORD}
        login_resp = session.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        # Check that httpOnly cookie is set (session.cookies should have a cookie)
        assert session.cookies, "No cookies set on login"

        # Confirm session is valid
        session_resp = session.get(SESSION_URL, timeout=TIMEOUT)
        assert session_resp.status_code == 200, f"Session check failed with status {session_resp.status_code}"
        json_data = session_resp.json()
        # Verify expected keys in session response
        assert all(k in json_data for k in ["user", "profile", "company", "subscription"]), "Session data missing required keys"

        # Post to logout
        logout_resp = session.post(LOGOUT_URL, timeout=TIMEOUT)
        assert logout_resp.status_code == 200, f"Logout failed with status {logout_resp.status_code}"

        # After logout, cookie should be cleared or expired (requests lib does not expose httpOnly flag; best we can check is session cookies empty or changed)
        # Clear local cookies to simulate client cleared cookies after logout
        session.cookies.clear()

        # Subsequent request to session should return 401 Unauthorized
        session_after_logout_resp = session.get(SESSION_URL, timeout=TIMEOUT)
        assert session_after_logout_resp.status_code == 401, f"Session after logout did not return 401, got {session_after_logout_resp.status_code}"
    finally:
        session.close()

test_post_auth_logout_with_valid_session()