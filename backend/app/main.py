from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import dashboard
from app.api.routes import health
from app.api.routes import incidents


app = FastAPI(
    title="SentinelSOC API",
    description="Security Operations Center Backend API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Vite development servers
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "SentinelSOC API",
        "version": "1.0.0",
        "status": "online",
    }


app.include_router(
    health.router,
    prefix="/api",
    tags=["Health"],
)

app.include_router(
    dashboard.router,
    prefix="/api",
    tags=["Dashboard"],
)

app.include_router(
    incidents.router,
    prefix="/api",
    tags=["Incidents"],
)
