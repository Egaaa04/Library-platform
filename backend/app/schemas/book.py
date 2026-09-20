from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    isbn: str = Field(..., min_length=1, max_length=20)
    publisher: str | None = None
    publication_year: int | None = Field(default=None, ge=1000, le=2100)
    total_copies: int = Field(..., ge=1)
    category_id: int


class BookCreate(BookBase):
    author_ids: list[int] = Field(default_factory=list)


class BookUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    isbn: str | None = Field(default=None, min_length=1, max_length=20)
    publisher: str | None = None
    publication_year: int | None = Field(default=None, ge=1000, le=2100)
    total_copies: int | None = Field(default=None, ge=1)
    category_id: int | None = None
    author_ids: list[int] | None = None


class BookAuthorResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class BookResponse(BookBase):
    id: int
    available_copies: int
    created_at: datetime
    authors: list[BookAuthorResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)