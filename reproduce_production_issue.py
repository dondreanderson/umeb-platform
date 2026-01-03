import requests
import sys

BASE_URL = "https://umeb-platform.vercel.app/api/v1"
EMAIL = "admin@example.com"
PASSWORD = "admin123"

def login():
    print(f"Logging in as {EMAIL}...")
    try:
        response = requests.post(f"{BASE_URL}/login/access-token", data={
            "username": EMAIL,
            "password": PASSWORD
        })
        if response.status_code == 200:
            token = response.json()["access_token"]
            print("Login Successful. Token acquired.")
            return token
        else:
            print(f"Login Failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Login Exception: {e}")
        return None

def check_me(token):
    print("Checking GET /users/me...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/users/me", headers=headers)
        print(f"User Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"User Me Exception: {e}")

def check_stats(token):
    print("Checking GET /super-admin/stats...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/super-admin/stats", headers=headers)
        print(f"Stats Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Stats Exception: {e}")

def check_tenants(token):
    print("Checking GET /super-admin/tenants...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/super-admin/tenants", headers=headers)
        print(f"Tenants Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Tenants Exception: {e}")

if __name__ == "__main__":
    token = login()
    if token:
        check_me(token)
        check_stats(token)
        check_tenants(token)
