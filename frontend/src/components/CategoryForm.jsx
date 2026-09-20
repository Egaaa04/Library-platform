import { useEffect, useState } from "react";

function CategoryForm({
  onClose,
  onSubmit,
  loading,
  editingCategory,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name || "",
        description:
          editingCategory.description || "",
      });
    } else {
      setForm({
        name: "",
        description: "",
      });
    }
  }, [editingCategory]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description:
        form.description.trim() || null,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Gagal menyimpan kategori."
      );
    }
  };

  const isEditMode = Boolean(editingCategory);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="book-form-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <h2>
              {isEditMode
                ? "Edit Category"
                : "Add Category"}
            </h2>

            <p>
              {isEditMode
                ? "Perbarui informasi kategori."
                : "Tambahkan kategori baru."}
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form
          className="book-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Technology"
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Deskripsi kategori"
              rows="4"
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEditMode
                  ? "Update Category"
                  : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryForm;