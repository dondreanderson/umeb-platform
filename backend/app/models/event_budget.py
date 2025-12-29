from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EventBudget(Base):
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("event.id"))
    category = Column(String, nullable=False) # e.g. "Venue", "Catering"
    planned_amount = Column(Float, default=0.0)
    actual_amount = Column(Float, default=0.0)
    forecast_amount = Column(Float, default=0.0)
    
    event = relationship("Event", back_populates="budget_items")
