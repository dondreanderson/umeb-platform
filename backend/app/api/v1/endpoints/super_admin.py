from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

def get_system_admin(
    current_user: models.User = Depends(deps.get_current_active_superuser)
) -> models.User:
    """
    Stricter check for System Admin. 
    In a real app, this might check for a specific email or a 'system_admin' flag.
    For now, we use the ADMIN role as the system admin.
    """
    # Example: if current_user.email != "superadmin@umeb.org": raise...
    return current_user

@router.get("/tenants", response_model=List[schemas.Tenant])
def read_all_tenants(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    system_admin: models.User = Depends(get_system_admin),
) -> Any:
    """
    Retrieve all tenants (System Admin only).
    """
    try:
        tenants = db.query(models.Tenant).offset(skip).limit(limit).all()
        return tenants
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")

@router.post("/tenants", response_model=schemas.Tenant)
def create_tenant(
    *,
    db: Session = Depends(deps.get_db),
    tenant_in: schemas.TenantCreate,
    system_admin: models.User = Depends(get_system_admin),
) -> Any:
    """
    Create a new tenant.
    """
    tenant = db.query(models.Tenant).filter(models.Tenant.slug == tenant_in.slug).first()
    if tenant:
        raise HTTPException(status_code=400, detail="Tenant with this slug already exists.")
    
    tenant = models.Tenant(**tenant_in.model_dump())
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant

@router.put("/tenants/{id}", response_model=schemas.Tenant)
def update_tenant(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    tenant_in: schemas.TenantUpdate,
    system_admin: models.User = Depends(get_system_admin),
) -> Any:
    """
    Update a tenant (e.g., change plan tier).
    """
    tenant = db.query(models.Tenant).filter(models.Tenant.id == id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    update_data = tenant_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tenant, field, value)
    
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant

@router.get("/stats")
def get_global_stats(
    db: Session = Depends(deps.get_db),
    system_admin: models.User = Depends(get_system_admin),
) -> Any:
    """
    Get global platform stats.
    """
    try:
        total_tenants = db.query(models.Tenant).count()
    except Exception:
        total_tenants = 0
        
    try:
        total_users = db.query(models.User).count()
    except Exception:
        total_users = 0

    try:
        total_events = db.query(models.Event).count()
    except Exception:
        total_events = 0

    try:
        total_donations = db.query(models.Donation).count() # This counts all donations regardless of success for now
    except Exception:
        total_donations = 0
    
    return {
        "total_tenants": total_tenants,
        "total_users": total_users,
        "total_events": total_events,
        "total_donations": total_donations
    }
