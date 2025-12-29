from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# Candidate Schemas
class CandidateBase(BaseModel):
    name: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class Candidate(CandidateBase):
    id: int
    election_id: int

    class Config:
        from_attributes = True

# Vote Schemas
class VoteBase(BaseModel):
    candidate_id: int

class VoteCreate(VoteBase):
    pass

class Vote(VoteBase):
    id: int
    election_id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Election Schemas
class ElectionBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: datetime
    is_active: bool = True

class ElectionCreate(ElectionBase):
    pass

class ElectionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class Election(ElectionBase):
    id: int
    candidates: List[Candidate] = []

    class Config:
        from_attributes = True

class ElectionResults(BaseModel):
    election_id: int
    title: str
    results: List[dict] # { "candidate_id": int, "name": str, "votes": int }
