from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.security import require_roles

from app.database import get_db
from app.models.author import Author
from app.models.book import Book
from app.models.category import Category
from app.schemas.book import BookCreate, BookResponse, BookUpdate
from app.models.loan_item import LoanItem



router = APIRouter(
    prefix="/books",
    tags=["Books"]
)


@router.get("", response_model=list[BookResponse])
def get_books(db: Session = Depends(get_db)):
    books = db.scalars(
        select(Book)
        .options(selectinload(Book.authors))
    ).all()

    return books


@router.get("/{book_id}", response_model=BookResponse)
def get_book(
    book_id: int,
    db: Session = Depends(get_db)
):
    book = db.scalar(
        select(Book)
        .options(selectinload(Book.authors))
        .where(Book.id == book_id)
    )

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )

    return book


@router.post(
    "",
    response_model=BookResponse,
    status_code=status.HTTP_201_CREATED
)
def create_book(
    book_data: BookCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    # Cek category
    category = db.get(Category, book_data.category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Cek ISBN
    existing_book = db.scalar(
        select(Book).where(Book.isbn == book_data.isbn)
    )

    if existing_book:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="ISBN already exists"
        )

    # Ambil authors
    authors = []

    if book_data.author_ids:
        authors = db.scalars(
            select(Author).where(
                Author.id.in_(book_data.author_ids)
            )
        ).all()

        if len(authors) != len(set(book_data.author_ids)):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more authors not found"
            )

    # Buat book
    book = Book(
        title=book_data.title,
        isbn=book_data.isbn,
        publisher=book_data.publisher,
        publication_year=book_data.publication_year,
        total_copies=book_data.total_copies,
        available_copies=book_data.total_copies,
        category_id=book_data.category_id,
    )

    # Hubungkan author
    book.authors = authors

    db.add(book)
    db.commit()
    db.refresh(book)

    return book


@router.put(
    "/{book_id}",
    response_model=BookResponse
)
def update_book(
    book_id: int,
    book_data: BookUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    book = db.scalar(
        select(Book)
        .options(selectinload(Book.authors))
        .where(Book.id == book_id)
    )

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )

    update_data = book_data.model_dump(
        exclude_unset=True
    )

    # Cek ISBN jika diubah
    if "isbn" in update_data:
        existing_book = db.scalar(
            select(Book).where(
                Book.isbn == update_data["isbn"],
                Book.id != book_id
            )
        )

        if existing_book:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="ISBN already exists"
            )

    # Cek category jika diubah
    if "category_id" in update_data:
        category = db.get(
            Category,
            update_data["category_id"]
        )

        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )

    # Update authors jika author_ids dikirim
    if "author_ids" in update_data:

        author_ids = update_data.pop("author_ids")

        authors = []

        if author_ids:
            authors = db.scalars(
                select(Author).where(
                    Author.id.in_(author_ids)
                )
            ).all()

            if len(authors) != len(set(author_ids)):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="One or more authors not found"
                )

        book.authors = authors

    # Update jumlah copy
    if "total_copies" in update_data:

        new_total = update_data["total_copies"]

        difference = new_total - book.total_copies

        new_available = book.available_copies + difference

        if new_available < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Total copies cannot be lower than borrowed copies"
            )

        book.available_copies = new_available
        book.total_copies = new_total

        update_data.pop("total_copies")

    # Update field lainnya
    for field, value in update_data.items():
        setattr(book, field, value)

    db.commit()
    db.refresh(book)

    return book


@router.delete(
    "/{book_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    book = db.get(Book, book_id)

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    existing_loan_item = db.scalar(
        select(LoanItem).where(
            LoanItem.book_id == book_id
        )
    )

    if existing_loan_item:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete book because it has loan history"
        )
    db.delete(book)
    db.commit()

    return None