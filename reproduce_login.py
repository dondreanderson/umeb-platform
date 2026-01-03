import requests
import sys

BASE_URL = "https://umeb-platform.vercel.app"
EMAIL = "admin@example.com"
PASSWORD = "admin123"

def check_login():
    print(f"Attempting login to {BASE_URL}...")
    try:
        payload = {
            "username": EMAIL,
            "password": PASSWORD
        }
        response = requests.post(f"{BASE_URL}/api/v1/login/access-token", data=payload)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Login Success!")
            print(response.json())
        else:
            print("Login Failed!")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Script Error: {e}")

if __name__ == "__main__":
    check_login()
