from typing import Any
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api import deps

router = APIRouter()

@router.get("/health", response_model=Any)
def debug_health(
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Debug endpoint to check database connection and environment.
    """
    status = {
        "status": "checking",
        "database_url_configured": "DATABASE_URL" in os.environ,
        "database_url_prefix":  os.environ.get("DATABASE_URL", "")[:10] if "DATABASE_URL" in os.environ else None,
        "error": None
    }
    
    try:
        # Test DB connection
        db.execute(text("SELECT 1"))
        status["status"] = "ok"
        status["database"] = "connected"
    except Exception as e:
        status["status"] = "error"
        status["error"] = str(e)
        status["type"] = type(e).__name__
        
    return status
