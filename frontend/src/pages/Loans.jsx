import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Menu,
  Plus,
  RotateCcw,
  RefreshCw,
  Eye,
  BookOpen,
} from "lucide-react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";

function Loans({ onLogout, currentUser }) {
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loans, setLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [form, setForm] = useState({
    member_id: "",
    due_date: "",
    items: [
      {
        book_id: "",
        quantity: 1,
      },
    ],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        loansResponse,
        membersResponse,
        booksResponse,
      ] = await Promise.all([
        api.get("/loans"),
        api.get("/members"),
        api.get("/books"),
      ]);

      setLoans(loansResponse.data);
      setMembers(membersResponse.data);
      setBooks(booksResponse.data);
    } catch (error) {
      console.error(error);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg).join(", ")
        );
      } else {
        setError(
          detail || "Gagal mengambil data loans."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      member_id: "",
      due_date: "",
      items: [
        {
          book_id: "",
          quantity: 1,
        },
      ],
    });

    setError("");
  };

  const handleOpenForm = () => {
    setError("");
    setSuccess("");
    resetForm();
    setShowForm(true);
  };

  useEffect(() => {
    if (location.state?.openNewLoan) {
      handleOpenForm();

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, [location.state]);

  const handleCloseForm = () => {
    if (formLoading) return;

    setShowForm(false);
    resetForm();
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setForm({
      ...form,
      items: updatedItems,
    });
  };

  const handleAddItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          book_id: "",
          quantity: 1,
        },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    if (form.items.length === 1) return;

    const updatedItems = form.items.filter(
      (_, itemIndex) => itemIndex !== index
    );

    setForm({
      ...form,
      items: updatedItems,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.member_id) {
      setError("Member wajib dipilih.");
      return;
    }

    if (!form.due_date) {
      setError("Due date wajib diisi.");
      return;
    }

    for (const item of form.items) {
      if (!item.book_id) {
        setError("Semua buku wajib dipilih.");
        return;
      }

      if (Number(item.quantity) < 1) {
        setError("Quantity minimal 1.");
        return;
      }
    }

    const payload = {
      member_id: Number(form.member_id),
      due_date: form.due_date,
      items: form.items.map((item) => ({
        book_id: Number(item.book_id),
        quantity: Number(item.quantity),
      })),
    };

    try {
      setFormLoading(true);

      await api.post("/loans", payload);

      setSuccess("Peminjaman berhasil dibuat.");

      setShowForm(false);
      resetForm();

      await fetchData();
    } catch (error) {
      console.error(error);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg).join(", ")
        );
      } else {
        setError(
          detail || "Gagal membuat peminjaman."
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleReturn = async (loanId) => {
    const confirmed = window.confirm(
      "Apakah buku pada peminjaman ini sudah dikembalikan?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.put(`/loans/${loanId}/return`);

      setSuccess(
        "Peminjaman berhasil dikembalikan."
      );

      await fetchData();
    } catch (error) {
      console.error(error);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg).join(", ")
        );
      } else {
        setError(
          detail || "Gagal mengembalikan buku."
        );
      }
    }
  };

  const handleUpdateOverdue = async () => {
    try {
      setError("");
      setSuccess("");

      await api.put("/loans/update-overdue");

      setSuccess(
        "Status overdue berhasil diperbarui."
      );

      await fetchData();
    } catch (error) {
      console.error(error);

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail.map((item) => item.msg).join(", ")
        );
      } else {
        setError(
          detail ||
            "Gagal memperbarui status overdue."
        );
      }
    }
  };

  const getStatusClass = (status) => {
    if (status === "borrowed") {
      return "status-borrowed";
    }

    if (status === "overdue") {
      return "status-overdue";
    }

    if (status === "returned") {
      return "status-returned";
    }

    return "";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "id-ID"
    );
  };

  const getMemberName = (memberId) => {
    const member = members.find(
      (item) => item.id === memberId
    );

    if (!member) {
      return `Member #${memberId}`;
    }

    return member.member_code;
  };

  const getBookName = (bookId) => {
    const book = books.find(
      (item) => item.id === bookId
    );

    if (!book) {
      return `Book #${bookId}`;
    }

    return book.title;
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
            <h1>Loans</h1>
            <span>
              Library borrowing management
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
            <h2>Loans</h2>

            <p>
              Kelola peminjaman dan pengembalian
              buku.
            </p>
          </div>

          <div className="page-actions">
            <button
              className="secondary-button"
              onClick={handleUpdateOverdue}
            >
              <RefreshCw size={17} />
              Update Overdue
            </button>

            <button
              className="primary-button"
              onClick={handleOpenForm}
            >
              <Plus size={17} />
              Add Loan
            </button>
          </div>
        </div>

        {error && !showForm && (
          <div className="dashboard-error">
            {typeof error === "string"
              ? error
              : "Terjadi kesalahan."}
          </div>
        )}

        {success && (
          <div className="form-success">
            {success}
          </div>
        )}

        <div className="loans-card">
          <div className="loans-card-header">
            <div>
              <h3>Loan Transactions</h3>

              <p>
                {loans.length} transaksi
                peminjaman
              </p>
            </div>
          </div>

          {loading ? (
            <div className="table-state">
              <p>Loading loans...</p>
            </div>
          ) : loans.length === 0 ? (
            <div className="table-state">
              <BookOpen size={35} />

              <p>
                Belum ada data peminjaman.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="loans-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Member</th>
                    <th>Books</th>
                    <th>Loan Date</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <span className="loan-id">
                          #{loan.id}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {getMemberName(
                            loan.member_id
                          )}
                        </strong>
                      </td>

                      <td>
                        <div className="loan-books">
                          {loan.items?.map(
                            (item) => (
                              <div
                                key={item.id}
                                className="loan-book-item"
                              >
                                <span>
                                  {getBookName(
                                    item.book_id
                                  )}
                                </span>

                                <small>
                                  ×{" "}
                                  {item.quantity}
                                </small>
                              </div>
                            )
                          )}
                        </div>
                      </td>

                      <td>
                        {formatDate(
                          loan.loan_date
                        )}
                      </td>

                      <td>
                        {formatDate(
                          loan.due_date
                        )}
                      </td>

                      <td>
                        {formatDate(
                          loan.return_date
                        )}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            loan.status
                          )}`}
                        >
                          {loan.status}
                        </span>
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button"
                            title="View Detail"
                            onClick={() =>
                              setSelectedLoan(
                                loan
                              )
                            }
                          >
                            <Eye size={17} />
                          </button>

                          {(loan.status ===
                            "borrowed" ||
                            loan.status ===
                              "overdue") && (
                            <button
                              className="icon-button return"
                              title="Return"
                              onClick={() =>
                                handleReturn(
                                  loan.id
                                )
                              }
                            >
                              <RotateCcw
                                size={17}
                              />
                            </button>
                          )}
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
        <div
          className="modal-overlay"
          onClick={handleCloseForm}
        >
          <div
            className="book-form-modal loan-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>Add Loan</h2>

                <p>
                  Buat transaksi peminjaman baru.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={handleCloseForm}
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
                  {typeof error === "string"
                    ? error
                    : "Terjadi kesalahan."}
                </div>
              )}

              <div className="form-group">
                <label>Member</label>

                <select
                  name="member_id"
                  value={form.member_id}
                  onChange={handleFormChange}
                >
                  <option value="">
                    Pilih member
                  </option>

                  {members
                    .filter(
                      (member) =>
                        member.status ===
                        "active"
                    )
                    .map((member) => (
                      <option
                        key={member.id}
                        value={member.id}
                      >
                        {member.member_code}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Due Date</label>

                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label>Books</label>

                <div className="loan-form-books">
                  {form.items.map(
                    (item, index) => (
                      <div
                        className="loan-item-row"
                        key={index}
                      >
                        <select
                          value={item.book_id}
                          onChange={(event) =>
                            handleItemChange(
                              index,
                              "book_id",
                              event.target
                                .value
                            )
                          }
                        >
                          <option value="">
                            Pilih buku
                          </option>

                          {books
                            .filter(
                              (book) =>
                                book.available_copies >
                                0
                            )
                            .map((book) => (
                              <option
                                key={book.id}
                                value={book.id}
                              >
                                {book.title} —
                                Stok{" "}
                                {
                                  book.available_copies
                                }
                              </option>
                            ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            handleItemChange(
                              index,
                              "quantity",
                              event.target.value
                            )
                          }
                        />

                        {form.items.length >
                          1 && (
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() =>
                              handleRemoveItem(
                                index
                              )
                            }
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="secondary-button add-book-button"
                  onClick={handleAddItem}
                >
                  <Plus size={16} />
                  Add Another Book
                </button>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCloseForm}
                  disabled={formLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Saving..."
                    : "Save Loan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedLoan && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedLoan(null)
          }
        >
          <div
            className="book-form-modal loan-detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <h2>
                  Loan #{selectedLoan.id}
                </h2>

                <p>
                  Detail transaksi peminjaman.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedLoan(null)
                }
                type="button"
              >
                ×
              </button>
            </div>

            <div className="loan-detail">
              <div className="detail-row">
                <span>Member</span>

                <strong>
                  {getMemberName(
                    selectedLoan.member_id
                  )}
                </strong>
              </div>

              <div className="detail-row">
                <span>Loan Date</span>

                <strong>
                  {formatDate(
                    selectedLoan.loan_date
                  )}
                </strong>
              </div>

              <div className="detail-row">
                <span>Due Date</span>

                <strong>
                  {formatDate(
                    selectedLoan.due_date
                  )}
                </strong>
              </div>

              <div className="detail-row">
                <span>Return Date</span>

                <strong>
                  {formatDate(
                    selectedLoan.return_date
                  )}
                </strong>
              </div>

              <div className="detail-row">
                <span>Status</span>

                <span
                  className={`status-badge ${getStatusClass(
                    selectedLoan.status
                  )}`}
                >
                  {selectedLoan.status}
                </span>
              </div>

              <div className="loan-detail-books">
                <h3>Books</h3>

                {selectedLoan.items?.map(
                  (item) => (
                    <div
                      className="loan-detail-book"
                      key={item.id}
                    >
                      <span>
                        {getBookName(
                          item.book_id
                        )}
                      </span>

                      <strong>
                        × {item.quantity}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setSelectedLoan(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Loans;