from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.user import User
from app.schemas.event import Event

# Shared properties for TicketType
class TicketTypeBase(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    quantity_available: Optional[int] = 0
    sale_start: Optional[datetime] = None
    sale_end: Optional[datetime] = None
    is_active: Optional[bool] = True

# Properties to receive on creation
class TicketTypeCreate(TicketTypeBase):
    name: str
    quantity_available: int
    event_id: int

# Properties to receive on update
class TicketTypeUpdate(TicketTypeBase):
    pass

# Properties shared by models stored in DB
class TicketTypeInDBBase(TicketTypeBase):
    id: int
    event_id: int
    quantity_sold: int

    class Config:
        from_attributes = True

# Properties to return to client
class TicketType(TicketTypeInDBBase):
    pass

# --- Registration Schemas ---

class EventRegistrationBase(BaseModel):
    ticket_type_id: int

class EventRegistrationCreate(EventRegistrationBase):
    event_id: int

class EventRegistrationUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    check_in_status: Optional[bool] = None

class EventRegistrationInDBBase(EventRegistrationBase):
    id: int
    event_id: int
    user_id: int
    status: str
    payment_status: str
    payment_id: Optional[str] = None
    check_in_status: bool
    check_in_time: Optional[datetime] = None
    qr_code_data: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EventRegistration(EventRegistrationInDBBase):
    user: Optional[User] = None
    ticket_type: Optional[TicketType] = None
    event: Optional[Event] = None
