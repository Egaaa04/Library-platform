import { Link } from "react-router-dom";

import {
  X,
  LayoutDashboard,
  BookOpen,
  Tags,
  PenLine,
  Users,
  ArrowLeftRight,
  BarChart3
} from "lucide-react";

function Sidebar({ isOpen, onClose, onLogout }) {
  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-header">
          <div>
            <h2>Library</h2>
            <span>Platform</span>
          </div>

          <button
            className="sidebar-close"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar-menu">
          <a href="/dashboard" onClick={onClose}>
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </a>

          <a href="/books" onClick={onClose}>
            <BookOpen size={19} />
            <span>Books</span>
          </a>

          <a href="/categories" onClick={onClose}>
            <Tags size={19} />
            <span>Categories</span>
          </a>

          <a href="/authors" onClick={onClose}>
            <PenLine size={19} />
            <span>Authors</span>
          </a>

          <a href="/members" onClick={onClose}>
            <Users size={19} />
            <span>Members</span>
          </a>

          <Link to="/loans">
            <BookOpen size={20} />
            <span>Loans</span>
          </Link>

          <Link to="/analytics">
            <BarChart3 size={18} />
            <span>Analytics</span>
          </Link>

          <Link to="/users">
            <Users size={19} />
            <span>Users</span>
           </Link>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;