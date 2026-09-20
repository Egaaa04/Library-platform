from datetime import date

from pwdlib import PasswordHash
from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app.models import (
    Author,
    Book,
    Category,
    Member,
    User,
)


password_hash = PasswordHash.recommended()


def seed_database():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # ==========================================
        # 1. USERS
        # ==========================================

        users = [
            User(
                username="admin",
                email="admin@library.com",
                password_hash=password_hash.hash("Admin123!"),
                role="admin",
            ),
            User(
                username="john",
                email="john@library.com",
                password_hash=password_hash.hash("Member123!"),
                role="member",
            ),
            User(
                username="sarah",
                email="sarah@library.com",
                password_hash=password_hash.hash("Member123!"),
                role="member",
            ),
        ]

        db.add_all(users)
        db.flush()

        # ==========================================
        # 2. CATEGORIES
        # ==========================================

        categories = [
            Category(
                name="Technology",
                description="Books about technology and software development.",
            ),
            Category(
                name="Database",
                description="Books about database systems and data management.",
            ),
            Category(
                name="Business",
                description="Books about business and management.",
            ),
            Category(
                name="Science",
                description="Books about science and research.",
            ),
            Category(
                name="Novel",
                description="Fiction and literary works.",
            ),
        ]

        db.add_all(categories)
        db.flush()

        # ==========================================
        # 3. AUTHORS
        # ==========================================

        authors = [
            Author(
                name="Robert C. Martin",
                biography="Software engineer and author known for books about software development.",
            ),
            Author(
                name="Martin Kleppmann",
                biography="Author and researcher focused on data-intensive applications.",
            ),
            Author(
                name="Thomas H. Cormen",
                biography="Computer science author and professor.",
            ),
            Author(
                name="James Clear",
                biography="Author focused on habits and personal development.",
            ),
            Author(
                name="Yuval Noah Harari",
                biography="Historian and author of books about human history and society.",
            ),
        ]

        db.add_all(authors)
        db.flush()

        # ==========================================
        # 4. BOOKS
        # ==========================================

        technology = db.scalar(
            select(Category).where(Category.name == "Technology")
        )

        database = db.scalar(
            select(Category).where(Category.name == "Database")
        )

        business = db.scalar(
            select(Category).where(Category.name == "Business")
        )

        science = db.scalar(
            select(Category).where(Category.name == "Science")
        )

        novel = db.scalar(
            select(Category).where(Category.name == "Novel")
        )

        robert_martin = db.scalar(
            select(Author).where(
                Author.name == "Robert C. Martin"
            )
        )

        martin_kleppmann = db.scalar(
            select(Author).where(
                Author.name == "Martin Kleppmann"
            )
        )

        cormen = db.scalar(
            select(Author).where(
                Author.name == "Thomas H. Cormen"
            )
        )

        james_clear = db.scalar(
            select(Author).where(
                Author.name == "James Clear"
            )
        )

        yuval = db.scalar(
            select(Author).where(
                Author.name == "Yuval Noah Harari"
            )
        )

        books = [
            Book(
                title="Clean Code",
                isbn="9780132350884",
                publisher="Prentice Hall",
                publication_year=2008,
                total_copies=5,
                available_copies=5,
                category=technology,
                authors=[robert_martin],
            ),
            Book(
                title="The Clean Coder",
                isbn="9780137081073",
                publisher="Prentice Hall",
                publication_year=2011,
                total_copies=4,
                available_copies=4,
                category=technology,
                authors=[robert_martin],
            ),
            Book(
                title="Designing Data-Intensive Applications",
                isbn="9781449373320",
                publisher="O'Reilly Media",
                publication_year=2017,
                total_copies=4,
                available_copies=4,
                category=database,
                authors=[martin_kleppmann],
            ),
            Book(
                title="Introduction to Algorithms",
                isbn="9780262046305",
                publisher="MIT Press",
                publication_year=2022,
                total_copies=3,
                available_copies=3,
                category=technology,
                authors=[cormen],
            ),
            Book(
                title="Atomic Habits",
                isbn="9780735211292",
                publisher="Avery",
                publication_year=2018,
                total_copies=6,
                available_copies=6,
                category=business,
                authors=[james_clear],
            ),
            Book(
                title="Homo Deus",
                isbn="9780062464316",
                publisher="Harper",
                publication_year=2016,
                total_copies=3,
                available_copies=3,
                category=science,
                authors=[yuval],
            ),
            Book(
                title="21 Lessons for the 21st Century",
                isbn="9780525512172",
                publisher="Spiegel & Grau",
                publication_year=2018,
                total_copies=3,
                available_copies=3,
                category=science,
                authors=[yuval],
            ),
            Book(
                title="Clean Architecture",
                isbn="9780134494166",
                publisher="Prentice Hall",
                publication_year=2017,
                total_copies=4,
                available_copies=4,
                category=technology,
                authors=[robert_martin],
            ),
        ]

        db.add_all(books)
        db.flush()

        # ==========================================
        # 5. MEMBERS
        # ==========================================

        john = db.scalar(
            select(User).where(User.username == "john")
        )

        sarah = db.scalar(
            select(User).where(User.username == "sarah")
        )

        members = [
            Member(
                user_id=john.id,
                member_code="MBR-0001",
                phone="081234567890",
                address="Malang, Jawa Timur",
                membership_date=date.today(),
                status="active",
            ),
            Member(
                user_id=sarah.id,
                member_code="MBR-0002",
                phone="081298765432",
                address="Probolinggo, Jawa Timur",
                membership_date=date.today(),
                status="active",
            ),
        ]

        db.add_all(members)

        # ==========================================
        # COMMIT
        # ==========================================

        db.commit()

        print("Database seed berhasil.")

    except Exception as e:
        db.rollback()
        print("Seed gagal:")
        print(e)

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()