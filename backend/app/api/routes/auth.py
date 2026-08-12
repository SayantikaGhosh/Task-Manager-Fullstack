from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import verify_password
from app.schemas.auth import LoginRequest, TokenResponse,  RefreshRequest
from app.core.security import hash_password
from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse
from app.core.auth import create_access_token, create_refresh_token
from app.db.redis import redis_client
from fastapi import Request
from app.core.rate_limit import check_rate_limit

from app.crud.user import (
    create_user,
    get_user_by_email,
    get_user_by_username,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def signup(
    request: Request,
    user: UserCreate,
    db: Session = Depends(get_db),
):
    check_rate_limit(
    request.client.host,
    "signup",
    )
    existing_email = get_user_by_email(db, user.email)

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    existing_username = get_user_by_username(db, user.username)

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken.",
        )

    hashed_password = hash_password(user.password)

    new_user = create_user(
        db=db,
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
    )

    return new_user

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    request: Request,
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    check_rate_limit(
    request.client.host,
    "login",
    )
    user = get_user_by_email(
        db,
        credentials.email,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(
        credentials.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(
        {
            "sub": str(user.id),
        }
    )

    refresh_token = create_refresh_token()

    redis_client.setex(
        f"refresh_token:{refresh_token}",
        7 * 24 * 60 * 60,
        str(user.id),
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
)
def refresh_token(
    data: RefreshRequest,
):
    user_id = redis_client.get(
        f"refresh_token:{data.refresh_token}"
    )

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
        )

    access_token = create_access_token(
        {
            "sub": user_id,
        }
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=data.refresh_token,
    )

@router.post("/logout")
def logout(
    data: RefreshRequest,
):
    redis_client.delete(
        f"refresh_token:{data.refresh_token}"
    )

    return {
        "message": "Logged out successfully."
    }

from app.api.dependencies.auth import get_current_user
from app.models.user import User

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user