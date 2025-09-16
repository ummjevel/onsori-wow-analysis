from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import Request
from sqlalchemy.orm import Session
import uvicorn

from app.config import settings
from app.database import get_db, create_tables
from app.logging_config import setup_logging, get_logger
from app.routers import users, analysis, batch
from app.batch_scheduler import start_scheduler

# Setup logging first
setup_logging()
logger = get_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Onsori WOW Analysis System",
    description="발음 학습 분석 시스템",
    version="1.0.0",
    debug=settings.api.debug
)

# Mount static files
app.mount("/static", StaticFiles(directory=settings.paths.static), name="static")

# Setup templates
templates = Jinja2Templates(directory=settings.paths.templates)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(batch.router, prefix="/api/batch", tags=["batch"])


@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("Starting Onsori WOW Analysis System")

    # Create database tables if they don't exist (for development)
    try:
        create_tables()
        logger.info("Database tables checked/created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise

    # Start batch scheduler
    try:
        start_scheduler()
        logger.info("Batch scheduler started successfully")
    except Exception as e:
        logger.error(f"Failed to start batch scheduler: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("Shutting down Onsori WOW Analysis System")


@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """Main dashboard page"""
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/test", response_class=HTMLResponse)
async def test_page(request: Request):
    """Test interface page"""
    return templates.TemplateResponse("test.html", {"request": request})


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Onsori WOW Analysis System is running"}


@app.get("/api/info")
async def system_info():
    """System information endpoint"""
    return {
        "title": "Onsori WOW Analysis System",
        "version": "1.0.0",
        "database": {
            "host": settings.database.host,
            "port": settings.database.port,
            "database": settings.database.database
        },
        "ollama": {
            "base_url": settings.ollama.base_url,
            "model": settings.ollama.model
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.api.host,
        port=settings.api.port,
        reload=settings.api.debug,
        log_level="info"
    )