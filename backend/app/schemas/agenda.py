from typing import Optional
from datetime import datetime
from pydantic import BaseModel

# Shared properties
class EventSessionBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    speaker_name: Optional[str] = None

# Properties to receive on creation
class EventSessionCreate(EventSessionBase):
    title: str
    start_time: datetime
    end_time: datetime
    event_id: int

# Properties to receive on update
class EventSessionUpdate(EventSessionBase):
    pass

# Properties shared by models stored in DB
class EventSessionInDBBase(EventSessionBase):
    id: int
    event_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class EventSession(EventSessionInDBBase):
    pass
