"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, logoutUser } from "@/lib/auth";
import { validateSignup } from "@/lib/validation";

const initialForm = { name: "", email: "" };

export default function DashboardPage() {
  const router = useRouter();
  const [user] = useState(() => getSession());
  const [menuOpen, setMenuOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [actionError, setActionError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserId, setEditUserId] = useState("");
  const [modalType, setModalType] = useState("");

  useEffect(() => {
    if (!user) {
      router.replace("/signin");
    }
  }, [router, user]);

  useEffect(() => {
    if (user) loadUsers(page);
  }, [page, user, searchQuery]);

  async function loadUsers(targetPage) {
    setLoading(true);
    setActionError("");
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: "5",
        q: searchQuery,
      });
      const endpoint = searchQuery ? `/api/users/search?${params.toString()}` : `/api/users?${params.toString()}`;
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json();
      if (!data.ok) {
        setActionError(data.message || "Failed to load users.");
        return;
      }
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setActionError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  function onSearchSubmit(event) {
    event.preventDefault();
    const normalized = searchInput.trim();
    setPage(1);
    setSearchQuery(normalized);
  }

  function onClearSearch() {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  }

  function onFormChange(event) {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setActionError("");
  }

  function clearForm() {
    setFormValues(initialForm);
    setFormErrors({});
    setEditUserId("");
  }

  function closeModal() {
    setModalType("");
    clearForm();
    setSelectedUser(null);
  }

  async function onSubmit(event) {
    event.preventDefault();
    const errors = validateSignup({ ...formValues, password: "123456" });
    if (errors.name || errors.email) {
      setFormErrors({ name: errors.name, email: errors.email });
      return;
    }

    const method = editUserId ? "PUT" : "POST";
    const url = editUserId ? `/api/users/${editUserId}` : "/api/users";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      const data = await response.json();
      if (!data.ok) {
        if (data.errors) setFormErrors(data.errors);
        setActionError(data.message || "Failed to save user.");
        return;
      }
      const wasEdit = Boolean(editUserId);
      clearForm();
      if (wasEdit && selectedUser?._id === editUserId) {
        setSelectedUser(data.item);
      }
      setModalType("");
      await loadUsers(page);
    } catch {
      setActionError("Failed to save user.");
    }
  }

  async function onView(id) {
    setActionError("");
    try {
      const response = await fetch(`/api/users/${id}`, { cache: "no-store" });
      const data = await response.json();
      if (!data.ok) {
        setActionError(data.message || "Failed to load user.");
        return;
      }
      setSelectedUser(data.item);
      setModalType("view");
    } catch {
      setActionError("Failed to load user.");
    }
  }

  function onEdit(item) {
    setEditUserId(item._id);
    setFormValues({ name: item.name, email: item.email });
    setSelectedUser(item);
    setFormErrors({});
    setActionError("");
    setModalType("edit");
  }

  function onOpenAddModal() {
    clearForm();
    setSelectedUser(null);
    setActionError("");
    setModalType("add");
  }

  async function onDelete(id) {
    const ok = window.confirm("Delete this user?");
    if (!ok) return;

    setActionError("");
    try {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!data.ok) {
        setActionError(data.message || "Failed to delete user.");
        return;
      }

      if (selectedUser?._id === id) setSelectedUser(null);
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
        return;
      }
      await loadUsers(page);
    } catch {
      setActionError("Failed to delete user.");
    }
  }

  function onLogout() {
    logoutUser();
    router.replace("/signin");
  }

  if (!user) return null;

  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="subtext">Manage users with CRUD and pagination.</p>
          </div>
          <div className="profile-menu">
            <button
              type="button"
              className="profile-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="user-avatar">{user.name?.charAt(0).toUpperCase()}</span>
              <span>{user.name}</span>
            </button>
            {menuOpen && (
              <div className="profile-dropdown">
                <p>{user.email}</p>
                <button
                  type="button"
                  className="dropdown-logout-btn"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="dashboard-card users-card">
          <div className="users-title-row">
            <h2>User List</h2>
            <button type="button" className="small-btn" onClick={onOpenAddModal}>
              Add User
            </button>
          </div>

          <form className="search-bar" onSubmit={onSearchSubmit}>
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="submit" className="small-btn">
              Search
            </button>
            {searchQuery && (
              <button type="button" className="small-btn secondary-btn" onClick={onClearSearch}>
                Clear
              </button>
            )}
          </form>

          {actionError && <div className="error-box">{actionError}</div>}

          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3">Loading...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="3">No users found.</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td className="row-actions">
                        <button type="button" className="small-btn" onClick={() => onView(item._id)}>
                          View
                        </button>
                        <button type="button" className="small-btn" onClick={() => onEdit(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="small-btn danger-btn"
                          onClick={() => onDelete(item._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </section>
      </div>

      {modalType && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === "add" && "Add User"}
                {modalType === "edit" && "Edit User"}
                {modalType === "view" && "View User"}
              </h3>
              <button type="button" className="icon-close-btn" onClick={closeModal}>
                X
              </button>
            </div>

            {modalType === "view" && selectedUser && (
              <div className="view-box">
                <p>
                  <strong>Name:</strong> {selectedUser.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
              </div>
            )}

            {(modalType === "add" || modalType === "edit") && (
              <form onSubmit={onSubmit} className="user-form">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={formValues.name} onChange={onFormChange} />
                {formErrors.name && <span className="error">{formErrors.name}</span>}

                <label htmlFor="email">Email</label>
                <input id="email" name="email" value={formValues.email} onChange={onFormChange} />
                {formErrors.email && <span className="error">{formErrors.email}</span>}

                {actionError && <div className="error-box">{actionError}</div>}

                <div className="inline-actions">
                  <button type="submit" className="modal-primary-btn">
                    {modalType === "edit" ? "Update" : "Add User"}
                  </button>
                  <button type="button" className="modal-secondary-btn" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
