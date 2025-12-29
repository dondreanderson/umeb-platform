from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class FeeInterval(str, Enum):
    MONTHLY = "MONTHLY"
    YEARLY = "YEARLY"
    ONE_TIME = "ONE_TIME"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"

# Fee Schemas
class MembershipFeeBase(BaseModel):
    name: str
    amount: float
    interval: Optional[FeeInterval] = FeeInterval.YEARLY
    description: Optional[str] = None
    is_active: bool = True

class MembershipFeeCreate(MembershipFeeBase):
    pass

class MembershipFee(MembershipFeeBase):
    id: int
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentBase(BaseModel):
    amount: float
    status: PaymentStatus = PaymentStatus.PENDING
    transaction_id: Optional[str] = None

class PaymentCreate(BaseModel):
    fee_id: int

class Payment(PaymentBase):
    id: int
    user_id: int
    fee_id: int
    payment_date: Optional[datetime] = None
    created_at: datetime
    fee: Optional[MembershipFee] = None
    
    class Config:
        from_attributes = True
