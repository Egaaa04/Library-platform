from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.security import require_roles

from app.database import get_db
from app.models.author import Author
from app.schemas.author import (
    AuthorCreate,
    AuthorDetailResponse,
    AuthorResponse,
    AuthorUpdate,
)


router = APIRouter(
    prefix="/authors",
    tags=["Authors"]
)


@router.get(
    "",
    response_model=list[AuthorResponse]
)
def get_authors(
    db: Session = Depends(get_db)
):
    authors = db.scalars(
        select(Author)
    ).all()

    return authors


@router.get(
    "/{author_id}",
    response_model=AuthorDetailResponse
)
def get_author(
    author_id: int,
    db: Session = Depends(get_db)
):
    author = db.scalar(
        select(Author)
        .options(selectinload(Author.books))
        .where(Author.id == author_id)
    )

    if not author:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Author not found"
        )

    return author


@router.post(
    "",
    response_model=AuthorResponse,
    status_code=status.HTTP_201_CREATED
)
def create_author(
    author_data: AuthorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    existing_author = db.scalar(
        select(Author).where(
            Author.name == author_data.name
        )
    )

    if existing_author:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Author already exists"
        )

    author = Author(
        name=author_data.name,
        biography=author_data.biography
    )

    db.add(author)
    db.commit()
    db.refresh(author)

    return author


@router.put(
    "/{author_id}",
    response_model=AuthorResponse
)
def update_author(
    author_id: int,
    author_data: AuthorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    author = db.get(
        Author,
        author_id
    )

    if not author:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Author not found"
        )

    update_data = author_data.model_dump(
        exclude_unset=True
    )

    if "name" in update_data:
        existing_author = db.scalar(
            select(Author).where(
                Author.name == update_data["name"],
                Author.id != author_id
            )
        )

        if existing_author:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Author already exists"
            )

    for field, value in update_data.items():
        setattr(author, field, value)

    db.commit()
    db.refresh(author)

    return author


@router.delete(
    "/{author_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_author(
    author_id: int,
    db: Session = Depends(get_db)
):
    author = db.get(
        Author,
        author_id
    )

    if not author:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Author not found"
        )

    if author.books:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete author because the author is assigned to a book"
        )

    db.delete(author)
    db.commit()

    return None