from typing import Optional
from datetime import datetime
from pydantic import BaseModel

# Shared properties
class SponsorBase(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    tier: Optional[str] = "Bronze"
    website: Optional[str] = None
    bio: Optional[str] = None

# Properties to receive on creation
class SponsorCreate(SponsorBase):
    name: str
    event_id: int

# Properties to receive on update
class SponsorUpdate(SponsorBase):
    pass

# Properties shared by models stored in DB
class SponsorInDBBase(SponsorBase):
    id: int
    event_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class Sponsor(SponsorInDBBase):
    pass
