import { useEffect, useState } from "react";

function UserForm({
  onClose,
  onSubmit,
  loading,
  editingUser,
}) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "member",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (editingUser) {
      setForm({
        username: editingUser.username || "",
        email: editingUser.email || "",
        password: "",
        role: editingUser.role || "member",
      });
    } else {
      setForm({
        username: "",
        email: "",
        password: "",
        role: "member",
      });
    }

    setError("");
  }, [editingUser]);

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

    if (!form.username.trim()) {
      setError("Username wajib diisi.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (!editingUser && !form.password.trim()) {
      setError("Password wajib diisi.");
      return;
    }

    const payload = {
      username: form.username.trim(),
      email: form.email.trim(),
      role: form.role,
    };

    if (form.password.trim()) {
      payload.password = form.password;
    }

    try {
      await onSubmit(payload);
    } catch (error) {
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item.msg)
            .join(", ")
        );
      } else {
        setError(
          detail ||
            "Gagal menyimpan user."
        );
      }
    }
  };

  const isEditMode = Boolean(editingUser);

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
                ? "Edit User"
                : "Add User"}
            </h2>

            <p>
              {isEditMode
                ? "Perbarui informasi akun pengguna."
                : "Tambahkan akun pengguna baru ke sistem."}
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
              <label>Username</label>

              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Contoh: budi"
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Contoh: budi@library.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={
                  isEditMode
                    ? "Kosongkan jika tidak diubah"
                    : "Masukkan password"
                }
              />
            </div>

            <div className="form-group">
              <label>Role</label>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="member">
                  Member
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>
            </div>
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
                  ? "Update User"
                  : "Save User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;