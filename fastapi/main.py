from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import matching
from fastapi.api.tour_guides import tour_guides

from fastapi.api.visiting_students import visiting_students

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tour_guides.router, prefix="/api", tags=["tour-guides"])
app.include_router(visiting_students.router, prefix="/api", tags=["visiting-students"])
app.include_router(matching.router, prefix="/api", tags=["matching"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Tour Guide Matching System API"} 