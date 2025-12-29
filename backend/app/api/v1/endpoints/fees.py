from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.models.fee import PaymentStatus
import datetime

router = APIRouter()

@router.get("/fees", response_model=List[schemas.MembershipFee])
def read_fees(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_user_optional),
) -> Any:
    """
    Retrieve active membership fees.
    """
    fees = db.query(models.MembershipFee).filter(models.MembershipFee.is_active == True).offset(skip).limit(limit).all()
    return fees

@router.post("/fees", response_model=schemas.MembershipFee)
def create_fee(
    *,
    db: Session = Depends(deps.get_db),
    fee_in: schemas.MembershipFeeCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new membership fee (Admin only).
    """
    fee = models.MembershipFee(**fee_in.dict())
    db.add(fee)
    db.commit()
    db.refresh(fee)
    return fee

@router.post("/payments", response_model=schemas.Payment)
def create_payment(
    *,
    db: Session = Depends(deps.get_db),
    payment_in: schemas.PaymentCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Make a payment (Mock).
    """
    fee = db.query(models.MembershipFee).filter(models.MembershipFee.id == payment_in.fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee not found")

    # Mock payment processing
    payment = models.Payment(
        user_id=current_user.id,
        fee_id=fee.id,
        amount=fee.amount,
        status=PaymentStatus.PAID, # Auto-approve for mock
        payment_date=datetime.datetime.utcnow(),
        transaction_id=f"MOCK-{datetime.datetime.utcnow().timestamp()}"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

@router.get("/payments/me", response_model=List[schemas.Payment])
def read_my_payments(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get my payment history.
    """
    return current_user.payments

@router.get("/payments", response_model=List[schemas.Payment])
def read_all_payments(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get all payments (Admin).
    """
    payments = db.query(models.Payment).offset(skip).limit(limit).all()
    return payments
