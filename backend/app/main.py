from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import Base, engine
from app.models import (
    User,
    Category,
    Author,
    Book,
    Member,
    Loan,
    LoanItem
)

from app.routers.books import router as books_router
from app.routers.categories import router as categories_router
from app.routers.authors import router as authors_router
from app.routers.users import router as users_router
from app.routers.members import router as members_router
from app.routers.loans import router as loans_router
from app.routers.analytics import router as analytics_router
from app.routers.auth import router as auth_router

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Library Platform API",
    description="""
    REST API untuk sistem manajemen perpustakaan.

    Fitur utama:
    - Authentication dan JWT
    - Role-based authorization
    - Manajemen buku
    - Manajemen kategori
    - Manajemen author
    - Manajemen user dan member
    - Peminjaman dan pengembalian buku
    - Pengelolaan buku overdue
    - Library analytics
    """,
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books_router)
app.include_router(categories_router)
app.include_router(authors_router)
app.include_router(users_router)
app.include_router(members_router)
app.include_router(loans_router)
app.include_router(analytics_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Library Platform API is running"
    }


@app.get("/test-db")
def test_database():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT 1")
        )

        return {
            "success": True,
            "message": "Database connection successful",
            "result": result.scalar()
        }

@app.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy",
        "service": "Library Platform API"
    }