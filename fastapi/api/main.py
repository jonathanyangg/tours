from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .tour_guides.tour_guides import router as tour_guides_router
from .visiting_students.visiting_students import router as visiting_students_router
from .tour_guides.tour_guide_deletion import router as tour_guide_deletion_router
from .visiting_students.visiting_student_deletion import router as visiting_student_deletion_router
from .matching import router as matching_router
from .test_protected import router as test_protected_router

app = FastAPI()

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
    prefix="/api/tour-guides", 
    tags=["tour-guide-deletion"]
)

app.include_router(
    visiting_student_deletion_router, 
    prefix="/api/visiting-students", 
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

@app.get("/")
def health_check():
    return 'healthy'