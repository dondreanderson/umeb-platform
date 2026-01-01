from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Enum
from sqlalchemy.orm import relationship
import enum
import datetime
from app.db.base_class import Base

class RegistrationStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"

class TicketType(Base):
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("event.id"), nullable=False)
    name = Column(String, nullable=False) # e.g. "VIP", "General Admission"
    description = Column(String, nullable=True)
    price = Column(Float, default=0.0, nullable=False)
    currency = Column(String, default="USD", nullable=False)
    quantity_available = Column(Integer, nullable=False) # Total tickets of this type
    quantity_sold = Column(Integer, default=0, nullable=False)
    sale_start = Column(DateTime, nullable=True)
    sale_end = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    event = relationship("Event", backref="ticket_types")

class EventRegistration(Base):
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("event.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    ticket_type_id = Column(Integer, ForeignKey("tickettype.id"), nullable=False)
    
    status = Column(String, default=RegistrationStatus.PENDING, nullable=False)
    payment_status = Column(String, default="UNPAID", nullable=False) # UNPAID, PAID
    payment_id = Column(String, nullable=True) # External Payment ID
    
    check_in_status = Column(Boolean, default=False)
    check_in_time = Column(DateTime, nullable=True)
    qr_code_data = Column(String, nullable=True, unique=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    event = relationship("Event", backref="registrations")
    user = relationship("User", backref="registrations")
    ticket_type = relationship("TicketType", backref="registrations")
