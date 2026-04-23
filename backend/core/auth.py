# backend/core/auth.py

import os
import logging
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError

logger = logging.getLogger(__name__)
security = HTTPBearer()

# Global cache for JWKS
_JWKS_CACHE = None

def _get_auth_config():
    # Use internal env read or settings if preferred, but user provided os.getenv
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url:
        raise RuntimeError("SUPABASE_URL not configured")

    # Extract project ref from URL
    project_ref = supabase_url.replace("https://", "").split(".")[0]
    issuer = f"https://{project_ref}.supabase.co/auth/v1"

    # jwt_secret is only strictly required for HS256 legacy tokens
    return jwt_secret, supabase_url, supabase_key, issuer

async def _get_jwks(supabase_url: str, supabase_key: str):
    global _JWKS_CACHE
    if _JWKS_CACHE:
        return _JWKS_CACHE
    
    if not supabase_key:
        logger.error("SUPABASE_KEY (anon key) is required to fetch JWKS")
        raise RuntimeError("SUPABASE_KEY not configured")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            logger.info(f"Fetching JWKS from {supabase_url}/auth/v1/.well-known/jwks.json")
            response = await client.get(
                f"{supabase_url}/auth/v1/.well-known/jwks.json",
                headers={"apikey": supabase_key}
            )
            response.raise_for_status()
            _JWKS_CACHE = response.json()
            return _JWKS_CACHE
    except Exception as e:
        logger.error(f"Failed to fetch JWKS: {e}")
        raise RuntimeError(f"Could not initialize asymmetric auth: {e}")

async def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    jwt_secret, supabase_url, supabase_key, expected_issuer = _get_auth_config()

    try:
        header = jwt.get_unverified_header(credentials.credentials)
        alg = header.get("alg")
        
        # Determine verification key based on algorithm
        if alg == "HS256":
            if not jwt_secret:
                raise JWTError("HS256 detected but SUPABASE_JWT_SECRET is missing")
            verification_key = jwt_secret
        elif alg == "ES256":
            jwks = await _get_jwks(supabase_url, supabase_key)
            # Find the key matching the kid in header
            kid = header.get("kid")
            verification_key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
            if not verification_key:
                raise JWTError(f"Public key with kid '{kid}' not found in JWKS")
        else:
            raise JWTError(f"Unsupported algorithm: {alg}")

        # Decode and validate
        payload = jwt.decode(
            credentials.credentials,
            verification_key,
            algorithms=["HS256", "ES256"],
            audience="authenticated",
            issuer=expected_issuer,
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
            detail="CREDENTIALS_EXPIRED"
        )
    except JWTError as e:
        error_msg = str(e)
        header = jwt.get_unverified_header(credentials.credentials)
        
        if "Signature verification failed" in error_msg:
             logger.critical(f"CRIT_AUTH: Signature verification failed. This usually means SUPABASE_JWT_SECRET is mismatched on the backend. (Token headers: {header})")
        elif "The specified alg value is not allowed" in error_msg:
             logger.warning(f"CRIT_AUTH: Algorithm mismatch. Token uses {header.get('alg')}, but backend only allows ['HS256'].")
        else:
             logger.warning(f"JWT validation failed: {error_msg} (Header: {header})")
             
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID_SECURITY_TOKEN"
        )

async def get_current_user(payload: dict = Depends(verify_jwt)) -> dict:
    """Helper to maintain compatibility with existing routes that use get_current_user."""
    return payload

def get_user_id(user: dict = Depends(get_current_user)) -> str:
    """Convenience dependency that extracts just the user UUID."""
    return user.get("sub")
