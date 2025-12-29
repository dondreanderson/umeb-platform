from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Enum
from app.db.base_class import Base
import datetime
import enum

class EmailListStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    FAILED = "FAILED"

class EmailList(Base):
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("event.id"))
    name = Column(String, index=True, nullable=False)
    recipients = Column(JSON, default=[]) # List of dicts: [{'email': '...', 'name': '...'}]
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    status = Column(Enum(EmailListStatus), default=EmailListStatus.DRAFT)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
