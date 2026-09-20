from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.security import require_roles

from app.database import get_db
from app.models.book import Book
from app.models.loan import Loan
from app.models.loan_item import LoanItem
from app.models.member import Member


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    # Total judul buku
    total_titles = db.scalar(
        select(func.count(Book.id))
    )

    # Total eksemplar buku
    total_copies = db.scalar(
        select(func.coalesce(func.sum(Book.total_copies), 0))
    )

    # Total eksemplar yang tersedia
    available_copies = db.scalar(
        select(
            func.coalesce(
                func.sum(Book.available_copies),
                0
            )
        )
    )

    # Total member
    total_members = db.scalar(
        select(func.count(Member.id))
    )

    # Peminjaman aktif
    active_loans = db.scalar(
        select(func.count(Loan.id))
        .where(
            Loan.status.in_(["borrowed", "overdue"])
        )
    )

    # Peminjaman overdue
    overdue_loans = db.scalar(
        select(func.count(Loan.id))
        .where(
            Loan.status == "overdue"
        )
    )

    return {
        "total_titles": total_titles,
        "total_copies": total_copies,
        "available_copies": available_copies,
        "total_members": total_members,
        "active_loans": active_loans,
        "overdue_loans": overdue_loans
    }


@router.get("/most-borrowed")
def get_most_borrowed_books(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    results = db.execute(
        select(
            Book.id,
            Book.title,
            func.sum(LoanItem.quantity).label(
                "total_borrowed"
            )
        )
        .join(
            LoanItem,
            LoanItem.book_id == Book.id
        )
        .join(
            Loan,
            Loan.id == LoanItem.loan_id
        )
        .group_by(
            Book.id,
            Book.title
        )
        .order_by(
            func.sum(LoanItem.quantity).desc()
        )
        .limit(10)
    ).all()

    return [
        {
            "book_id": row.id,
            "title": row.title,
            "total_borrowed": row.total_borrowed
        }
        for row in results
    ]


@router.get("/borrowing-trends")
def get_borrowing_trends(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    results = db.execute(
        select(
            func.date_format(
                Loan.loan_date,
                "%Y-%m"
            ).label("month"),
            func.count(Loan.id).label(
                "total_loans"
            )
        )
        .group_by(
            func.date_format(
                Loan.loan_date,
                "%Y-%m"
            )
        )
        .order_by(
            func.date_format(
                Loan.loan_date,
                "%Y-%m"
            )
        )
    ).all()

    return [
        {
            "month": row.month,
            "total_loans": row.total_loans
        }
        for row in results
    ]


@router.get("/active-members")
def get_active_members(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    results = db.execute(
        select(
            Member.id,
            Member.member_code,
            func.count(Loan.id).label(
                "total_loans"
            )
        )
        .join(
            Loan,
            Loan.member_id == Member.id
        )
        .group_by(
            Member.id,
            Member.member_code
        )
        .order_by(
            func.count(Loan.id).desc()
        )
        .limit(10)
    ).all()

    return [
        {
            "member_id": row.id,
            "member_code": row.member_code,
            "total_loans": row.total_loans
        }
        for row in results
    ]


@router.get("/overdue-books")
def get_overdue_books(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    now = datetime.utcnow()

    results = db.execute(
        select(
            Book.id,
            Book.title,
            func.sum(LoanItem.quantity).label(
                "quantity"
            )
        )
        .join(
            LoanItem,
            LoanItem.book_id == Book.id
        )
        .join(
            Loan,
            Loan.id == LoanItem.loan_id
        )
        .where(
            Loan.status.in_(["borrowed", "overdue"]),
            Loan.due_date < now,
            Loan.return_date.is_(None)
        )
        .group_by(
            Book.id,
            Book.title
        )
        .order_by(
            func.sum(LoanItem.quantity).desc()
        )
    ).all()

    return [
        {
            "book_id": row.id,
            "title": row.title,
            "quantity": row.quantity
        }
        for row in results
    ]