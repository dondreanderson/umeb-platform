from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

# --- Goals ---
@router.post("/{event_id}/goals", response_model=schemas.EventGoal)
def create_goal(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    goal_in: schemas.EventGoalCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Create a new goal for an event."""
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    goal = models.EventGoal(**goal_in.dict(), event_id=event_id)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.get("/{event_id}/goals", response_model=List[schemas.EventGoal])
def read_goals(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
) -> Any:
    """Get all goals for an event."""
    return db.query(models.EventGoal).filter(models.EventGoal.event_id == event_id).all()

# --- Budget ---
@router.post("/{event_id}/budget", response_model=schemas.EventBudget)
def create_budget_item(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    budget_in: schemas.EventBudgetCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Add a budget item."""
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    item = models.EventBudget(**budget_in.dict(), event_id=event_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/{event_id}/budget", response_model=List[schemas.EventBudget])
def read_budget(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
) -> Any:
    """Get budget for an event."""
    return db.query(models.EventBudget).filter(models.EventBudget.event_id == event_id).all()

# --- ESG ---
@router.post("/{event_id}/esg", response_model=schemas.EventESG)
def create_esg_metric(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
    esg_in: schemas.EventESGCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Add an ESG metric."""
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    metric = models.EventESG(**esg_in.dict(), event_id=event_id)
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric

@router.get("/{event_id}/esg", response_model=List[schemas.EventESG])
def read_esg_metrics(
    *,
    db: Session = Depends(deps.get_db),
    event_id: int,
) -> Any:
    """Get ESG metrics for an event."""
    return db.query(models.EventESG).filter(models.EventESG.event_id == event_id).all()

# --- Dashboard ---
@router.get("/dashboard/stats", response_model=Any)
def get_strategy_dashboard_stats(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """Aggregate stats for all events."""
    # This is a simplified aggregation. In a real app, we'd use SQL aggregation.
    events = db.query(models.Event).all()
    
    total_budget_planned = 0
    total_budget_actual = 0
    total_carbon = 0
    
    for event in events:
        for budget in event.budget_items:
            total_budget_planned += budget.planned_amount
            total_budget_actual += budget.actual_amount
        for esg in event.esg_metrics:
            if "carbon" in esg.metric.lower():
                total_carbon += esg.value
                
    return {
        "total_events": len(events),
        "total_budget_planned": total_budget_planned,
        "total_budget_actual": total_budget_actual,
        "total_carbon_footprint": total_carbon,
        "events_by_region": {}, # Placeholder
        "events_by_scenario": {} # Placeholder
    }
