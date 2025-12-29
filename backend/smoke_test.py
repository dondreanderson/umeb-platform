import requests
import sys
import time

API_URL = "http://127.0.0.1:8000/api/v1"
EMAIL = "admin@example.com"
PASSWORD = "admin123"

def smoke_test():
    print(f"Running Smoke Test against {API_URL}...")
    
    # 0. Health Check (host root usually has /health or similar, but API has docs)
    try:
        health = requests.get("http://127.0.0.1:8000/health")
        print(f"Health Check: {health.status_code}")
    except Exception as e:
        print(f"Health Check Failed: {e}")
        sys.exit(1)

    # 1. Login
    print(f"Logging in as {EMAIL}...")
    try:
        login_resp = requests.post(
            f"{API_URL}/login/access-token",
            data={"username": EMAIL, "password": PASSWORD}
        )
    except Exception as e:
        print(f"Login connection failed: {e}")
        sys.exit(1)
    
    if login_resp.status_code != 200:
        print(f"Login failed: {login_resp.status_code} {login_resp.text}")
        print("Skipping authenticated tests (create event)...")
        return

    token = login_resp.json()["access_token"]
    print(f"Got token: {token[:10]}...")

    # 2. Create Event
    print("Creating event...")
    headers = {"Authorization": f"Bearer {token}"}
    event_data = {
        "title": "Smoke Test Event",
        "description": "Created by automated smoke test",
        "start_time": "2025-12-25T10:00:00",
        "end_time": "2025-12-25T12:00:00",
        "location": "Test Loc",
        "capacity": 50,
        "ticket_price": 0,
        "event_type": "MEETING",
        "status": "DRAFT",
        "scenario_type": "IN_PERSON"
    }
    
    resp = requests.post(f"{API_URL}/events/", json=event_data, headers=headers)
    
    if resp.status_code == 200:
        print("Success! Event created.")
        event_id = resp.json()["id"]
        print(f"Event ID: {event_id}")
    else:
        print(f"Failed to create event: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    smoke_test()
