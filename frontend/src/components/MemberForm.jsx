import { useEffect, useState } from "react";

function MemberForm({
  users,
  onClose,
  onSubmit,
  loading,
  editingMember,
}) {
  const [form, setForm] = useState({
    user_id: "",
    member_code: "",
    phone: "",
    address: "",
    membership_date: "",
    status: "active",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (editingMember) {
      setForm({
        user_id: editingMember.user_id || "",
        member_code:
          editingMember.member_code || "",
        phone: editingMember.phone || "",
        address: editingMember.address || "",
        membership_date:
          editingMember.membership_date || "",
        status: editingMember.status || "active",
      });
    } else {
      setForm({
        user_id: "",
        member_code: "",
        phone: "",
        address: "",
        membership_date: "",
        status: "active",
      });
    }
  }, [editingMember]);

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

    if (!form.user_id) {
      setError("User wajib dipilih.");
      return;
    }

    if (!form.member_code.trim()) {
      setError("Member code wajib diisi.");
      return;
    }

    const payload = {
      user_id: Number(form.user_id),
      member_code: form.member_code.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      membership_date:
        form.membership_date || null,
      status: form.status,
    };

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
            "Gagal menyimpan member."
        );
        }
    }
  };

  const isEditMode = Boolean(editingMember);

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
                ? "Edit Member"
                : "Add Member"}
            </h2>

            <p>
              {isEditMode
                ? "Perbarui informasi member."
                : "Tambahkan member baru."}
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
              <label>User</label>

              <select
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                disabled={isEditMode}
              >
                <option value="">
                  Pilih user
                </option>

                {users.map((user) => (
                  <option
                    key={user.id}
                    value={user.id}
                  >
                    {user.username} — {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Member Code</label>

              <input
                type="text"
                name="member_code"
                value={form.member_code}
                onChange={handleChange}
                placeholder="Contoh: MBR-0003"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Contoh: 08123456789"
              />
            </div>

            <div className="form-group">
              <label>Membership Date</label>

              <input
                type="date"
                name="membership_date"
                value={form.membership_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Alamat member"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
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
                  ? "Update Member"
                  : "Save Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MemberForm;