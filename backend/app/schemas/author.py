from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AuthorBase(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=150
    )
    biography: str | None = None


class AuthorCreate(AuthorBase):
    pass


class AuthorUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150
    )
    biography: str | None = None


class AuthorResponse(AuthorBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class AuthorBookResponse(BaseModel):
    id: int
    title: str
    isbn: str

    model_config = ConfigDict(
        from_attributes=True
    )


class AuthorDetailResponse(AuthorResponse):
    books: list[AuthorBookResponse] = []