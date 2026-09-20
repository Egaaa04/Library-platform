import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Menu,
  BookOpen,
  Users,
  ArrowLeftRight,
  AlertTriangle
} from "lucide-react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";

function Dashboard({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [summary, setSummary] = useState({
  total_titles: 0,
  total_copies: 0,
  available_copies: 0,
  total_members: 0,
  active_loans: 0,
  overdue_loans: 0,
});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get(
          "/analytics/summary"
        );

        setSummary(response.data);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.detail ||
          "Gagal mengambil data dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  console.log(currentUser);

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
            <h1>Dashboard</h1>
            <span>
              Library Management & Analytics
            </span>
          </div>
        </div>

        <UserMenu
          currentUser={currentUser}
          onLogout={onLogout}
        />
      </header>

      <main className="dashboard-content">
        <div className="dashboard-heading">
          <div>
            <h2>Overview</h2>
            <p>
              Ringkasan aktivitas perpustakaan saat ini.
            </p>
          </div>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <section className="stats-grid">
          <button
            className="stat-card stat-card-clickable"
            onClick={() => navigate("/books")}
          >
            <div className="stat-icon">
              <BookOpen size={23} />
            </div>

            <div className="stat-content">
              <span>Total Books</span>

              <strong>
                {loading ? "..." : summary.total_copies}
              </strong>

              <small>
                Eksemplar dari {summary.total_titles} judul
              </small>
            </div>
          </button>

          <button
            className="stat-card stat-card-clickable"
            onClick={() => navigate("/members")}
          >
            <div className="stat-icon">
              <Users size={23} />
            </div>

            <div className="stat-content">
              <span>Total Members</span>

              <strong>
                {loading ? "..." : summary.total_members}
              </strong>

              <small>Anggota terdaftar</small>
            </div>
          </button>

          <button
            className="stat-card stat-card-clickable"
            onClick={() => navigate("/loans")}
          >
            <div className="stat-icon">
              <ArrowLeftRight size={23} />
            </div>

            <div className="stat-content">
              <span>Active Loans</span>

              <strong>
                {loading ? "..." : summary.active_loans}
              </strong>

              <small>Peminjaman aktif</small>
            </div>
          </button>

          <button
            className="stat-card stat-card-clickable"
            onClick={() => navigate("/loans")}
          >
            <div className="stat-icon">
              <AlertTriangle size={23} />
            </div>

            <div className="stat-content">
              <span>Overdue Loans</span>

              <strong>
                {loading ? "..." : summary.overdue_loans}
              </strong>

              <small>Peminjaman terlambat</small>
            </div>
          </button>
        </section>

        <section className="dashboard-bottom">
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h3>Collection Availability</h3>
                <p>Informasi ketersediaan koleksi buku.</p>
              </div>
            </div>

            <div className="availability-section">
              <div className="availability-header">
                <span>Available Copies</span>

                <strong>
                  {loading || summary.total_copies === 0
                    ? "..."
                    : `${Math.round(
                        (summary.available_copies /
                          summary.total_copies) *
                          100
                      )}%`}
                </strong>
              </div>

              <div className="availability-bar">
                <div
                  className="availability-progress"
                  style={{
                    width:
                      loading || summary.total_copies === 0
                        ? "0%"
                        : `${Math.min(
                            (summary.available_copies /
                              summary.total_copies) *
                              100,
                            100
                          )}%`,
                  }}
                />
              </div>

              <div className="availability-count">
                <strong>
                  {loading
                    ? "..."
                    : `${summary.available_copies} of ${summary.total_copies}`}
                </strong>

                <span>copies currently available</span>
              </div>

              <p>
                {loading
                  ? "Loading collection availability..."
                  : summary.available_copies ===
                    summary.total_copies
                  ? "All book copies are currently available."
                  : `${summary.total_copies -
                      summary.available_copies} copies are currently borrowed.`}
              </p>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h3>Quick Actions</h3>
                <p>
                  Akses cepat pengelolaan library.
                </p>
              </div>
            </div>

            <div className="quick-actions">
              <button
                onClick={() =>
                  navigate("/books", {
                    state: {
                      openAddBook: true,
                    },
                  })
                }
              >
                <BookOpen size={18} />
                Add Book
              </button>

              <button
                onClick={() =>
                  navigate("/members", {
                    state: {
                      openAddMember: true,
                    },
                  })
                }
              >
                <Users size={18} />
                Add Member
              </button>

              <button
                onClick={() =>
                  navigate("/loans", {
                    state: {
                      openNewLoan: true,
                    },
                  })
                }
              >
                <ArrowLeftRight size={18} />
                New Loan
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;