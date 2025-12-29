from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

class DonationBase(BaseModel):
    amount: float
    currency: str = "USD"
    payment_status: str = "pending"

class DonationCreate(DonationBase):
    donor_id: int

class Donation(DonationBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class DonorBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None

class DonorCreate(DonorBase):
    pass

class Donor(DonorBase):
    id: int
    donations: List[Donation] = []
    
    class Config:
        from_attributes = True
