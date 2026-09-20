import { useEffect, useState } from "react";
import {
  Menu,
  Plus,
  Users as UsersIcon,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import UserForm from "../components/UserForm";
import UserMenu from "../components/UserMenu";

function Users({ onLogout, currentUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");

      setUsers(response.data);
    } catch (error) {
      console.error(error);

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
            "Gagal mengambil data users."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (payload) => {
    try {
      setSaving(true);

      await api.post("/users", payload);

      setShowForm(false);

      await fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = async (payload) => {
    try {
      setSaving(true);

      await api.put(
        `/users/${editingUser.id}`,
        payload
      );

      setShowForm(false);
      setEditingUser(null);

      await fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus user "${user.username}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/users/${user.id}`);

      await fetchUsers();
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
            "Gagal menghapus user."
        );
      }
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
            <h1>Users</h1>

            <span>
              User account management
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
            <h2>Users</h2>

            <p>
              Kelola akun pengguna sistem
              perpustakaan.
            </p>
          </div>

          <div className="page-actions">
            <button
              className="secondary-button"
              onClick={fetchUsers}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="primary-button"
              onClick={() => {
                setEditingUser(null);
                setShowForm(true);
              }}
            >
              <Plus size={18} />
              Add User
            </button>
          </div>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <div className="users-card">
          <div className="users-card-header">
            <div>
              <h3>User Accounts</h3>

              <p>
                {users.length} user terdaftar
              </p>
            </div>
          </div>

          {loading ? (
            <div className="table-state">
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="table-state">
              <UsersIcon size={35} />

              <p>
                Belum ada user.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-table-info">
                          <div className="user-table-avatar">
                            {user.username
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {user.username}
                            </strong>

                            <span>
                              ID #{user.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {user.email}
                      </td>

                      <td>
                        <span
                          className={`user-role ${
                            user.role === "admin"
                              ? "user-role-admin"
                              : "user-role-member"
                          }`}
                        >
                          {user.role === "admin"
                            ? "Administrator"
                            : "Library Member"}
                        </span>
                      </td>

                      <td>
                        {user.created_at
                          ? new Date(
                              user.created_at
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
                              setEditingUser(user);
                              setShowForm(true);
                            }}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="icon-button delete"
                            title="Delete"
                            onClick={() =>
                              handleDeleteUser(user)
                            }
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
        <UserForm
          onClose={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          onSubmit={
            editingUser
              ? handleEditUser
              : handleAddUser
          }
          loading={saving}
          editingUser={editingUser}
        />
      )}
    </div>
  );
}

export default Users;