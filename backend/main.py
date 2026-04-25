import uuid
import logging
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import get_supabase
from routes.runs import router as runs_router
from routes.webhooks import router as webhooks_router
from routes.repos import router as repos_router
from routes.user_settings import router as user_settings_router
from routes.demo import router as demo_router
from routes.repair import router as repair_router
from supabase import Client

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting
limiter = Limiter(key_func=get_remote_address, default_limits=["1000/minute"])
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.ENVIRONMENT != "production" else None,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Content Size Limit Middleware
class ContentSizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_content_size: int):
        super().__init__(app)
        self.max_content_size = max_content_size

    async def dispatch(self, request, call_next):
        if request.method == "POST":
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > self.max_content_size:
                return JSONResponse(status_code=413, content={"error": "Request entity too large"})
        return await call_next(request)

app.add_middleware(ContentSizeLimitMiddleware, max_content_size=10_000_000)

# CORS — allow only production frontend + localhost for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", settings.VERCEL_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    req_id = str(uuid.uuid4())
    logger.error(f"Unhandled Exception [ID: {req_id}]: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "request_id": req_id}
    )

# Register route modules
app.include_router(runs_router, prefix=settings.API_V1_STR)
app.include_router(webhooks_router, prefix=settings.API_V1_STR)
app.include_router(repos_router, prefix=settings.API_V1_STR)
app.include_router(user_settings_router, prefix=settings.API_V1_STR)
app.include_router(demo_router, prefix=settings.API_V1_STR, tags=["demo"])
app.include_router(repair_router, prefix=settings.API_V1_STR)


@app.get("/health")
async def health_check(supabase: Client = Depends(get_supabase)):
    checks = {}
    try:
        # Pre-warm and check Supabase connection
        supabase.table("runs").select("id").limit(1).execute()
        checks["database"] = "ok"
    except Exception as e:
        logger.error(f"Health check database failure: {e}")
        checks["database"] = "error"
    
    # Config Integrity Check
    critical_vars = [
        "GEMINI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_KEY", 
        "SUPABASE_JWT_SECRET", "GITHUB_TOKEN"
    ]
    missing = [v for v in critical_vars if not getattr(settings, v, None)]
    checks["config"] = "ok" if not missing else f"missing_{len(missing)}_vars"
    
    checks["version"] = settings.VERSION
    checks["environment"] = settings.ENVIRONMENT
    
    status = "ok" if checks.get("database") == "ok" and checks.get("config") == "ok" else "degraded"
    return {"status": status, "checks": checks}

@app.on_event("startup")
async def startup_event():
    logger.info("DevCure backend starting...")
    if len(settings.GITHUB_WEBHOOK_SECRET or "") < 32:
        logger.warning("GITHUB_WEBHOOK_SECRET is dangerously short (< 32 chars)")
    
    # Pre-warm Supabase
    try:
        from core.database import get_supabase
        client = get_supabase()
        client.table("runs").select("id").limit(1).execute()
        logger.info("Database connection pre-warmed")
    except Exception as e:
        logger.error(f"Database pre-warm failed: {e}")
    
    logger.info("Startup complete")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
