from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime

class DonationBase(BaseModel):
    amount: float
    currency: str = "USD"
    payment_status: str = "pending"
    campaign_id: Optional[int] = None

class DonationCreate(DonationBase):
    donor_id: int

class Donation(DonationBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class FundraisingCampaignBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_amount: float
    is_active: bool = True

class FundraisingCampaignCreate(FundraisingCampaignBase):
    end_date: Optional[datetime] = None

class FundraisingCampaignUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    is_active: Optional[bool] = None
    end_date: Optional[datetime] = None

class FundraisingCampaign(FundraisingCampaignBase):
    id: int
    current_amount: float
    start_date: datetime
    end_date: Optional[datetime] = None
    donations: List[Donation] = []
    
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
