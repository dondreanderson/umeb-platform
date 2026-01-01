from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.models.ticketing import RegistrationStatus

router = APIRouter()

# --- Ticket Management ---

@router.get("/events/{event_id}/tickets", response_model=List[schemas.TicketType])
def read_event_tickets(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all ticket types available for an event.
    """
    tickets = db.query(models.TicketType).filter(models.TicketType.event_id == event_id).all()
    return tickets

@router.post("/events/{event_id}/tickets", response_model=schemas.TicketType)
def create_ticket_type(
    event_id: int,
    ticket_in: schemas.TicketTypeCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create a new ticket type (Admin only).
    """
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    ticket = models.TicketType(
        **ticket_in.dict(exclude={"event_id"}),
        event_id=event_id
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

# --- Registration ---

@router.post("/events/{event_id}/register", response_model=schemas.EventRegistration)
def register_for_event(
    event_id: int,
    registration_in: schemas.EventRegistrationCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Register the current user for an event (Buy a ticket).
    Checks constraints: Capacity, Ticket Availability.
    """
    # 1. Verify Event exists
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # 2. Verify Ticket Type exists and belongs to event
    ticket_type = db.query(models.TicketType).filter(models.TicketType.id == registration_in.ticket_type_id).first()
    if not ticket_type:
        raise HTTPException(status_code=404, detail="Ticket Type not found")
    if ticket_type.event_id != event_id:
        raise HTTPException(status_code=400, detail="Ticket does not belong to this event")
        
    # 3. Check Ticket Availability
    if ticket_type.quantity_sold >= ticket_type.quantity_available:
        raise HTTPException(status_code=400, detail="Ticket type sold out")
        
    # 4. Check Duplicate Registration
    existing = db.query(models.EventRegistration).filter(
        models.EventRegistration.user_id == current_user.id,
        models.EventRegistration.event_id == event_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already registered for this event")

    # 5. Create Registration
    # Generate QR Code Hash (Simple for now)
    import hashlib
    qr_data = hashlib.sha256(f"{current_user.id}-{event_id}-{datetime.datetime.utcnow()}".encode()).hexdigest()[:16]
    
    registration = models.EventRegistration(
        event_id=event_id,
        user_id=current_user.id,
        ticket_type_id=ticket_type.id,
        status=RegistrationStatus.CONFIRMED, # Auto-confirm for now (mock payment)
        payment_status="PAID" if ticket_type.price > 0 else "UNPAID", # Improve logic later
        qr_code_data=qr_data,
        check_in_status=False
    )
    
    # 6. Update Ticket Inventory
    ticket_type.quantity_sold += 1
    
    db.add(registration)
    db.add(ticket_type)
    db.commit()
    db.refresh(registration)
    return registration

@router.get("/registrations/me", response_model=List[schemas.EventRegistration])
def read_my_registrations(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all event registrations for the current user.
    """
    registrations = db.query(models.EventRegistration).filter(
        models.EventRegistration.user_id == current_user.id
    ).all()
    return registrations
