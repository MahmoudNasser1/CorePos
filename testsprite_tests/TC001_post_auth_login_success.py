import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/auth/login"
SESSION_ENDPOINT = "/auth/session"
TIMEOUT = 30

def test_post_auth_login_success():
    login_url = BASE_URL + LOGIN_ENDPOINT
    session_url = BASE_URL + SESSION_ENDPOINT
    credentials = {
        "email": "admin@pos-sahl.com",
        "password": "password123"
    }
    with requests.Session() as session:
        # Perform login POST
        response = session.post(login_url, json=credentials, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK from login, got {response.status_code}"
        # Verify httpOnly JWT cookie set
        cookies = session.cookies.get_dict()
        # Typically JWT cookie is named something like 'jwt' or 'token'; check presence of any cookie with HttpOnly flagged is not directly accessible from requests.
        # But we can assert cookies exist (requests does not expose HttpOnly attribute)
        assert cookies, "No cookies set in login response"
        # Perform GET /auth/session with cookie
        session_response = session.get(session_url, timeout=TIMEOUT)
        assert session_response.status_code == 200, f"Expected 200 OK from session, got {session_response.status_code}"
        json_data = session_response.json()
        # Validate presence of required keys
        assert isinstance(json_data, dict), "Session response is not a JSON object"
        assert "user" in json_data, "Session response missing 'user'"
        assert "profile" in json_data, "Session response missing 'profile'"
        assert "company" in json_data, "Session response missing 'company'"
        assert "subscription" in json_data, "Session response missing 'subscription'"

test_post_auth_login_success()