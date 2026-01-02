import sys
import os
import time

# Add backend to sys.path
sys.path.append(os.getcwd())

from app.db.session import engine, SessionLocal
from sqlalchemy import text

def test_connection():
    print("Testing Database Connection...")
    try:
        # Try raw connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print(f"Connection Successful! Result: {result.scalar()}")
        
        # Try Session
        db = SessionLocal()
        print("Session created successfully.")
        db.close()
        return True
    except Exception as e:
        print(f"CONNECTION FAILED: {e}")
        return False

if __name__ == "__main__":
    if test_connection():
        print("✅ DB Check Passed")
        sys.exit(0)
    else:
        print("❌ DB Check Failed")
        sys.exit(1)
