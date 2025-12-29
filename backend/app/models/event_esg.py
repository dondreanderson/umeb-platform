from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EventESG(Base):
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("event.id"))
    metric = Column(String, nullable=False) # e.g. "Carbon Footprint"
    value = Column(Float, default=0.0)
    unit = Column(String, nullable=False) # e.g. "kg CO2e"
    
    event = relationship("Event", back_populates="esg_metrics")
