from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.security import require_roles

from app.database import get_db
from app.models.member import Member
from app.models.user import User
from app.schemas.member import (
    MemberCreate,
    MemberResponse,
    MemberUpdate
)


router = APIRouter(
    prefix="/members",
    tags=["Members"]
)


@router.get(
    "",
    response_model=list[MemberResponse]
)
def get_members(
    db: Session = Depends(get_db)
):
    members = db.scalars(
        select(Member)
    ).all()

    return members


@router.get(
    "/{member_id}",
    response_model=MemberResponse
)
def get_member(
    member_id: int,
    db: Session = Depends(get_db)
):
    member = db.get(Member, member_id)

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    return member


@router.post(
    "",
    response_model=MemberResponse,
    status_code=status.HTTP_201_CREATED
)
def create_member(
    member_data: MemberCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    # Cek user
    user = db.get(
        User,
        member_data.user_id
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Pastikan user belum menjadi member
    existing_member = db.scalar(
        select(Member).where(
            Member.user_id == member_data.user_id
        )
    )

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already registered as a member"
        )

    # Cek member code
    existing_code = db.scalar(
        select(Member).where(
            Member.member_code == member_data.member_code
        )
    )

    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Member code already exists"
        )

    member = Member(
        user_id=member_data.user_id,
        member_code=member_data.member_code,
        phone=member_data.phone,
        address=member_data.address,
        status=member_data.status
    )

    if member_data.membership_date:
        member.membership_date = member_data.membership_date

    db.add(member)
    db.commit()
    db.refresh(member)

    return member


@router.put(
    "/{member_id}",
    response_model=MemberResponse
)
def update_member(
    member_id: int,
    member_data: MemberUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    member = db.get(
        Member,
        member_id
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    update_data = member_data.model_dump(
        exclude_unset=True
    )

    # Cek member code
    if "member_code" in update_data:
        existing_member = db.scalar(
            select(Member).where(
                Member.member_code == update_data["member_code"],
                Member.id != member_id
            )
        )

        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Member code already exists"
            )

    for field, value in update_data.items():
        setattr(member, field, value)

    db.commit()
    db.refresh(member)

    return member


@router.delete(
    "/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin"]))
):
    member = db.get(
        Member,
        member_id
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    if member.loans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete member because the member has loan history"
        )

    db.delete(member)
    db.commit()

    return None