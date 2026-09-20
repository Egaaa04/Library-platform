import { useEffect, useState } from "react";
import {
  Menu,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Tags,
} from "lucide-react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import CategoryForm from "../components/CategoryForm";
import UserMenu from "../components/UserMenu";

function Categories({ onLogout, currentUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");

      console.log("CATEGORIES RESPONSE:", response.data);

      setCategories(response.data);
    } catch (error) {
      console.error("CATEGORIES ERROR:", error);

      setError(
        error.response?.data?.detail ||
        "Gagal mengambil data kategori."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

const handleAddCategory = async (payload) => {
  try {
    setSaving(true);

    await api.post("/categories", payload);

    setShowForm(false);

    await fetchCategories();
  } finally {
    setSaving(false);
  }
};

const handleEditCategory = async (payload) => {
  try {
    setSaving(true);

    await api.put(
      `/categories/${editingCategory.id}`,
      payload
    );

    setShowForm(false);
    setEditingCategory(null);

    await fetchCategories();
  } finally {
    setSaving(false);
  }
};

const handleDeleteCategory = async (category) => {
  const confirmed = window.confirm(
    `Yakin ingin menghapus kategori "${category.name}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setError("");

    await api.delete(
      `/categories/${category.id}`
    );

    await fetchCategories();
  } catch (error) {
    setError(
      error.response?.data?.detail ||
      "Gagal menghapus kategori."
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
            <h1>Categories</h1>
            <span>Library category management</span>
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
            <h2>Categories</h2>
            <p>
              Kelola kategori buku perpustakaan.
            </p>
          </div>

          <div className="page-actions">
            <button
              className="secondary-button"
              onClick={fetchCategories}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
                className="primary-button"
                onClick={() => {
                    setEditingCategory(null);
                    setShowForm(true);
                }}
            >
              <Plus size={18} />
              Add Category
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
              <h3>Category List</h3>
              <p>
                {categories.length} kategori terdaftar
              </p>
            </div>
          </div>

          {loading ? (
            <div className="table-state">
              <p>Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="table-state">
              <Tags size={35} />
              <p>Belum ada kategori.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.id}</td>

                      <td>
                        <div className="book-title">
                          <div className="book-icon">
                            <Tags size={17} />
                          </div>

                          <div>
                            <strong>
                              {category.name}
                            </strong>
                          </div>
                        </div>
                      </td>

                      <td>
                        {category.description || "-"}
                      </td>

                      <td>
                        {category.created_at
                          ? new Date(
                              category.created_at
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
                                setEditingCategory(category);
                                setShowForm(true);
                            }}
                            >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="icon-button delete"
                            title="Delete"
                            onClick={() => handleDeleteCategory(category)}
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
                <CategoryForm
                    onClose={() => {
                        setShowForm(false);
                        setEditingCategory(null);
                    }}
                    onSubmit={
                        editingCategory
                        ? handleEditCategory
                        : handleAddCategory
                    }
                    loading={saving}
                    editingCategory={editingCategory}
                />
            )}
    </div>
  );
}

export default Categories;