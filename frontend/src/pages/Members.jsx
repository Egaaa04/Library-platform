import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Menu,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Users,
} from "lucide-react";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import MemberForm from "../components/MemberForm";
import UserMenu from "../components/UserMenu";

function Members({ onLogout, currentUser }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [editingMember, setEditingMember] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        membersResponse,
        usersResponse,
      ] = await Promise.all([
        api.get("/members"),
        api.get("/users"),
      ]);

      console.log(
        "MEMBERS RESPONSE:",
        membersResponse.data
      );

      console.log(
        "USERS RESPONSE:",
        usersResponse.data
      );

      setMembers(membersResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error(
        "MEMBERS ERROR:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Gagal mengambil data member."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (location.state?.openAddMember) {
      setEditingMember(null);
      setShowForm(true);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, [location.state]);

  const handleAddMember = async (payload) => {
    try {
      setSaving(true);

      await api.post("/members", payload);

      setShowForm(false);
      setEditingMember(null);

      await fetchMembers();
    } finally {
      setSaving(false);
    }
  };

  const handleEditMember = async (payload) => {
    try {
      setSaving(true);

      await api.put(
        `/members/${editingMember.id}`,
        payload
      );

      setShowForm(false);
      setEditingMember(null);

      await fetchMembers();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (member) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus member "${member.member_code}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/members/${member.id}`
      );

      await fetchMembers();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Gagal menghapus member."
      );
    }
  };

  const getUser = (userId) => {
    return users.find(
      (user) => user.id === userId
    );
  };

  return (
    <div className="dashboard-page">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        onLogout={onLogout}
      />

      <header className="dashboard-navbar">
        <div className="navbar-left">
          <button
            className="menu-button"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            <Menu size={22} />
          </button>

          <div>
            <h1>Members</h1>

            <span>
              Library member management
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
            <h2>Members</h2>

            <p>
              Kelola data anggota perpustakaan.
            </p>
          </div>

          <div className="page-actions">
            <button
              className="secondary-button"
              onClick={fetchMembers}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="primary-button"
              onClick={() => {
                setEditingMember(null);
                setShowForm(true);
              }}
            >
              <Plus size={18} />
              Add Member
            </button>
          </div>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <div className="books-card">
          <div className="books-card-header">
            <div>
              <h3>Member List</h3>

              <p>
                {members.length} member terdaftar
              </p>
            </div>
          </div>

          {loading ? (
            <div className="table-state">
              <p>
                Loading members...
              </p>
            </div>
          ) : members.length === 0 ? (
            <div className="table-state">
              <Users size={35} />

              <p>
                Belum ada member.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="books-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Membership Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {members.map((member) => {
                    const user = getUser(
                      member.user_id
                    );

                    return (
                      <tr
                        key={member.id}
                      >
                        <td>
                          <div className="book-title">
                            <div className="book-icon">
                              <Users size={17} />
                            </div>

                            <div>
                              <strong>
                                {
                                  member.member_code
                                }
                              </strong>

                              <span>
                                {member.address ||
                                  "Alamat tidak tersedia"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div>
                            <strong>
                              {user?.username ||
                                "-"}
                            </strong>

                            <br />

                            <span>
                              {user?.email ||
                                "-"}
                            </span>
                          </div>
                        </td>

                        <td>
                          {member.phone ||
                            "-"}
                        </td>

                        <td>
                          {member.membership_date
                            ? new Date(
                                member.membership_date
                              ).toLocaleDateString(
                                "id-ID"
                              )
                            : "-"}
                        </td>

                        <td>
                          <span
                            className={
                              member.status ===
                              "active"
                                ? "stock-available"
                                : "stock-empty"
                            }
                          >
                            {member.status}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              className="icon-button edit"
                              title="Edit"
                              onClick={() => {
                                setEditingMember(
                                  member
                                );

                                setShowForm(
                                  true
                                );
                              }}
                            >
                              <Pencil
                                size={16}
                              />
                            </button>

                            <button
                              className="icon-button delete"
                              title="Delete"
                              onClick={() =>
                                handleDeleteMember(
                                  member
                                )
                              }
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <MemberForm
          users={users}
          onClose={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
          onSubmit={
            editingMember
              ? handleEditMember
              : handleAddMember
          }
          loading={saving}
          editingMember={editingMember}
        />
      )}
    </div>
  );
}

export default Members;