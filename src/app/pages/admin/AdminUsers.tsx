"use client"
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Save,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Pencil,
  Crown,
  UserPlus,
  Users,
  Clock,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

type UserRole = "admin" | "editor" | "viewer";

const ROLE_OPTIONS: { value: UserRole; label: string; icon: React.ComponentType<any>; description: string; color: string }[] = [
  {
    value: "admin",
    label: "Admin",
    icon: ShieldAlert,
    description: "Full access to all settings, users, and content",
    color: "text-mission-red",
  },
  {
    value: "editor",
    label: "Editor",
    icon: Pencil,
    description: "Can create and edit all content, stories, and media",
    color: "text-harvest-gold",
  },
  {
    value: "viewer",
    label: "Viewer",
    icon: Eye,
    description: "Read-only access to the admin dashboard",
    color: "text-slate-text",
  },
];

const inputClass =
  "w-full px-4 py-3.5 rounded-xl bg-field-sand/50 text-ink focus:outline-none focus:ring-2 focus:ring-harvest-gold/40 border border-transparent focus:border-harvest-gold/20 transition-all";
const labelStyle: React.CSSProperties = { fontSize: "0.8125rem", fontWeight: 700 };

function roleBadgeClass(role: string): string {
  switch (role) {
    case "admin":
      return "bg-mission-red/8 text-mission-red";
    case "editor":
      return "bg-harvest-gold/10 text-harvest-gold";
    default:
      return "bg-field-sand text-slate-text";
  }
}

function roleIcon(role: string): React.ComponentType<any> {
  switch (role) {
    case "admin":
      return ShieldAlert;
    case "editor":
      return Pencil;
    default:
      return Eye;
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "Never";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr || "Never";
  }
}

