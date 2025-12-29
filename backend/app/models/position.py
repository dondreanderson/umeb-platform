from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Position(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    term_length = Column(String, nullable=True)  # e.g. "1 Year"
    is_executive = Column(Boolean, default=False)
    
    current_holder_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    
    current_holder = relationship("User", foreign_keys=[current_holder_id])
    elections = relationship("Election", back_populates="position")
