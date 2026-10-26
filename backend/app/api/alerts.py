# Alerts routes

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Alert, User, Stock
from app.schemas.alert import AlertCreate, AlertResponse, AlertUpdate
from app.core.security import get_current_user



router = APIRouter(prefix="/alerts", tags=["Alerts"])

# DB connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# POST- Create Alert
@router.post("/",response_model=AlertResponse,status_code=201)
def create_alert_route(
    alert_data: AlertCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
    ):

    # Check if stock exists
    stock = db.query(Stock).filter(Stock.id == alert_data.stock_id).first()

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found"
        )
    
    alert = Alert(
        user_id=current_user.id,
        stock_id=alert_data.stock_id,
        condition=alert_data.condition,
        target_price=alert_data.target_price,
        status="active"
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert


# GET - All alerts for current user
@router.get("/", response_model=list[AlertResponse])
def get_alerts_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alerts = (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(Alert.created_at.desc())
        .all()
    )

    return alerts



# GET - Single alert by ID
@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert_route(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = (
        db.query(Alert)
        .filter(
            Alert.id == alert_id,
            Alert.user_id == current_user.id
        )
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return alert


# PATCH - Update alert
@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert_route(
    alert_id: int,
    alert_data: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = (
        db.query(Alert)
        .filter(
            Alert.id == alert_id,
            Alert.user_id == current_user.id
        )
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    update_data = alert_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided to update"
        )

    for key, value in update_data.items():
        if value is None:
            raise HTTPException(
                status_code=422,
                detail=f"{key} cannot be null"
            )
        setattr(alert, key, value)

    db.commit()
    db.refresh(alert)

    return alert



# DELETE - Delete alert
@router.delete("/{alert_id}")
def delete_alert_route(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = (
        db.query(Alert)
        .filter(
            Alert.id == alert_id,
            Alert.user_id == current_user.id
        )
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    db.delete(alert)
    db.commit()

    return {"message": "Alert deleted successfully"}
