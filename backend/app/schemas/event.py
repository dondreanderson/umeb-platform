from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from .event_strategy import EventGoal, EventBudget, EventESG

# Shared properties
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: str
    capacity: int = 100
    status: Optional[str] = "DRAFT"
    event_type: Optional[str] = "MEETING"
    ticket_price: Optional[float] = 0.0
    registration_deadline: Optional[datetime] = None
    
    # Strategy
    region: Optional[str] = None
    is_template: bool = False
    parent_event_id: Optional[int] = None
    scenario_type: Optional[str] = "IN_PERSON"
    is_public: bool = True

# Properties to receive on creation
class EventCreate(EventBase):
    pass

# Properties to receive on update
class EventUpdate(EventBase):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    # Add other fields as optional for update

# Properties shared by models stored in DB
class EventInDBBase(EventBase):
    id: int
    created_by_id: Optional[int] = None
    
    class Config:
        from_attributes = True

# Properties to return to client
class Event(EventInDBBase):
    goals: List[EventGoal] = []
    budget_items: List[EventBudget] = []
    esg_metrics: List[EventESG] = []
