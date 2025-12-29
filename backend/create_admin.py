import sys
import os

# Add the backend directory to sys.path so we can import app modules
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    email = "admin@example.com"
    password = "admin123"
    
    user = db.query(User).filter(User.email == email).first()
    if user:
        print(f"User {email} already exists.")
        # Ensure it is admin
        user.is_superuser = True
        user.role = "admin"
        db.commit()
        print("Updated existing user to Admin.")
    else:
        print(f"Creating user {email}")
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name="Admin User",
            is_superuser=True,
            role="admin",
            is_active=True
        )
        db.add(user)
        db.commit()
        print("Created Admin user.")
    db.close()

if __name__ == "__main__":
    create_admin()
