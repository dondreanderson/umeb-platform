import requests
import sys

BASE_URL = "http://localhost:8000/api/v1"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin123"

def reproduce():
    print("Logging in...")
    try:
        resp = requests.post(f"{BASE_URL}/login/access-token", data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        if resp.status_code != 200:
            print(f"Login failed: {resp.status_code} {resp.text}")
            return
        
        token = resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login successful.")

        print("Attempting to provision tenant...")
        payload = {
            "name": "Debug Org",
            "slug": "debug-org-local-test",
            "plan_tier": "starter"
        }
        
        resp = requests.post(f"{BASE_URL}/super-admin/tenants", json=payload, headers=headers)
        print(f"Status Code: {resp.status_code}")
        print(f"Response Body: {resp.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reproduce()
