from pydantic import BaseModel
from typing import Optional

class EventGoalBase(BaseModel):
    metric_name: str
    target_value: float
    actual_value: float = 0.0

class EventGoalCreate(EventGoalBase):
    pass

class EventGoal(EventGoalBase):
    id: int
    event_id: int

    class Config:
        from_attributes = True

class EventBudgetBase(BaseModel):
    category: str
    planned_amount: float = 0.0
    actual_amount: float = 0.0
    forecast_amount: float = 0.0

class EventBudgetCreate(EventBudgetBase):
    pass

class EventBudget(EventBudgetBase):
    id: int
    event_id: int

    class Config:
        from_attributes = True

class EventESGBase(BaseModel):
    metric: str
    value: float = 0.0
    unit: str

class EventESGCreate(EventESGBase):
    pass

class EventESG(EventESGBase):
    id: int
    event_id: int

    class Config:
        from_attributes = True
