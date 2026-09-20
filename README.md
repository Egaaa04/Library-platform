# Library Platform

A web-based library management system built with React and FastAPI for managing books, members, authors, categories, loans, users, and library analytics.

## Features

* User authentication with JWT
* Role-based access for administrators and library members
* Book management
* Category management
* Author management
* Member management
* User account management
* Book loan management
* Loan status tracking
* Library collection availability
* Dashboard statistics
* Library analytics
* Responsive dashboard interface

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* Lucide React

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* PyMySQL

### Database

* MySQL / MariaDB

## Project Structure

```text
library-platform/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routers/
│   │   └── schemas/
│   ├── seed.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
│
└── README.md
```

## Requirements

Before running the project, make sure you have installed:

* Python 3.10+
* Node.js
* npm
* MySQL or MariaDB

## Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=library_platform
DB_USER=root
DB_PASSWORD=

JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

## Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## Authentication

The application uses JWT-based authentication.

Users can have different roles, including:

* Administrator
* Library Member

Administrators can manage library data, while library members can access features according to their assigned permissions.

## Main Modules

### Books

Manage book titles, ISBN, publisher, publication year, categories, authors, total copies, and available copies.

### Categories

Manage book categories used to organize the library collection.

### Authors

Manage author information and their associated books.

### Members

Manage library members and their membership information.

### Loans

Manage book borrowing transactions, due dates, return dates, quantities, and loan statuses.

### Users

Manage user accounts and their roles.

### Analytics

View library statistics such as:

* Total books
* Total members
* Active loans
* Overdue loans
* Most borrowed books
* Borrowing trends
* Active members
* Overdue books

## Environment Variables

The `.env` file contains sensitive configuration such as database credentials and JWT secrets.

It is intentionally excluded from version control through `.gitignore`.

Do not commit real credentials or secret keys to the repository.

## Development

This project is currently intended for development and learning purposes.

Future improvements may include additional reporting features, advanced search and filtering, improved user permissions, and production deployment configuration.

## License

This project is for educational and development purposes.
