from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime
from enum import Enum

class EmailListStatus(str, Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    FAILED = "FAILED"

class EmailRecipient(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class EmailListBase(BaseModel):
    name: str
    subject: str
    body: str
    recipients: List[EmailRecipient] = []

class EmailListCreate(EmailListBase):
    pass

class EmailListUpdate(EmailListBase):
    pass

class EmailList(EmailListBase):
    id: int
    event_id: int
    status: EmailListStatus
    sent_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
