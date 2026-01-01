from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base_class import Base

class PlanTier(str, enum.Enum):
    STARTER = "starter"
    PROFESSIONAL = "professional"
    BUSINESS = "business"

class Tenant(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    slug = Column(String, index=True, unique=True, nullable=False)
    plan_tier = Column(Enum(PlanTier), default=PlanTier.STARTER)
    is_active = Column(Boolean(), default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="tenant")
    events = relationship("Event", back_populates="tenant")
    campaigns = relationship("FundraisingCampaign", back_populates="tenant")
    elections = relationship("Election", back_populates="tenant")
    fees = relationship("MembershipFee", back_populates="tenant")
    sponsors = relationship("Sponsor", back_populates="tenant")
