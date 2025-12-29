from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EventGoal(Base):
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("event.id"))
    metric_name = Column(String, nullable=False) # e.g. "Attendance", "Revenue"
    target_value = Column(Float, nullable=False)
    actual_value = Column(Float, default=0.0)
    
    event = relationship("Event", back_populates="goals")
