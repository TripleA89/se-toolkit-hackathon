from sqlalchemy.orm import Session

from app.db.models import User
from app.db.schemas import UserLoginRequest, UserRegisterRequest
from app.services.auth.security import hash_password, verify_password


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def register_user(self, payload: UserRegisterRequest) -> User:
        username = payload.username.strip()
        existing = self.db.query(User).filter(User.username == username).first()
        if existing:
            raise ValueError("Username is already taken")

        user = User(
            username=username,
            password_hash=hash_password(payload.password),
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate_user(self, payload: UserLoginRequest) -> User | None:
        username = payload.username.strip()
        user = self.db.query(User).filter(User.username == username).first()
        if not user:
            return None

        if not verify_password(payload.password, user.password_hash):
            return None

        return user
