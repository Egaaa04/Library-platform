import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  Menu,
  Plus,
  BookOpen,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import BookForm from "../components/BookForm";
import UserMenu from "../components/UserMenu";

function Books({ onLogout, currentUser }) {
    console.log("BOOKS PAGE TERBUKA");
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBooks = async () => {
    console.log("FETCH BOOKS DIPANGGIL")
    try {
        setLoading(true);
        setError("");

        const [
        booksResponse,
        categoriesResponse,
        authorsResponse,
        ] = await Promise.all([
        api.get("/books"),
        api.get("/categories"),
        api.get("/authors"),
        ]);

        console.log("BOOKS RESPONSE:", booksResponse.data);

        setBooks(booksResponse.data);
        setCategories(categoriesResponse.data);
        setAuthors(authorsResponse.data);
    } catch (error) {
        console.error(error);

        setError(
        error.response?.data?.detail ||
        "Gagal mengambil data buku."
        );
    } finally {
        setLoading(false);
    }
    };
  
    useEffect(() => {
        fetchBooks();
        }, []);

    useEffect(() => {
      if (location.state?.openAddBook) {
        setEditingBook(null);
        setShowForm(true);

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }, [location.state]);

  const handleAddBook = async (payload) => {
    try {
        setSaving(true);

        await api.post("/books", payload);

        setShowForm(false);

        await fetchBooks();
    } finally {
        setSaving(false);
    }
    };
  
  const handleEditBook = async (payload) => {
    try {
        setSaving(true);

        await api.put(
        `/books/${editingBook.id}`,
        payload
        );

        setShowForm(false);
        setEditingBook(null);

        await fetchBooks();
    } finally {
        setSaving(false);
    }
    };

  const handleDeleteBook = async (book) => {
    const confirmed = window.confirm(
        `Yakin ingin menghapus buku "${book.title}"?`
    );

    if (!confirmed) {
        return;
    }

    try {
        setError("");

        await api.delete(`/books/${book.id}`);

        await fetchBooks();
    } catch (error) {
        setError(
        error.response?.data?.detail ||
        "Gagal menghapus buku."
        );
    }
    };

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category?.name || "-";
  };

  return (
    <div className="dashboard-page">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />

      <header className="dashboard-navbar">
        <div className="navbar-left">
          <button
            className="menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div>
            <h1>Books</h1>
            <span>
              Library collection management
            </span>
          </div>
        </div>

        <UserMenu
          currentUser={currentUser}
          onLogout={onLogout}
        />
      </header>

      <main className="dashboard-content">
        <div className="page-heading">
          <div>
            <h2>Books</h2>

            <p>
              Kelola koleksi buku perpustakaan.
            </p>
          </div>

          <div className="page-actions">
            <button
              className="secondary-button"
              onClick={fetchBooks}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
            className="primary-button"
            onClick={() => setShowForm(true)}
            >
            <Plus size={18} />
            Add Book
            </button>
          </div>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <div className="books-card">
          <div className="books-card-header">
            <div>
              <h3>Book Collection</h3>

              <p>
                {books.length} buku terdaftar
              </p>
            </div>
          </div>

          {loading ? (
            <div className="table-state">
              <p>Loading books...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="table-state">
              <BookOpen size={35} />

              <p>
                Belum ada buku.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>ISBN</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Year</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td>
                        <div className="book-title">
                          <div className="book-icon">
                            <BookOpen size={17} />
                          </div>

                          <div>
                            <strong>
                              {book.title}
                            </strong>

                            <span>
                              {book.publisher ||
                                "Publisher tidak tersedia"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {book.isbn || "-"}
                      </td>

                      <td>
                        <span className="category-badge">
                          {getCategoryName(
                            book.category_id
                          )}
                        </span>
                      </td>

                      <td>
                        {book.authors?.length > 0
                          ? book.authors
                              .map(
                                (author) =>
                                  author.name
                              )
                              .join(", ")
                          : "-"}
                      </td>

                      <td>
                        {book.publication_year || "-"}
                      </td>

                      <td>
                        <span
                          className={
                            book.available_copies > 0
                              ? "stock-available"
                              : "stock-empty"
                          }
                        >
                          {book.available_copies} /{" "}
                          {book.total_copies}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button edit"
                            title="Edit"
                            onClick={() => {
                                setEditingBook(book);
                                setShowForm(true);
                            }}
                            >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="icon-button delete"
                            title="Delete"
                            onClick={() => handleDeleteBook(book)}
                            >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
            </main>

      {showForm && (
        <BookForm
            categories={categories}
            authors={authors}
            onClose={() => {
                setShowForm(false);
                setEditingBook(null);
            }}
            onSubmit={
                editingBook
                ? handleEditBook
                : handleAddBook
            }
            loading={saving}
            editingBook={editingBook}
        />
      )}
    </div>
  );
}

export default Books;