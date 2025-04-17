from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .tour_guides import router as tour_guides_router
from .visiting_students import router as visiting_students_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the tour guides router
app.include_router(tour_guides_router, prefix="/api", tags=["tour-guides"])

# Include the visiting students router
app.include_router(visiting_students_router, prefix="/api", tags=["visiting-students"])

@app.get("/")
def health_check():
    return 'healthy'