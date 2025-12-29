from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Election])
def read_elections(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve elections.
    """
    elections = db.query(models.election.Election).offset(skip).limit(limit).all()
    return elections

@router.post("/", response_model=schemas.Election)
def create_election(
    *,
    db: Session = Depends(deps.get_db),
    election_in: schemas.ElectionCreate,
    current_user: models.user.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new election.
    """
    election = models.election.Election(**election_in.model_dump())
    db.add(election)
    db.commit()
    db.refresh(election)
    return election

@router.post("/{id}/candidates", response_model=schemas.Candidate)
def add_candidate(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    candidate_in: schemas.CandidateCreate,
    current_user: models.user.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Add candidate to election.
    """
    election = db.query(models.election.Election).filter(models.election.Election.id == id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    
    candidate = models.election.Candidate(**candidate_in.model_dump(), election_id=id)
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate

@router.post("/{id}/vote", response_model=schemas.Vote)
def cast_vote(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    vote_in: schemas.VoteBase,
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Cast a vote in an election.
    """
    election = db.query(models.election.Election).filter(models.election.Election.id == id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    if not election.is_active:
        raise HTTPException(status_code=400, detail="Election is not active")
    
    # Check if user already voted in this election
    existing_vote = db.query(models.election.Vote).filter(
        models.election.Vote.election_id == id,
        models.election.Vote.user_id == current_user.id
    ).first()
    if existing_vote:
        raise HTTPException(status_code=400, detail="User has already voted in this election")
    
    # Check if candidate belongs to election
    candidate = db.query(models.election.Candidate).filter(
        models.election.Candidate.id == vote_in.candidate_id,
        models.election.Candidate.election_id == id
    ).first()
    if not candidate:
        raise HTTPException(status_code=400, detail="Candidate does not belong to this election")

    vote = models.election.Vote(
        election_id=id,
        candidate_id=vote_in.candidate_id,
        user_id=current_user.id
    )
    db.add(vote)
    db.commit()
    db.refresh(vote)
    return vote

@router.get("/{id}/results", response_model=schemas.ElectionResults)
def read_election_results(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Read election results.
    """
    election = db.query(models.election.Election).filter(models.election.Election.id == id).first()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    
    # Aggregate votes
    vote_counts = db.query(
        models.election.Vote.candidate_id,
        func.count(models.election.Vote.id).label("count")
    ).filter(models.election.Vote.election_id == id).group_by(models.election.Vote.candidate_id).all()
    
    # Map to candidates
    candidate_map = {c.id: c.name for c in election.candidates}
    results = []
    for vc in vote_counts:
        results.append({
            "candidate_id": vc.candidate_id,
            "name": candidate_map.get(vc.candidate_id, "Unknown"),
            "votes": vc.count
        })
    
    # Include candidates with 0 votes
    voted_candidate_ids = [vc.candidate_id for vc in vote_counts]
    for cid, name in candidate_map.items():
        if cid not in voted_candidate_ids:
            results.append({
                "candidate_id": cid,
                "name": name,
                "votes": 0
            })

    return {
        "election_id": id,
        "title": election.title,
        "results": results
    }
