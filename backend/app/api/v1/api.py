from app.api.v1.endpoints import (
    login, events, event_strategy, elections, donors, users, positions, fees, debug
)
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(donors.router, prefix="/donors", tags=["donors"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(event_strategy.router, prefix="/strategy", tags=["strategy"])
api_router.include_router(elections.router, prefix="/elections", tags=["elections"])
api_router.include_router(positions.router, prefix="/positions", tags=["positions"])
api_router.include_router(fees.router, prefix="/fees", tags=["fees"])
api_router.include_router(debug.router, prefix="/debug", tags=["debug"])
