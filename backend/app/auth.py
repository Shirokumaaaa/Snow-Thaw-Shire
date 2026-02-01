import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def _get_secret_key() -> str:
    secret = os.getenv("SECRET_KEY")
    if not secret:
        raise RuntimeError("SECRET_KEY is not set")
    return secret


def authenticate_admin(username: str, password: str) -> bool:
    admin_user = os.getenv("ADMIN_USERNAME", "admin")
    admin_pass = os.getenv("ADMIN_PASSWORD", "admin123")
    return username == admin_user and password == admin_pass


def create_access_token(subject: str, role: str) -> str:
    expires_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, _get_secret_key(), algorithm="HS256")


def get_current_admin(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, _get_secret_key(), algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    role = payload.get("role")
    subject = payload.get("sub")
    if role != "admin" or not subject:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return subject
