from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Donor])
def read_donors(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve donors (Admin only).
    """
    donors = db.query(models.Donor).offset(skip).limit(limit).all()
    return donors

@router.post("/donations", response_model=schemas.Donation)
def create_donation(
    *,
    db: Session = Depends(deps.get_db),
    donation_in: schemas.DonationCreate,
) -> Any:
    """
    Create new donation and update campaign if applicable.
    """
    donation = models.Donation(**donation_in.model_dump())
    db.add(donation)
    
    # Update campaign current amount if applicable
    if donation.campaign_id:
        campaign = db.query(models.FundraisingCampaign).filter(
            models.FundraisingCampaign.id == donation.campaign_id
        ).first()
        if campaign:
            campaign.current_amount += donation.amount
            db.add(campaign)
            
    db.commit()
    db.refresh(donation)
    return donation

@router.get("/campaigns", response_model=List[schemas.FundraisingCampaign])
def read_campaigns(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve fundraising campaigns.
    """
    campaigns = db.query(models.FundraisingCampaign).offset(skip).limit(limit).all()
    return campaigns

@router.post("/campaigns", response_model=schemas.FundraisingCampaign)
def create_campaign(
    *,
    db: Session = Depends(deps.get_db),
    campaign_in: schemas.FundraisingCampaignCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new fundraising campaign.
    """
    campaign = models.FundraisingCampaign(**campaign_in.model_dump())
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

@router.get("/campaigns/{id}", response_model=schemas.FundraisingCampaign)
def read_campaign(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get campaign by ID.
    """
    campaign = db.query(models.FundraisingCampaign).filter(models.FundraisingCampaign.id == id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.post("/", response_model=schemas.Donor)
def create_donor(
    *,
    db: Session = Depends(deps.get_db),
    donor_in: schemas.DonorCreate,
) -> Any:
    """
    Create new donor.
    """
    # Check if donor already exists by email
    donor = db.query(models.Donor).filter(models.Donor.email == donor_in.email).first()
    if not donor:
        donor = models.Donor(**donor_in.model_dump())
        db.add(donor)
        db.commit()
        db.refresh(donor)
    return donor
