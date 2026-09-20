from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Loan(Base):
    __tablename__ = "loans"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    member_id: Mapped[int] = mapped_column(
        ForeignKey("members.id"),
        nullable=False
    )

    loan_date: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    due_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    return_date: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="borrowed"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    member = relationship(
        "Member",
        back_populates="loans"
    )

    items = relationship(
        "LoanItem",
        back_populates="loan"
    )