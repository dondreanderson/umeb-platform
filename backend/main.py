from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="API for UMEB Nonprofit Management Platform",
    version="0.1.0",
)

# Set all CORS enabled origins
print(f"DEBUG: ALLOWED ORIGINS: {settings.BACKEND_CORS_ORIGINS}")
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# DEBUG: Add exception handler to show tracebacks in 500 errors
from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def debug_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "traceback": traceback.format_exc().splitlines()
        }
    )

@app.get("/")
async def root():
    return {"message": "Welcome to UMEB Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
