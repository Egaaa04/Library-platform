import { useState } from "react";
import { LogOut } from "lucide-react";

function UserMenu({ currentUser, onLogout }) {
  const [open, setOpen] = useState(false);

  const username = currentUser?.username || "User";

  const role =
    currentUser?.role === "admin"
      ? "Administrator"
      : "Library Member";

  return (
    <>
      <button
        className="navbar-user"
        onClick={() => setOpen(!open)}
      >
        <div className="user-avatar">
          {username.charAt(0).toUpperCase()}
        </div>

        <div className="user-info">
          <strong>{username}</strong>
          <span>{role}</span>
        </div>
      </button>

      {open && (
        <>
          <div
            className="user-menu-overlay"
            onClick={() => setOpen(false)}
          />

          <div className="user-menu">
            <div className="user-menu-header">
              <div className="user-avatar">
                {username.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{username}</strong>

                <span>{role}</span>
              </div>
            </div>

            <div className="user-menu-divider" />

            <button
              className="user-menu-logout"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default UserMenu;