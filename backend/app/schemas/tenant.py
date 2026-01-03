from typing import Optional
from pydantic import BaseModel, field_validator
from app.models.tenant import PlanTier
from datetime import datetime

class TenantBase(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    plan_tier: Optional[PlanTier] = PlanTier.STARTER
    is_active: Optional[bool] = True

    @field_validator('plan_tier', mode='before')
    @classmethod
    def normalize_plan_tier(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

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
