import { useEffect, useState } from "react";

function BookForm({
  categories,
  authors,
  onClose,
  onSubmit,
  loading,
  editingBook,
}) {
  const [form, setForm] = useState({
    title: "",
    isbn: "",
    publisher: "",
    publication_year: "",
    total_copies: "",
    category_id: "",
    author_ids: [],
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (editingBook) {
      setForm({
        title: editingBook.title || "",
        isbn: editingBook.isbn || "",
        publisher: editingBook.publisher || "",
        publication_year:
          editingBook.publication_year || "",
        total_copies:
          editingBook.total_copies || "",
        category_id:
          editingBook.category_id || "",
        author_ids:
          editingBook.authors?.map(
            (author) => author.id
          ) || [],
      });
    } else {
      setForm({
        title: "",
        isbn: "",
        publisher: "",
        publication_year: "",
        total_copies: "",
        category_id: "",
        author_ids: [],
      });
    }
  }, [editingBook]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleAuthorChange = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions
    );

    const selectedIds = selectedOptions.map(
      (option) => Number(option.value)
    );

    setForm({
      ...form,
      author_ids: selectedIds,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError("Judul buku wajib diisi.");
      return;
    }

    if (!form.isbn.trim()) {
      setError("ISBN wajib diisi.");
      return;
    }

    if (!form.category_id) {
      setError("Kategori wajib dipilih.");
      return;
    }

    if (!form.total_copies) {
      setError("Jumlah stok wajib diisi.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      isbn: form.isbn.trim(),
      publisher: form.publisher.trim() || null,
      publication_year: form.publication_year
        ? Number(form.publication_year)
        : null,
      total_copies: Number(form.total_copies),
      category_id: Number(form.category_id),
      author_ids: form.author_ids,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Gagal menyimpan buku."
      );
    }
  };

  const isEditMode = Boolean(editingBook);

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
              {isEditMode ? "Edit Book" : "Add Book"}
            </h2>

            <p>
              {isEditMode
                ? "Perbarui informasi buku."
                : "Tambahkan buku baru ke koleksi perpustakaan."}
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

          <div className="form-row">
            <div className="form-group">
              <label>Title</label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Contoh: Clean Code"
              />
            </div>

            <div className="form-group">
              <label>ISBN</label>

              <input
                type="text"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                placeholder="Contoh: 9780132350884"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Publisher</label>

              <input
                type="text"
                name="publisher"
                value={form.publisher}
                onChange={handleChange}
                placeholder="Nama penerbit"
              />
            </div>

            <div className="form-group">
              <label>Publication Year</label>

              <input
                type="number"
                name="publication_year"
                value={form.publication_year}
                onChange={handleChange}
                placeholder="Contoh: 2024"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Copies</label>

              <input
                type="number"
                name="total_copies"
                min="1"
                value={form.total_copies}
                onChange={handleChange}
                placeholder="Contoh: 5"
              />
            </div>

            <div className="form-group">
              <label>Category</label>

              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
              >
                <option value="">
                  Pilih kategori
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Authors</label>

            <select
              multiple
              value={form.author_ids.map(String)}
              onChange={handleAuthorChange}
              className="author-select"
            >
              {authors.map((author) => (
                <option
                  key={author.id}
                  value={author.id}
                >
                  {author.name}
                </option>
              ))}
            </select>

            <small className="form-help">
              Tekan Ctrl + klik untuk memilih lebih
              dari satu author.
            </small>
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
                  ? "Update Book"
                  : "Save Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookForm;