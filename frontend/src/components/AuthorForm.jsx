import { useEffect, useState } from "react";

function AuthorForm({
  onClose,
  onSubmit,
  loading,
  editingAuthor,
}) {
  const [form, setForm] = useState({
    name: "",
    biography: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (editingAuthor) {
      setForm({
        name: editingAuthor.name || "",
        biography: editingAuthor.biography || "",
      });
    } else {
      setForm({
        name: "",
        biography: "",
      });
    }
  }, [editingAuthor]);

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
      setError("Nama author wajib diisi.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      biography: form.biography.trim() || null,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Gagal menyimpan author."
      );
    }
  };

  const isEditMode = Boolean(editingAuthor);

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
                ? "Edit Author"
                : "Add Author"}
            </h2>

            <p>
              {isEditMode
                ? "Perbarui informasi author."
                : "Tambahkan author baru."}
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
              placeholder="Contoh: Robert C. Martin"
            />
          </div>

          <div className="form-group">
            <label>Biography</label>

            <textarea
              name="biography"
              value={form.biography}
              onChange={handleChange}
              placeholder="Biografi author"
              rows="5"
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
                  ? "Update Author"
                  : "Save Author"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthorForm;