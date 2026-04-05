import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

import jwt

from app.core.config import get_settings


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    settings = get_settings()
    iterations = max(100_000, 200_000)
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    )
    digest = dk.hex()
    return f"pbkdf2_sha256${iterations}${salt}${digest}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations_raw, salt, digest = stored_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    try:
        iterations = int(iterations_raw)
    except ValueError:
        return False

    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    )
    return hmac.compare_digest(dk.hex(), digest)


def create_access_token(user_id: str, username: str) -> tuple[str, int]:
    settings = get_settings()
    expires_delta = timedelta(minutes=settings.jwt_expire_minutes)
    expires_at = datetime.now(UTC) + expires_delta

    payload = {
        "sub": user_id,
        "username": username,
        "exp": expires_at,
        "iat": datetime.now(UTC),
    }

    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    expires_seconds = int(expires_delta.total_seconds())
    return token, expires_seconds


def decode_access_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
