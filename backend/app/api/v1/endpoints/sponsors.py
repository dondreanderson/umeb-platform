from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/events/{event_id}/sponsors", response_model=List[schemas.Sponsor])
def read_event_sponsors(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all sponsors for a specific event.
    """
    sponsors = db.query(models.Sponsor).filter(models.Sponsor.event_id == event_id).all()
    return sponsors

@router.post("/events/{event_id}/sponsors", response_model=schemas.Sponsor)
def create_event_sponsor(
    event_id: int,
    sponsor_in: schemas.SponsorCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Add a new sponsor to an event (Admin only).
    """
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    sponsor = models.Sponsor(
        **sponsor_in.dict(exclude={"event_id"}),
        event_id=event_id
    )
    db.add(sponsor)
    db.commit()
    db.refresh(sponsor)
    return sponsor

@router.put("/sponsors/{sponsor_id}", response_model=schemas.Sponsor)
def update_event_sponsor(
    sponsor_id: int,
    sponsor_in: schemas.SponsorUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a sponsor (Admin only).
    """
    sponsor = db.query(models.Sponsor).filter(models.Sponsor.id == sponsor_id).first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
        
    update_data = sponsor_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sponsor, field, value)
        
    db.add(sponsor)
    db.commit()
    db.refresh(sponsor)
    return sponsor

@router.delete("/sponsors/{sponsor_id}", response_model=schemas.Sponsor)
def delete_event_sponsor(
    sponsor_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a sponsor (Admin only).
    """
    sponsor = db.query(models.Sponsor).filter(models.Sponsor.id == sponsor_id).first()
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor not found")
        
    db.delete(sponsor)
    db.commit()
    return sponsor
