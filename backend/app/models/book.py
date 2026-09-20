from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Column
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


book_authors = Table(
    "book_authors",
    Base.metadata,

    Column(
        "book_id",
        ForeignKey("books.id"),
        primary_key=True
    ),

    Column(
        "author_id",
        ForeignKey("authors.id"),
        primary_key=True
    )
)


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    isbn: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False
    )

    publisher: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    publication_year: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    total_copies: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1
    )

    available_copies: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    category = relationship(
        "Category",
        back_populates="books"
    )

    authors = relationship(
        "Author",
        secondary=book_authors,
        back_populates="books"
    )

    loan_items = relationship(
        "LoanItem",
        back_populates="book"
    )