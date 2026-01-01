from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import models, schemas
from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)

reusable_oauth2_optional = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token",
    auto_error=False
)

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> models.User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        print(f"DEBUG: Validation Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(models.User).filter(models.User.id == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_user_optional(
    db: Session = Depends(get_db), 
    token: Optional[str] = Depends(reusable_oauth2_optional)
) -> Optional[models.User]:
    if not token:
        return None
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        return None # Invalid token treated as anonymous
    
    user = db.query(models.User).filter(models.User.id == token_data.sub).first()
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    # In this app, role 'admin' is treated as superuser/admin
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user

def get_current_tenant(
    current_user: models.User = Depends(get_current_active_user),
) -> models.Tenant:
    """
    Get the tenant for the current user.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=404,
            detail="User is not associated with any account/tenant."
        )
    return current_user.tenant

def check_tenant_plan(required_tier: models.PlanTier):
    """
    Dependency to check if the current tenant has the required plan tier.
    Usage: Depends(check_tenant_plan(models.PlanTier.PROFESSIONAL))
    """
    def _check(tenant: models.Tenant = Depends(get_current_tenant)):
        # Simple ranking: STARTER < PROFESSIONAL < BUSINESS
        tiers = {
            models.PlanTier.STARTER: 1,
            models.PlanTier.PROFESSIONAL: 2,
            models.PlanTier.BUSINESS: 3
        }
        if tiers.get(tenant.plan_tier, 0) < tiers.get(required_tier, 0):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires a {required_tier.value.title()} plan."
            )
        return tenant
    return _check

