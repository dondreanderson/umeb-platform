from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Donor])
def read_donors(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve donors.
    """
    donors = db.query(models.Donor).offset(skip).limit(limit).all()
    return donors

@router.post("/", response_model=schemas.Donor)
def create_donor(
    *,
    db: Session = Depends(deps.get_db),
    donor_in: schemas.DonorCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new donor.
    """
    donor = models.Donor(**donor_in.dict())
    db.add(donor)
    db.commit()
    db.refresh(donor)
    return donor
