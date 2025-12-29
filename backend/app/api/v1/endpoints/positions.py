from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# Schema for Position (Internal for now, or move to schemas/position.py)
class PositionBase(BaseModel):
    title: str
    description: Optional[str] = None
    term_length: Optional[str] = None
    is_executive: bool = False

class PositionCreate(PositionBase):
    pass

class Position(PositionBase):
    id: int
    current_holder_id: Optional[int] = None
    
    class Config:
        from_attributes = True

@router.post("/", response_model=Position)
def create_position(
    *,
    db: Session = Depends(deps.get_db),
    position_in: PositionCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new position.
    """
    db_obj = models.Position(
        title=position_in.title,
        description=position_in.description,
        term_length=position_in.term_length,
        is_executive=position_in.is_executive,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=List[Position])
def read_positions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve positions.
    """
    return db.query(models.Position).offset(skip).limit(limit).all()
