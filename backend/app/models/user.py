from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"
    DONOR = "donor"
    VOLUNTEER = "volunteer"

class MembershipTier(str, enum.Enum):
    NONE = "none"
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenant.id"), nullable=True) # Temporarily nullable for migration
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    
    role = Column(Enum(UserRole), default=UserRole.MEMBER)
    membership_tier = Column(Enum(MembershipTier), default=MembershipTier.NONE)

    tenant = relationship("Tenant", back_populates="users")

    @property
    def is_superuser(self) -> bool:
        return self.role == UserRole.ADMIN

    @is_superuser.setter
    def is_superuser(self, value: bool):
        if value:
            self.role = UserRole.ADMIN
        elif self.role == UserRole.ADMIN:
            self.role = UserRole.MEMBER

    # Profile Fields
    bio = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
