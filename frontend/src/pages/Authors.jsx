import { useEffect, useState } from "react";
import {
  Menu,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  PenLine,
} from "lucide-react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import AuthorForm from "../components/AuthorForm";
import UserMenu from "../components/UserMenu";

function Authors({ onLogout, currentUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [authors, setAuthors] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/authors");

      console.log(
        "AUTHORS RESPONSE:",
        response.data
      );

      setAuthors(response.data);
    } catch (error) {
      console.error(
        "AUTHORS ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Gagal mengambil data author."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleAddAuthor = async (payload) => {
    try {
      setSaving(true);

      await api.post("/authors", payload);

      setShowForm(false);
      setEditingAuthor(null);

      await fetchAuthors();
    } finally {
      setSaving(false);
    }
  };

  const handleEditAuthor = async (payload) => {
    try {
      setSaving(true);

      await api.put(
        `/authors/${editingAuthor.id}`,
        payload
      );

      setShowForm(false);
      setEditingAuthor(null);

      await fetchAuthors();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAuthor = async (author) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus author "${author.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/authors/${author.id}`
      );

      await fetchAuthors();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Gagal menghapus author."
      );
    }
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
            <h1>Authors</h1>
            <span>
              Library author management
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
            <h2>Authors</h2>

            <p>
              Kelola data author buku perpustakaan.
            </p>
          </div>

          <div className="page-actions">
            <button
              className="secondary-button"
              onClick={fetchAuthors}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="primary-button"
              onClick={() => {
                setEditingAuthor(null);
                setShowForm(true);
              }}
            >
              <Plus size={18} />
              Add Author
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
              <h3>Author List</h3>

              <p>
                {authors.length} author terdaftar
              </p>
            </div>
          </div>

          {loading ? (
            <div className="table-state">
              <p>Loading authors...</p>
            </div>
          ) : authors.length === 0 ? (
            <div className="table-state">
              <PenLine size={35} />

              <p>
                Belum ada author.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Author</th>
                    <th>Biography</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {authors.map((author) => (
                    <tr key={author.id}>
                      <td>{author.id}</td>

                      <td>
                        <div className="book-title">
                          <div className="book-icon">
                            <PenLine size={17} />
                          </div>

                          <div>
                            <strong>
                              {author.name}
                            </strong>
                          </div>
                        </div>
                      </td>

                      <td>
                        {author.biography || "-"}
                      </td>

                      <td>
                        {author.created_at
                          ? new Date(
                              author.created_at
                            ).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button edit"
                            title="Edit"
                            onClick={() => {
                              setEditingAuthor(
                                author
                              );
                              setShowForm(true);
                            }}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="icon-button delete"
                            title="Delete"
                            onClick={() =>
                              handleDeleteAuthor(
                                author
                              )
                            }
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
        <AuthorForm
          onClose={() => {
            setShowForm(false);
            setEditingAuthor(null);
          }}
          onSubmit={
            editingAuthor
              ? handleEditAuthor
              : handleAddAuthor
          }
          loading={saving}
          editingAuthor={editingAuthor}
        />
      )}
    </div>
  );
}

export default Authors;