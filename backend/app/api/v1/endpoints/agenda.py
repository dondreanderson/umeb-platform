from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/events/{event_id}/sessions", response_model=List[schemas.EventSession])
def read_event_sessions(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all sessions for a specific event.
    """
    sessions = db.query(models.EventSession).filter(models.EventSession.event_id == event_id).order_by(models.EventSession.start_time).all()
    return sessions

@router.post("/events/{event_id}/sessions", response_model=schemas.EventSession)
def create_event_session(
    event_id: int,
    session_in: schemas.EventSessionCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create a new session for an event (Admin only).
    """
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    session = models.EventSession(
        **session_in.dict(exclude={"event_id"}),
        event_id=event_id
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.put("/sessions/{session_id}", response_model=schemas.EventSession)
def update_event_session(
    session_id: int,
    session_in: schemas.EventSessionUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a session (Admin only).
    """
    session = db.query(models.EventSession).filter(models.EventSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    update_data = session_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(session, field, value)
        
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.delete("/sessions/{session_id}", response_model=schemas.EventSession)
def delete_event_session(
    session_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a session (Admin only).
    """
    session = db.query(models.EventSession).filter(models.EventSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    db.delete(session)
    db.commit()
    return session
