from sqlalchemy.orm import relationship, backref
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Boolean
from app.db.base_class import Base
import datetime

class Event(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    location = Column(String, nullable=False)
    capacity = Column(Integer, default=100)
    created_by_id = Column(Integer, ForeignKey("user.id"))
    
    # New fields
    status = Column(String, default="DRAFT", nullable=False) # DRAFT, PUBLISHED, CANCELLED, COMPLETED
    event_type = Column(String, default="MEETING", nullable=False) # WORKSHOP, GALA, MEETING, FUNDRAISER
    ticket_price = Column(Integer, default=0) # Storing as cents or just float? Schema said float, but Integer/Numeric is safer for money. Let's use Float for simplicity as per plan, or Integer if user wants cents. Plan said Float. Let's stick to Float or Integer. The plan said Float (default 0.0). I will use Float for now to match plan.
    # Actually, SQLAlchemy Float is fine.
    ticket_price = Column(Float, default=0.0)
    registration_deadline = Column(DateTime, nullable=True)
    
    # Strategy & Planning Fields
    region = Column(String, nullable=True) # e.g. "Global", "North America"
    is_template = Column(Boolean, default=False)
    parent_event_id = Column(Integer, ForeignKey("event.id"), nullable=True)
    scenario_type = Column(String, default="IN_PERSON", nullable=False) # IN_PERSON, VIRTUAL, HYBRID
    is_public = Column(Boolean, default=True)

    email_lists = relationship("EmailList", backref="event")
    
    # Relationships for strategy
    children = relationship("Event", backref=backref("parent", remote_side=[id]), remote_side=[parent_event_id]) 
    goals = relationship("EventGoal", back_populates="event", cascade="all, delete-orphan")
    budget_items = relationship("EventBudget", back_populates="event", cascade="all, delete-orphan")
    esg_metrics = relationship("EventESG", back_populates="event", cascade="all, delete-orphan")
