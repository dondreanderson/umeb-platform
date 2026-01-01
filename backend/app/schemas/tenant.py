from typing import Optional
from pydantic import BaseModel
from app.models.tenant import PlanTier
from datetime import datetime

class TenantBase(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    plan_tier: Optional[PlanTier] = PlanTier.STARTER
    is_active: Optional[bool] = True

class TenantCreate(TenantBase):
    name: str
    slug: str

class TenantUpdate(TenantBase):
    pass

class Tenant(TenantBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
