from app.core.security import get_password_hash, verify_password

try:
    print("Testing hashing...")
    pwd = "admin123"
    hashed = get_password_hash(pwd)
    print(f"Hashed: {hashed}")
    
    print("Testing verification...")
    result = verify_password(pwd, hashed)
    print(f"Verification result: {result}")
    
    if result:
        print("SUCCESS")
    else:
        print("FAILURE")
except Exception as e:
    print(f"CRASH: {e}")
