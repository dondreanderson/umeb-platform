from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserRole, MembershipTier
from app.core.security import get_password_hash

def create_superuser() -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@example.com").first()
        if user:
            print("Superuser already exists")
            return

        user = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            is_active=True,
            role=UserRole.ADMIN,
            membership_tier=MembershipTier.GOLD,
            # Handle potential schema differences if is_superuser exists or not
            # Based on initial_migration.py, there is no is_superuser column, just role='ADMIN'
        )
        db.add(user)
        db.commit()
        print("Superuser created successfully")
        print("Email: admin@example.com")
        print("Password: admin123")
    except Exception as e:
        print(f"Error creating superuser: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_superuser()
