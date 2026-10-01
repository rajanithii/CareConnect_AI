"""
JWT Authentication Decorator
Verify JWT tokens on protected endpoints
"""

import os
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()

# Get secret key and algorithm from environment
SECRET_KEY = os.getenv("SECRET_KEY", "BloodLink_AI_Secret_Key_2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verify JWT token from Authorization header.
    
    Required header format:
      Authorization: Bearer <token>
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email: str | None = payload.get("sub")
        user_id: int | None = payload.get("id")
        user_role: str | None = payload.get("role")

        if user_email is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")

        return {
            "email": user_email,
            "id": user_id,
            "role": user_role,
        }

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def verify_hospital_token(user: dict = Depends(verify_token)) -> dict:
    """
    Verify token and check if user is a hospital or admin.
    """
    if user.get("role") not in ["hospital", "admin", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Hospital role required."
        )
    return user


async def verify_admin_token(user: dict = Depends(verify_token)) -> dict:
    """
    Verify token and check if user is an admin or super_admin.
    """
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied. Admin role required."
        )
    return user
