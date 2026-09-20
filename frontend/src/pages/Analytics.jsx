import { useEffect, useState } from "react";
import {
  Menu,
  BookOpen,
  Users,
  BookMarked,
  AlertTriangle,
  Library,
  TrendingUp,
} from "lucide-react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";

function Analytics({ onLogout, currentUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [summary, setSummary] = useState({
    total_titles: 0,
    total_copies: 0,
    available_copies: 0,
    total_members: 0,
    active_loans: 0,
    overdue_loans: 0,
  });

  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [borrowingTrends, setBorrowingTrends] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        mostBorrowedResponse,
        trendsResponse,
        activeMembersResponse,
        overdueBooksResponse,
      ] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/analytics/most-borrowed"),
        api.get("/analytics/borrowing-trends"),
        api.get("/analytics/active-members"),
        api.get("/analytics/overdue-books"),
      ]);

      setSummary(summaryResponse.data);
      setMostBorrowed(mostBorrowedResponse.data);
      setBorrowingTrends(trendsResponse.data);
      setActiveMembers(activeMembersResponse.data);
      setOverdueBooks(overdueBooksResponse.data);
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
            "Gagal mengambil data analytics."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
            <h1>Analytics</h1>
            <span>
              Library analytics and insights
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
            <h2>Analytics</h2>

            <p>
              Ringkasan dan analisis aktivitas
              perpustakaan.
            </p>
          </div>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="table-state">
            <p>Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* SUMMARY */}

            <div className="analytics-summary-grid">
              <div className="analytics-card">
                <div className="analytics-icon">
                  <BookOpen size={21} />
                </div>

                <div>
                  <span>Total Books</span>

                  <strong>
                    {summary.total_copies}
                  </strong>
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-icon">
                  <Users size={21} />
                </div>

                <div>
                  <span>Total Members</span>

                  <strong>
                    {summary.total_members}
                  </strong>
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-icon">
                  <BookMarked size={21} />
                </div>

                <div>
                  <span>Active Loans</span>

                  <strong>
                    {summary.active_loans}
                  </strong>
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-icon">
                  <AlertTriangle size={21} />
                </div>

                <div>
                  <span>Overdue Loans</span>

                  <strong>
                    {summary.overdue_loans}
                  </strong>
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-icon">
                  <Library size={21} />
                </div>

                <div>
                  <span>Available Copies</span>

                  <strong>
                    {summary.available_copies}
                  </strong>
                </div>
              </div>
            </div>

            {/* MOST BORROWED */}

            <div className="analytics-section">
              <div className="analytics-section-header">
                <div>
                  <h3>Most Borrowed Books</h3>

                  <p>
                    Buku dengan jumlah peminjaman
                    terbanyak.
                  </p>
                </div>
              </div>

              {mostBorrowed.length === 0 ? (
                <div className="table-state">
                  <p>
                    Belum ada data peminjaman.
                  </p>
                </div>
              ) : (
                <div className="analytics-list">
                  {mostBorrowed.map(
                    (book, index) => (
                      <div
                        className="analytics-list-item"
                        key={book.book_id}
                      >
                        <div className="analytics-rank">
                          {index + 1}
                        </div>

                        <div className="analytics-list-info">
                          <strong>
                            {book.title}
                          </strong>

                          <span>
                            {book.total_borrowed} kali
                            dipinjam
                          </span>
                        </div>

                        <div className="analytics-bar-container">
                          <div
                            className="analytics-bar"
                            style={{
                              width: `${
                                mostBorrowed[0]
                                  ?.total_borrowed
                                  ? (book.total_borrowed /
                                      mostBorrowed[0]
                                        .total_borrowed) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* BORROWING TRENDS */}

            <div className="analytics-section">
              <div className="analytics-section-header">
                <div>
                  <h3>Borrowing Trends</h3>

                  <p>
                    Tren jumlah peminjaman
                    berdasarkan periode.
                  </p>
                </div>

                <TrendingUp size={20} />
              </div>

              {borrowingTrends.length === 0 ? (
                <div className="table-state">
                  <p>
                    Belum ada data tren
                    peminjaman.
                  </p>
                </div>
              ) : (
                <div className="analytics-trends">
                  {borrowingTrends.map((item) => (
                <div
                    className="trend-item"
                    key={item.month}
                >
                    <div className="trend-label">
                    {new Date(`${item.month}-01`).toLocaleDateString(
                        "en-US",
                        {
                        month: "long",
                        year: "numeric",
                        }
                    )}
                    </div>

                    <div className="trend-track">
                    <div
                        className="trend-fill"
                        style={{
                        width: `${
                            Math.max(
                            item.total_loans * 10,
                            5
                            )
                        }%`,
                        }}
                    />
                    </div>

                    <strong>
                    {item.total_loans}
                    </strong>
                </div>
                ))}
                </div>
              )}
            </div>

            {/* ACTIVE MEMBERS + OVERDUE BOOKS */}

            <div className="analytics-grid-two">
              <div className="analytics-section">
                <div className="analytics-section-header">
                  <div>
                    <h3>Active Members</h3>

                    <p>
                      Member dengan aktivitas
                      peminjaman.
                    </p>
                  </div>
                </div>

                {activeMembers.length === 0 ? (
                  <div className="table-state">
                    <p>
                      Belum ada aktivitas
                      member.
                    </p>
                  </div>
                ) : (
                  <div className="analytics-simple-list">
                    {activeMembers.map(
                      (member) => (
                        <div
                          className="simple-list-item"
                          key={member.member_id}
                        >
                          <div>
                            <strong>
                            {member.member_code}
                            </strong>

                            <span>
                            {member.total_loans} kali peminjaman
                            </span>
                          </div>

                          <strong>
                            {member.total_loans}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="analytics-section">
                <div className="analytics-section-header">
                  <div>
                    <h3>Overdue Books</h3>

                    <p>
                      Buku yang belum
                      dikembalikan melewati
                      due date.
                    </p>
                  </div>
                </div>

                {overdueBooks.length === 0 ? (
                  <div className="table-state">
                    <p>
                      Tidak ada buku overdue.
                    </p>
                  </div>
                ) : (
                  <div className="analytics-simple-list">
                    {overdueBooks.map((book) => (
                        <div
                            className="simple-list-item"
                            key={book.book_id}
                        >
                            <div>
                            <strong>
                                {book.title}
                            </strong>

                            <span>
                                {book.quantity} buku belum dikembalikan
                            </span>
                            </div>

                            <span className="status-badge status-overdue">
                            Overdue
                            </span>
                        </div>
                        ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Analytics;