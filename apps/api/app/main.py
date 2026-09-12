from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.habits import router as habits_router
from app.api.routes.auth import router as auth_router
from app.api.routes.notes import router as notes_router
from app.api.routes.planner import router as planner_router
from app.api.routes.ai import router as ai_router
from app.api.routes.tasks import router as tasks_router
from app.api.routes.users import router as users_router
from app.core.config import settings


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered personal operating system",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    users_router,
    prefix="/api",
)

app.include_router(
    tasks_router,
    prefix="/api",
)

app.include_router(
    auth_router,
    prefix="/api",
)

app.include_router(
    habits_router,
    prefix="/api",
)

app.include_router(
    notes_router,
    prefix="/api",
)

app.include_router(
    planner_router,
    prefix="/api",
)

app.include_router(
    ai_router,
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
