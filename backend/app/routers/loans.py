from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.security import require_roles
from app.security import get_current_user
from app.models.user import User

from app.database import get_db
from app.models.book import Book
from app.models.loan import Loan
from app.models.loan_item import LoanItem
from app.models.member import Member
from app.schemas.loan import LoanCreate, LoanResponse


router = APIRouter(
    prefix="/loans",
    tags=["Loans"]
)


@router.get(
    "",
    response_model=list[LoanResponse]
)
def get_loans(
    db: Session = Depends(get_db)
):
    loans = db.scalars(
        select(Loan)
        .options(
            selectinload(Loan.items)
        )
    ).all()

    return loans

@router.get(
    "/active",
    response_model=list[LoanResponse]
)
def get_active_loans(
    db: Session = Depends(get_db)
):
    loans = db.scalars(
        select(Loan)
        .options(
            selectinload(Loan.items)
        )
        .where(
            Loan.status.in_(["borrowed", "overdue"])
        )
    ).all()

    return loans

@router.get(
    "/overdue",
    response_model=list[LoanResponse]
)
def get_overdue_loans(
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()

    loans = db.scalars(
        select(Loan)
        .options(
            selectinload(Loan.items)
        )
        .where(
            Loan.status.in_(["borrowed", "overdue"]),
            Loan.due_date < now
        )
    ).all()

    return loans

@router.put(
    "/update-overdue",
    response_model=dict
)
def update_overdue_loans(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    now = datetime.utcnow()

    overdue_loans = db.scalars(
        select(Loan).where(
            Loan.status == "borrowed",
            Loan.due_date < now
        )
    ).all()

    updated_count = 0

    for loan in overdue_loans:
        loan.status = "overdue"
        updated_count += 1

    db.commit()

    return {
        "success": True,
        "message": "Overdue loan status updated",
        "updated_count": updated_count
    }

@router.get(
    "/member/{member_id}",
    response_model=list[LoanResponse]
)
def get_member_loans(
    member_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    member = db.get(Member, member_id)

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    loans = db.scalars(
        select(Loan)
        .options(
            selectinload(Loan.items)
        )
        .where(
            Loan.member_id == member_id
        )
        .order_by(
            Loan.loan_date.desc()
        )
    ).all()

    return loans

@router.get("/my", response_model=list[LoanResponse])
def get_my_loans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.member:
        raise HTTPException(
            status_code=400,
            detail="User is not registered as a member"
        )

    loans = db.scalars(
        select(Loan)
        .options(selectinload(Loan.items))
        .where(
            Loan.member_id == current_user.member.id
        )
        .order_by(Loan.loan_date.desc())
    ).all()

    return loans

@router.get(
    "/{loan_id}",
    response_model=LoanResponse
)
def get_loan(
    loan_id: int,
    db: Session = Depends(get_db)
):
    loan = db.scalar(
        select(Loan)
        .options(
            selectinload(Loan.items)
        )
        .where(Loan.id == loan_id)
    )

    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )

    return loan


@router.post(
    "",
    response_model=LoanResponse,
    status_code=status.HTTP_201_CREATED
)
def create_loan(
    loan_data: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ==========================================
    # 1. Cek member
    # ==========================================

    if current_user.role == "member":
        if not current_user.member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not registered as a member"
            )

        if loan_data.member_id != current_user.member.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only create a loan for yourself"
            )

    member = db.get(
        Member,
        loan_data.member_id
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    if member.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Member is not active"
        )

    # ==========================================
    # 2. Cek due date
    # ==========================================

    if loan_data.due_date <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Due date must be in the future"
        )

    # ==========================================
    # 3. Cek duplicate book
    # ==========================================

    book_ids = [
        item.book_id
        for item in loan_data.items
    ]

    if len(book_ids) != len(set(book_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A book cannot appear more than once in the same loan"
        )

    # ==========================================
    # 4. Ambil semua buku
    # ==========================================

    books = db.scalars(
        select(Book).where(
            Book.id.in_(book_ids)
        )
    ).all()

    books_by_id = {
        book.id: book
        for book in books
    }

    # ==========================================
    # 5. Validasi buku dan stok
    # ==========================================

    for item in loan_data.items:

        book = books_by_id.get(
            item.book_id
        )

        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book with id {item.book_id} not found"
            )

        if item.quantity > book.available_copies:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Not enough copies available for "
                    f"book '{book.title}'"
                )
            )

    # ==========================================
    # 6. Buat loan
    # ==========================================

    loan = Loan(
        member_id=loan_data.member_id,
        due_date=loan_data.due_date,
        status="borrowed"
    )

    db.add(loan)
    db.flush()

    # ==========================================
    # 7. Buat loan items
    # ==========================================

    for item in loan_data.items:

        book = books_by_id[item.book_id]

        loan_item = LoanItem(
            loan_id=loan.id,
            book_id=book.id,
            quantity=item.quantity
        )

        db.add(loan_item)

        # Kurangi stok
        book.available_copies -= item.quantity

    # ==========================================
    # 8. Commit transaksi
    # ==========================================

    db.commit()

    db.refresh(loan)

    # Ambil ulang dengan items
    loan = db.scalar(
        select(Loan)
        .options(
            selectinload(Loan.items)
        )
        .where(Loan.id == loan.id)
    )

    return loan


@router.put(
    "/{loan_id}/return",
    response_model=LoanResponse
)
def return_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    # ==========================================
    # 1. Ambil loan
    # ==========================================

    loan = db.scalar(
        select(Loan)
        .options(
            selectinload(Loan.items)
        )
        .where(Loan.id == loan_id)
    )

    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )

    # ==========================================
    # 2. Cek status
    # ==========================================

    if loan.status == "returned":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Loan has already been returned"
        )

    # ==========================================
    # 3. Kembalikan stok
    # ==========================================

    for item in loan.items:

        book = db.get(
            Book,
            item.book_id
        )

        if book:
            book.available_copies += item.quantity

    # ==========================================
    # 4. Update loan
    # ==========================================

    loan.return_date = datetime.utcnow()
    loan.status = "returned"

    db.commit()
    db.refresh(loan)

    return loan

