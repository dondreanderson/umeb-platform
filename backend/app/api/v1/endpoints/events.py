from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app import models, schemas
from app.api import deps
from app.services.email_service import email_service
from app.models.email_list import EmailListStatus
import datetime

router = APIRouter()

@router.get("/", response_model=List[schemas.Event])
def read_events(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve events.
    """
    events = db.query(models.Event).offset(skip).limit(limit).all()
    return events

@router.post("/", response_model=schemas.Event)
def create_event(
    *,
    db: Session = Depends(deps.get_db),
    event_in: schemas.EventCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new event.
    """
    event = models.Event(**event_in.dict(), created_by_id=current_user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.post("/{id}/email-lists", response_model=schemas.EmailList)
def create_email_list(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    email_list_in: schemas.EmailListCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new email list for an event.
    """
    event = db.query(models.Event).filter(models.Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Optional: check permissions
    
    email_list = models.EmailList(
        **email_list_in.dict(),
        event_id=id,
        status=EmailListStatus.DRAFT
    )
    db.add(email_list)
    db.commit()
    db.refresh(email_list)
    return email_list

@router.get("/{id}/email-lists", response_model=List[schemas.EmailList])
def read_email_lists(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve email lists for an event.
    """
    event = db.query(models.Event).filter(models.Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    email_lists = db.query(models.EmailList).filter(models.EmailList.event_id == id).offset(skip).limit(limit).all()
    return email_lists

@router.post("/{id}/email-lists/{list_id}/send", response_model=schemas.EmailList)
async def send_email_list(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    list_id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Send an email list.
    """
    email_list = db.query(models.EmailList).filter(models.EmailList.id == list_id, models.EmailList.event_id == id).first()
    if not email_list:
        raise HTTPException(status_code=404, detail="Email list not found")
        
    if email_list.status == EmailListStatus.SENT:
        raise HTTPException(status_code=400, detail="Email list already sent")
        
    await email_service.send_email_list(email_list)
    
    email_list.status = EmailListStatus.SENT
    email_list.sent_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(email_list)
    return email_list

@router.post("/{id}/clone", response_model=schemas.Event)
def clone_event(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Clone an existing event (Template).
    """
    original_event = db.query(models.Event).filter(models.Event.id == id).first()
    if not original_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Copy basic fields
    new_event_data = {
        "title": f"Copy of {original_event.title}",
        "description": original_event.description,
        "start_time": original_event.start_time,
        "end_time": original_event.end_time,
        "location": original_event.location,
        "capacity": original_event.capacity,
        "status": "DRAFT",
        "event_type": original_event.event_type,
        "ticket_price": original_event.ticket_price,
        "parent_event_id": original_event.id, # Link to original
        "region": original_event.region,
        "scenario_type": original_event.scenario_type,
        "is_public": original_event.is_public,
        "created_by_id": current_user.id
    }
    
    new_event = models.Event(**new_event_data)
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    return new_event

@router.get("/{id}", response_model=schemas.Event)
def read_event(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get event by ID.
    """
    event = db.query(models.Event).filter(models.Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/{id}", response_model=schemas.Event)
def update_event(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    event_in: schemas.EventUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update an event.
    """
    event = db.query(models.Event).filter(models.Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Optional: check permissions (e.g. only creator or admin)
    
    update_data = event_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
        
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{id}", response_model=schemas.Event)
def delete_event(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete an event.
    """
    event = db.query(models.Event).filter(models.Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Optional: check permissions
    
    db.delete(event)
    db.commit()
    return event
