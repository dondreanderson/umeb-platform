from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Enum
from sqlalchemy.orm import relationship
import enum
import datetime
from app.db.base_class import Base

class FeeInterval(str, enum.Enum):
    MONTHLY = "MONTHLY"
    YEARLY = "YEARLY"
    ONE_TIME = "ONE_TIME"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"

class MembershipFee(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # e.g. "Annual Membership 2024"
    amount = Column(Float, nullable=False)
    interval = Column(String, default=FeeInterval.YEARLY, nullable=False)
    is_active = Column(Boolean, default=True)
    description = Column(String, nullable=True)

class Payment(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    fee_id = Column(Integer, ForeignKey("membershipfee.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default=PaymentStatus.PENDING, nullable=False)
    transaction_id = Column(String, nullable=True) # Mock or Real ID
    payment_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", backref="payments")
    fee = relationship("MembershipFee")
