from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import datetime

class Sponsor(Base):
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("event.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    logo_url = Column(String, nullable=True)
    tier = Column(String, default="Bronze", nullable=False) # Platinum, Gold, Silver, Bronze
    website = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    event = relationship("Event", backref="sponsors")
