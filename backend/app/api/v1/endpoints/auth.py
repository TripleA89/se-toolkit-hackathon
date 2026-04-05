from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import User
from app.db.schemas import AuthTokenResponse, UserLoginRequest, UserRegisterRequest, UserResponse
from app.db.session import get_db
from app.services.auth.security import create_access_token
from app.services.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db=db)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserRegisterRequest,
    service: AuthService = Depends(get_auth_service),
) -> User:
    try:
        return service.register_user(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/login", response_model=AuthTokenResponse)
def login(
    payload: UserLoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> AuthTokenResponse:
    user = service.authenticate_user(payload)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token, expires_in = create_access_token(user_id=str(user.id), username=user.username)
    return AuthTokenResponse(access_token=token, expires_in_seconds=expires_in)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