export function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Create user modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "viewer" as UserRole });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit role modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("viewer");
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete state
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("Failed to load users:", e);
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.email.trim() || !createForm.password.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createUser({
        email: createForm.email.trim(),
        password: createForm.password,
        name: createForm.name.trim() || createForm.email.trim(),
        role: createForm.role,
      });
      setShowCreate(false);
      setCreateForm({ name: "", email: "", password: "", role: "viewer" });
      await loadUsers();
    } catch (e: any) {
      console.error("Create user error:", e);
      setCreateError(e.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (u: UserProfile) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditName(u.name);
    setEditError(null);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    setSaving(true);
    setEditError(null);
    try {
      await updateUser(editingUser.id, { name: editName.trim(), role: editRole });
      setEditingUser(null);
      await loadUsers();
    } catch (e: any) {
      console.error("Update user error:", e);
      setEditError(e.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: UserProfile) => {
    if (u.id === currentUser?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete ${u.name} (${u.email})? This cannot be undone.`)) return;
    setDeleting(u.id);
    try {
      await deleteUser(u.id);
      await loadUsers();
    } catch (e: any) {
      alert("Failed to delete user: " + e.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === "admin").length;
  const editorCount = users.filter((u) => u.role === "editor").length;
  const viewerCount = users.filter((u) => u.role === "viewer").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1
            className="text-covenant-navy"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.5rem, 3vw, 1.875rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Users
          </h1>
          <p className="text-slate-text mt-1" style={{ fontSize: "0.875rem" }}>
            Manage user accounts and role-based access control.
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate(true);
            setCreateError(null);
            setCreateForm({ name: "", email: "", password: "", role: "viewer" });
          }}
          className="bg-harvest-gold text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-harvest-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
          style={{ fontSize: "0.8125rem", fontWeight: 700 }}
        >
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Role summary cards */}
      {!loading && users.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-mist/25 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-mission-red/8 flex items-center justify-center shrink-0">
              <ShieldAlert size={16} className="text-mission-red" />
            </div>
            <div>
              <p className="text-covenant-navy" style={{ fontSize: "1.125rem", fontWeight: 800 }}>
                {adminCount}
              </p>
              <p className="text-slate-text/50" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>
                Admin{adminCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-mist/25 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-harvest-gold/8 flex items-center justify-center shrink-0">
              <Pencil size={16} className="text-harvest-gold" />
            </div>
            <div>
              <p className="text-covenant-navy" style={{ fontSize: "1.125rem", fontWeight: 800 }}>
                {editorCount}
              </p>
              <p className="text-slate-text/50" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>
                Editor{editorCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-mist/25 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-field-sand/60 flex items-center justify-center shrink-0">
              <Eye size={16} className="text-slate-text/40" />
            </div>
            <div>
              <p className="text-covenant-navy" style={{ fontSize: "1.125rem", fontWeight: 800 }}>
                {viewerCount}
              </p>
              <p className="text-slate-text/50" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>
                Viewer{viewerCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {!loading && users.length > 0 && (
        <div className="relative mb-5">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-text/30 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-ink placeholder:text-slate-text/35 focus:outline-none focus:ring-2 focus:ring-harvest-gold/25 border border-mist/30 focus:border-harvest-gold/20 transition-all"
            placeholder="Search by name, email, or role..."
            style={{ fontSize: "0.875rem" }}
          />
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-5 p-4 rounded-xl bg-mission-red/5 border border-mission-red/15 flex items-start gap-3">
          <AlertTriangle size={18} className="text-mission-red shrink-0 mt-0.5" />
          <div>
            <p className="text-mission-red" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
              Failed to load users
            </p>
            <p className="text-mission-red/70 mt-0.5" style={{ fontSize: "0.75rem" }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-covenant-navy/30 backdrop-blur-sm z-50">
          <div className="relative w-full h-full overflow-y-auto flex items-start justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 border border-mist/20">
              <div className="flex items-center justify-between p-6 border-b border-mist/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-harvest-gold/8 flex items-center justify-center">
                    <UserPlus size={16} className="text-harvest-gold" />
                  </div>
                  <h2
                    className="text-covenant-navy"
                    style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 700 }}
                  >
                    Add New User
                  </h2>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-slate-text hover:text-covenant-navy cursor-pointer p-1.5 rounded-lg hover:bg-field-sand/60 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {createError && (
                  <div className="p-3 rounded-xl bg-mission-red/5 border border-mission-red/15">
                    <p className="text-mission-red" style={{ fontSize: "0.8125rem" }}>
                      {createError}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Juan Dela Cruz"
                  />
                </div>
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className={inputClass}
                    placeholder="user@kapatidministry.org"
                  />
                </div>
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>
                    Password *
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className={inputClass}
                    placeholder="Minimum 6 characters"
                  />
                  <p className="text-slate-text/35 mt-1.5" style={{ fontSize: "0.6875rem" }}>
                    Share this password securely with the user. They can change it later.
                  </p>
                </div>
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>
                    Role *
                  </label>
                  <div className="space-y-2">
                    {ROLE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = createForm.role === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCreateForm({ ...createForm, role: opt.value })}
                          className={`w-full p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left flex items-start gap-3 ${
                            isActive
                              ? "border-harvest-gold/40 bg-harvest-gold/5"
                              : "border-mist/20 hover:border-mist/40 bg-white"
                          }`}
                        >
                          <div className={`mt-0.5 ${isActive ? opt.color : "text-slate-text/30"}`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className={isActive ? "text-covenant-navy" : "text-slate-text"}
                              style={{ fontSize: "0.8125rem", fontWeight: 700 }}
                            >
                              {opt.label}
                            </span>
                            <p className="text-slate-text/50 mt-0.5" style={{ fontSize: "0.6875rem", lineHeight: "1.4" }}>
                              {opt.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-mist/20">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-text hover:bg-field-sand/60 transition-all cursor-pointer"
                  style={{ fontSize: "0.8125rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !createForm.email.trim() || !createForm.password.trim()}
                  className="bg-covenant-navy text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-covenant-navy/15 transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  style={{ fontSize: "0.8125rem", fontWeight: 700 }}
                >
                  {creating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-covenant-navy/30 backdrop-blur-sm z-50">
          <div className="relative w-full h-full overflow-y-auto flex items-start justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 border border-mist/20">
              <div className="flex items-center justify-between p-6 border-b border-mist/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-covenant-navy/8 flex items-center justify-center">
                    <Shield size={16} className="text-covenant-navy" />
                  </div>
                  <h2
                    className="text-covenant-navy"
                    style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 700 }}
                  >
                    Edit User
                  </h2>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-slate-text hover:text-covenant-navy cursor-pointer p-1.5 rounded-lg hover:bg-field-sand/60 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {editError && (
                  <div className="p-3 rounded-xl bg-mission-red/5 border border-mission-red/15">
                    <p className="text-mission-red" style={{ fontSize: "0.8125rem" }}>
                      {editError}
                    </p>
                  </div>
                )}

                {/* User info */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-field-sand/30 border border-mist/15">
                  <div className="w-11 h-11 rounded-full bg-covenant-navy flex items-center justify-center shrink-0">
                    <span className="text-white" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                      {(editingUser.name || "?")
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-covenant-navy truncate" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                      {editingUser.email}
                    </p>
                    <p className="text-slate-text/50 mt-0.5" style={{ fontSize: "0.75rem" }}>
                      Joined {formatDate(editingUser.created_at)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={inputClass}
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>
                    Role
                  </label>
                  <div className="space-y-2">
                    {ROLE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = editRole === opt.value;
                      const isCurrentUserSelf = editingUser.id === currentUser?.id && opt.value !== "admin";
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditRole(opt.value)}
                          disabled={isCurrentUserSelf && editingUser.role === "admin"}
                          className={`w-full p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left flex items-start gap-3 ${
                            isActive
                              ? "border-harvest-gold/40 bg-harvest-gold/5"
                              : "border-mist/20 hover:border-mist/40 bg-white"
                          } ${isCurrentUserSelf && editingUser.role === "admin" ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          <div className={`mt-0.5 ${isActive ? opt.color : "text-slate-text/30"}`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className={isActive ? "text-covenant-navy" : "text-slate-text"}
                              style={{ fontSize: "0.8125rem", fontWeight: 700 }}
                            >
                              {opt.label}
                            </span>
                            <p className="text-slate-text/50 mt-0.5" style={{ fontSize: "0.6875rem", lineHeight: "1.4" }}>
                              {opt.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {editingUser.id === currentUser?.id && editingUser.role === "admin" && (
                    <p className="text-slate-text/40 mt-2 flex items-center gap-1.5" style={{ fontSize: "0.6875rem" }}>
                      <AlertTriangle size={12} />
                      You cannot demote yourself. Ask another admin to change your role.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-mist/20">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 rounded-xl text-slate-text hover:bg-field-sand/60 transition-all cursor-pointer"
                  style={{ fontSize: "0.8125rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="bg-covenant-navy text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-covenant-navy/15 transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  style={{ fontSize: "0.8125rem", fontWeight: 700 }}
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-harvest-gold" />
        </div>
      ) : users.length === 0 && !error ? (
        <div className="bg-white rounded-2xl border border-mist/25 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-field-sand/60 flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-slate-text/25" />
          </div>
          <p className="text-covenant-navy mb-1" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>
            No users found
          </p>
          <p className="text-slate-text mb-5" style={{ fontSize: "0.8125rem" }}>
            Create the first user to get started with role management.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-harvest-gold text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
            style={{ fontSize: "0.8125rem", fontWeight: 700 }}
          >
            <UserPlus size={16} /> Add First User
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((u) => {
            const RoleIcon = roleIcon(u.role);
            const isCurrentUser = u.id === currentUser?.id;
            return (
              <div
                key={u.id}
                className={`bg-white rounded-2xl border p-5 flex items-center gap-5 hover:shadow-md hover:shadow-covenant-navy/[0.02] transition-all duration-300 ${
                  isCurrentUser ? "border-harvest-gold/25" : "border-mist/25 hover:border-mist/40"
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-covenant-navy flex items-center justify-center shrink-0 relative">
                  <span className="text-white" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                    {(u.name || "?")
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  {isCurrentUser && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className="text-covenant-navy truncate"
                      style={{ fontSize: "0.9375rem", fontWeight: 700 }}
                    >
                      {u.name}
                    </h3>
                    {isCurrentUser && (
                      <span
                        className="shrink-0 px-2 py-0.5 rounded-md bg-green-50 text-green-600"
                        style={{ fontSize: "0.5625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}
                      >
                        You
                      </span>
                    )}
                    <span
                      className={`shrink-0 px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${roleBadgeClass(u.role)}`}
                      style={{ fontSize: "0.6875rem", fontWeight: 700 }}
                    >
                      <RoleIcon size={11} />
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-text/50" style={{ fontSize: "0.75rem" }}>
                      <Mail size={11} />
                      {u.email}
                    </span>
                    <span className="flex items-center gap-1 text-slate-text/35" style={{ fontSize: "0.6875rem" }}>
                      <Clock size={10} />
                      Last active: {formatRelative(u.last_sign_in_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(u)}
                    className="p-2.5 rounded-xl hover:bg-field-sand/60 text-slate-text/40 hover:text-covenant-navy transition-all cursor-pointer"
                    title="Edit user"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    disabled={deleting === u.id || isCurrentUser}
                    className="p-2.5 rounded-xl hover:bg-mission-red/5 text-slate-text/40 hover:text-mission-red transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title={isCurrentUser ? "Cannot delete yourself" : "Delete user"}
                  >
                    {deleting === u.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && searchQuery && (
            <div className="bg-white rounded-2xl border border-mist/25 p-8 text-center">
              <p className="text-slate-text" style={{ fontSize: "0.8125rem" }}>
                No users match &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}