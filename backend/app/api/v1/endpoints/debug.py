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

@router.get("/auth-check")
def debug_auth():
    """
    Debug endpoint to check authentication libraries and environment variables.
    """
    results = {
        "env_vars": {
            "SECRET_KEY_EXISTS": "SECRET_KEY" in os.environ,
            "SECRET_KEY_LENGTH": len(os.environ.get("SECRET_KEY", "")) if "SECRET_KEY" in os.environ else 0,
        },
        "libraries": {}
    }
    
    # Test 1: Import Passlib and Create Context
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        results["libraries"]["passlib_import"] = "ok"
    except Exception as e:
        results["libraries"]["passlib_import"] = f"error: {str(e)}"
        
    # Test 2: Hash Password
    try:
        if "passlib_import" in results["libraries"] and results["libraries"]["passlib_import"] == "ok":
            hash_val = pwd_context.hash("test")
            results["libraries"]["hashing"] = "ok"
            # verify
            valid = pwd_context.verify("test", hash_val)
            results["libraries"]["verification"] = "ok" if valid else "failed"
    except Exception as e:
        results["libraries"]["hashing"] = f"error: {str(e)}"
        
    # Test 3: JWT
    try:
        from jose import jwt
        secret = os.getenv("SECRET_KEY", "fallback")
        token = jwt.encode({"test": "data"}, secret, algorithm="HS256")
        results["libraries"]["jwt_encode"] = "ok"
    except Exception as e:
        results["libraries"]["jwt_encode"] = f"error: {str(e)}"
        
    return results
