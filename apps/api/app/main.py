from fastapi import FastAPI

from app.api.routes.users import router as users_router
from app.core.config import settings


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered personal operating system",
)


app.include_router(
    users_router,
    prefix="/api",
)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": "Welcome to LifeOS API",
        "version": settings.app_version,
    }


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.app_name,
    }
