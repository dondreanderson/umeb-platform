import sys
import os
# Add backend to path
sys.path.append(os.getcwd())

# Set DB URL for local script execution
os.environ["DATABASE_URL"] = "postgresql://postgres.egvayfmrbdtfcqepxuuf:V1WNwKFzfjSPkIPH@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

from app.db.session import SessionLocal
from app.models.event import Event
from app.models.ticketing import TicketType

db = SessionLocal()

def seed_tickets():
    print("Seeding tickets...")
    events = db.query(Event).all()
    
    if not events:
        print("No events found. Creating a default event...")
        from datetime import datetime, timedelta
        default_event = Event(
            title="Annual Tech Gala 2025",
            description="The biggest tech event of the year.",
            start_time=datetime.utcnow() + timedelta(days=30),
            end_time=datetime.utcnow() + timedelta(days=30, hours=4),
            location="San Francisco, CA",
            capacity=500,
            status="PUBLISHED",
            event_type="GALA",
            ticket_price=0.0 # Legacy field
        )
        db.add(default_event)
        db.commit()
        db.refresh(default_event)
        events = [default_event]

    for event in events:
        print(f"Adding tickets for event: {event.title}")
        
        # Check if tickets already exist
        existing = db.query(TicketType).filter(TicketType.event_id == event.id).first()
        if existing:
            print("  - Tickets already exist. Skipping.")
            continue
            
        # Create VIP Ticket
        vip = TicketType(
            event_id=event.id,
            name="VIP Access",
            description="Includes front row seating and dinner.",
            price=150.00,
            quantity_available=50,
            quantity_sold=0
        )
        
        # Create General Admission
        general = TicketType(
            event_id=event.id,
            name="General Admission",
            description="Standard entry ticket.",
            price=50.00,
            quantity_available=200,
            quantity_sold=0
        )
        
        db.add(vip)
        db.add(general)
    
    db.commit()
    print("Tickets seeded successfully!")

if __name__ == "__main__":
    try:
        seed_tickets()
    except Exception as e:
        import traceback
        traceback.print_exc()
