from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth.auth_router import router as auth_router
from auth.auth_dependency import get_current_user
from rag.rag_router import router as rag_router

app = FastAPI(
    title="Wealth Portfolio RAG Agent API",
    description="Advanced AI-powered portfolio analysis system",
    version="1.0.0"
)

# Add CORS middleware with comprehensive configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    expose_headers=["*"],
    max_age=86400,  # 24 hours
)

# Include routers with prefixes
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(rag_router, tags=["RAG Agent"])

@app.get("/secure-data")
def secure_data(user: str = Depends(get_current_user)):
    return {"message": f"Welcome {user}, you accessed a protected route!"}

@app.get("/")
def root():
    return {
        "message": "Wealth Portfolio RAG Agent API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/auth",
            "rag": "/rag",
            "secure": "/secure-data"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": "2024-01-15T10:30:00Z"}
