import requests
import sys

API_URL = "http://localhost:8080/api/v1"
EMAIL = "admin@example.com"
PASSWORD = "admin123"

def reproduce():
    # 1. Login
    print(f"Logging in as {EMAIL}...")
    login_resp = requests.post(
        f"{API_URL}/login/access-token",
        data={"username": EMAIL, "password": PASSWORD}
    )
    
    if login_resp.status_code != 200:
        print(f"Login failed: {login_resp.status_code} {login_resp.text}")
        return

    token = login_resp.json()["access_token"]
    print(f"Got token: {token[:10]}...")

    # 2. Create Event
    print("Creating event...")
    headers = {"Authorization": f"Bearer {token}"}
    event_data = {
        "title": "Reproduction Event",
        "description": "Test",
        "start_time": "2025-12-25T10:00:00",
        "end_time": "2025-12-25T12:00:00",
        "location": "Test Loc"
    }
    
    resp = requests.post(f"{API_URL}/events/", json=event_data, headers=headers)
    
    if resp.status_code == 200:
        print("Success! Event created.")
    else:
        print(f"Failed: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    reproduce()
