from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, courses, institutes,
    uploads, dashboard, library, settings, generation, student, materials,
)

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(courses.router)
router.include_router(institutes.router)
router.include_router(uploads.router)
router.include_router(dashboard.router)
router.include_router(library.router)
router.include_router(settings.router)
router.include_router(generation.router)
router.include_router(student.router)
router.include_router(materials.router)
