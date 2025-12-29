from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base
import datetime

class Election(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, default=datetime.datetime.utcnow)
    end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    
    candidates = relationship("Candidate", back_populates="election", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="election", cascade="all, delete-orphan")
    
    position_id = Column(Integer, ForeignKey("position.id"), nullable=True)
    position = relationship("Position", back_populates="elections")

class Candidate(Base):
    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(Integer, ForeignKey("election.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    bio = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    
    election = relationship("Election", back_populates="candidates")
    votes = relationship("Vote", back_populates="candidate", cascade="all, delete-orphan")

class Vote(Base):
    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(Integer, ForeignKey("election.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidate.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    election = relationship("Election", back_populates="votes")
    candidate = relationship("Candidate", back_populates="votes")
    user = relationship("User") # Assuming User model exists
