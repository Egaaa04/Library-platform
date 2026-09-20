from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class MemberCreate(BaseModel):
    user_id: int
    member_code: str = Field(
        ...,
        min_length=3,
        max_length=20
    )
    phone: str | None = Field(
        default=None,
        max_length=20
    )
    address: str | None = None
    membership_date: date | None = None
    status: str = Field(
        default="active",
        max_length=20
    )


class MemberUpdate(BaseModel):
    member_code: str | None = Field(
        default=None,
        min_length=3,
        max_length=20
    )
    phone: str | None = Field(
        default=None,
        max_length=20
    )
    address: str | None = None
    membership_date: date | None = None
    status: str | None = Field(
        default=None,
        max_length=20
    )


class MemberResponse(BaseModel):
    id: int
    user_id: int
    member_code: str
    phone: str | None
    address: str | None
    membership_date: date
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)