from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base

class Donor(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=True) # Optional link to user
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String, nullable=True)
    
    donations = relationship("Donation", back_populates="donor")

class FundraisingCampaign(Base):
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenant.id"), nullable=True) # Temporarily nullable
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    tenant = relationship("Tenant", back_populates="campaigns")
    donations = relationship("Donation", back_populates="campaign")

class Donation(Base):
    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donor.id"))
    campaign_id = Column(Integer, ForeignKey("fundraisingcampaign.id"), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    payment_status = Column(String, default="pending") # pending, paid, failed
    stripe_payment_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    donor = relationship("Donor", back_populates="donations")
    campaign = relationship("FundraisingCampaign", back_populates="donations")
