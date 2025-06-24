from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .tour_guides.tour_guide_routes import router as tour_guides_router
from .visiting_students.visiting_student_routes import router as visiting_students_router, limiter
from .tour_guides.tour_guide_deletion import router as tour_guide_deletion_router
from .visiting_students.visiting_student_deletion import router as visiting_student_deletion_router
from .matching import router as matching_router
from .test_protected import router as test_protected_router
from .weaviate_pool import router as weaviate_pool_router

app = FastAPI()

# Add rate limiting to the app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the deletion routers
app.include_router(
    tour_guide_deletion_router, 
    prefix="/api", 
    tags=["tour-guide-deletion"]
)

app.include_router(
    visiting_student_deletion_router, 
    prefix="/api", 
    tags=["visiting-student-deletion"]
)

# Include the tour guides router
app.include_router(
    tour_guides_router, 
    prefix="/api", 
    tags=["tour-guides"]
)

# Include the visiting students router
app.include_router(
    visiting_students_router, 
    prefix="/api", 
    tags=["visiting-students"]
)


# Include the matching router
app.include_router(
    matching_router, 
    prefix="/api", 
    tags=["matching"]
)

# Include the test protected routes
app.include_router(
    test_protected_router, 
    prefix="/api", 
    tags=["test-auth"]
)

app.include_router(
    weaviate_pool_router,
    prefix="/api",
    tags=["weaviate-pool"]
)

@app.get("/")
def health_check():
    return 'healthy'
