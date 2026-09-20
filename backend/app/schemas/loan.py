from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LoanItemCreate(BaseModel):
    book_id: int
    quantity: int = Field(default=1, ge=1)


class LoanCreate(BaseModel):
    member_id: int
    due_date: datetime
    items: list[LoanItemCreate] = Field(..., min_length=1)


class LoanItemResponse(BaseModel):
    id: int
    book_id: int
    quantity: int

    model_config = ConfigDict(from_attributes=True)


class LoanResponse(BaseModel):
    id: int
    member_id: int
    loan_date: datetime
    due_date: datetime
    return_date: datetime | None
    status: str
    created_at: datetime
    items: list[LoanItemResponse]

    model_config = ConfigDict(from_attributes=True)