"""
All the actual "authorization" machinery lives here:
  - hashing passwords so we never store them in plain text
  - creating a JWT (a signed token) when someone logs in
  - a FastAPI dependency, get_current_user, that any route can use to
    require "you must be logged in" and to know WHICH user is calling

How it fits together:
  1. User signs up -> we hash their password, save it
  2. User logs in -> we check the password, if correct we hand back a JWT
  3. Frontend stores that JWT and sends it as
     "Authorization: Bearer <token>" on every future request
  4. Any protected route adds `current_user: User = Depends(get_current_user)`
     as a parameter -> FastAPI automatically validates the token and gives
     you the logged-in User object, or rejects the request with 401 if the
     token is missing/invalid/expired.
"""
import os
from datetime import datetime, timedelta

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt import PyJWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User

# ---- Config -----------------------------------------------------------
# IMPORTANT: in a real deployment this MUST come from an environment
# variable, never hardcoded. For the hackathon demo, we fall back to a
# default so it runs out of the box, but you should set JWT_SECRET_KEY
# yourself before sharing this publicly.
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-only-secret-change-me-before-deploying")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours - generous for a hackathon demo

# Tells FastAPI's auto-docs (/docs) where to send the "Authorize" button's
# login request. Also parses the "Authorization: Bearer <token>" header
# automatically for every route that depends on it.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ---- Password helpers ---------------------------------------------------
# bcrypt has a hard 72-byte input limit, so we truncate defensively -
# irrelevant for any normal password, just guards against an obscure crash.

def hash_password(plain_password: str) -> str:
    password_bytes = plain_password.encode("utf-8")[:72]
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode("utf-8")[:72]
    return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))


# ---- JWT helpers ---------------------------------------------------------

def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str:
    """Returns the user_id embedded in the token, or raises if invalid/expired."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise PyJWTError("Token missing subject")
        return user_id
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---- The dependency every protected route uses ---------------------------

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Add `current_user: User = Depends(get_current_user)` to any route to
    require login. FastAPI handles pulling the token out of the
    Authorization header automatically.
    """
    user_id = decode_access_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")
    return user
