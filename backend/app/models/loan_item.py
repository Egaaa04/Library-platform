from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class LoanItem(Base):
    __tablename__ = "loan_items"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    loan_id: Mapped[int] = mapped_column(
        ForeignKey("loans.id"),
        nullable=False
    )

    book_id: Mapped[int] = mapped_column(
        ForeignKey("books.id"),
        nullable=False
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1
    )

    loan = relationship(
        "Loan",
        back_populates="items"
    )

    book = relationship(
        "Book",
        back_populates="loan_items"
    )