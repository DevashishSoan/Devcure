# backend/core/auth.py

import os
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError

logger = logging.getLogger(__name__)
security = HTTPBearer()

def _get_auth_config():
    # Use internal env read or settings if preferred, but user provided os.getenv
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    supabase_url = os.getenv("SUPABASE_URL")

    if not jwt_secret:
        raise RuntimeError("SUPABASE_JWT_SECRET not configured")
    if not supabase_url:
        raise RuntimeError("SUPABASE_URL not configured")

    # Extract project ref from URL
    # https://abcdefgh.supabase.co → abcdefgh
    project_ref = supabase_url.replace("https://", "").split(".")[0]
    issuer = f"https://{project_ref}.supabase.co/auth/v1"

    return jwt_secret, issuer

async def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    jwt_secret, expected_issuer = _get_auth_config()

    try:
        # Strict validation: Only accept HS256, strictly match audience and issuer
        payload = jwt.decode(
            credentials.credentials,
            jwt_secret,
            algorithms=["HS256"],       # REJECT all other algorithms (RS256, none, etc.)
            audience="authenticated",   # REJECT anon and service_role tokens
            issuer=expected_issuer,     # REJECT tokens from other Supabase projects
            options={
                "verify_aud": True,
                "verify_iss": True,
                "verify_exp": True,
                "verify_iat": True,
                "require_aud": True,
                "require_iss": True,
                "require_exp": True,
            }
        )

        user_id = payload.get("sub")
        if not user_id:
            logger.error("JWT payload missing 'sub' claim")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        role = payload.get("role")
        if role != "authenticated":
            logger.warning(f"Unauthorized role attempt: {role}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        return payload

    except ExpiredSignatureError:
        logger.info("JWT authentication failed: Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except JWTError as e:
        # Log the failure but don't return details to the client
        logger.warning(f"JWT validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

async def get_current_user(payload: dict = Depends(verify_jwt)) -> dict:
    """Helper to maintain compatibility with existing routes that use get_current_user."""
    return payload

def get_user_id(user: dict = Depends(get_current_user)) -> str:
    """Convenience dependency that extracts just the user UUID."""
    return user.get("sub")
