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
  Users,
  GripVertical,
  Crown,
  Star,
  UserCheck,
} from "lucide-react";
import { getTeamMembers, saveTeamMember, deleteTeamMember } from "../../lib/api";
import { AdminImagePicker } from "../../components/admin/AdminImagePicker";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  type: "memorial" | "founder" | "leadership";
  badge: string;
  death_year: string;
  order: number;
}

const TYPE_OPTIONS: { value: TeamMember["type"]; label: string; icon: React.ComponentType<any>; description: string }[] = [
  { value: "memorial", label: "In Memoriam", icon: Star, description: "Honored founder — shown with navy tribute card" },
  { value: "founder", label: "Founder", icon: Crown, description: "Co-founder — shown with side-by-side card" },
  { value: "leadership", label: "Leadership", icon: UserCheck, description: "Current team — shown in the grid" },
];

const emptyMember: Partial<TeamMember> = {
  name: "",
  role: "",
  image: "",
  bio: "",
  type: "leadership",
  badge: "",
  death_year: "",
  order: 99,
};

const inputClass =
  "w-full px-4 py-3.5 rounded-xl bg-field-sand/50 text-ink focus:outline-none focus:ring-2 focus:ring-harvest-gold/40 border border-transparent focus:border-harvest-gold/20 transition-all";
const labelStyle = { fontSize: "0.8125rem" as const, fontWeight: 700 as const };

export function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<TeamMember> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getTeamMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load team members:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editing?.name?.trim()) return;
    setSaving(true);
    try {
      await saveTeamMember(editing);
      setEditing(null);
      await loadMembers();
    } catch (e: any) {
      alert("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    setDeleting(id);
    try {
      await deleteTeamMember(id);
      await loadMembers();
    } catch (e: any) {
      alert("Failed to delete: " + e.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = members.filter(
    (m) =>
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedMembers = {
    memorial: filtered.filter((m) => m.type === "memorial"),
    founder: filtered.filter((m) => m.type === "founder"),
    leadership: filtered.filter((m) => m.type === "leadership"),
  };

  const typeLabel = (type: string) => {
    const opt = TYPE_OPTIONS.find((t) => t.value === type);
    return opt?.label || type;
  };

  const typeBadgeClass = (type: string) => {
    switch (type) {
      case "memorial":
        return "bg-covenant-navy/8 text-covenant-navy";
      case "founder":
        return "bg-harvest-gold/10 text-harvest-gold";
      default:
        return "bg-field-sand text-slate-text";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
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
            Team
          </h1>
          <p className="text-slate-text mt-1" style={{ fontSize: "0.875rem" }}>
            Manage the &ldquo;Meet Our Team&rdquo; section on the About page.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyMember })}
          className="bg-harvest-gold text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-harvest-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
          style={{ fontSize: "0.8125rem", fontWeight: 700 }}
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Search bar */}
      {!loading && members.length > 0 && (
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
            placeholder="Search team members..."
            style={{ fontSize: "0.875rem" }}
          />
        </div>
      )}

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 bg-covenant-navy/30 backdrop-blur-sm z-50">
          <div className="relative w-full h-full overflow-y-auto flex items-start justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 border border-mist/20">
              <div className="flex items-center justify-between p-6 border-b border-mist/20">
                <h2
                  className="text-covenant-navy"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                  }}
                >
                  {editing.id ? "Edit Team Member" : "New Team Member"}
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="text-slate-text hover:text-covenant-navy cursor-pointer p-1.5 rounded-lg hover:bg-field-sand/60 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Type selector */}
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>
                    Member Type *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TYPE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = editing.type === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setEditing({ ...editing, type: opt.value })}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left ${
                            isActive
                              ? "border-harvest-gold/40 bg-harvest-gold/5"
                              : "border-mist/20 hover:border-mist/40 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <Icon
                              size={14}
                              className={isActive ? "text-harvest-gold" : "text-slate-text/40"}
                            />
                            <span
                              className={isActive ? "text-covenant-navy" : "text-slate-text"}
                              style={{ fontSize: "0.8125rem", fontWeight: 700 }}
                            >
                              {opt.label}
                            </span>
                          </div>
                          <p className="text-slate-text/50" style={{ fontSize: "0.6875rem", lineHeight: "1.4" }}>
                            {opt.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-covenant-navy mb-2" style={labelStyle}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editing.name || ""}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. Titus Laxa"
                    />
                  </div>
                  <div>
                    <label className="block text-covenant-navy mb-2" style={labelStyle}>
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={editing.role || ""}
                      onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. Chief Executive Officer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-covenant-navy mb-2" style={labelStyle}>
                      Badge Label
                    </label>
                    <input
                      type="text"
                      value={editing.badge || ""}
                      onChange={(e) => setEditing({ ...editing, badge: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. Founder · In Memoriam"
                    />
                    <p className="text-slate-text/35 mt-1.5" style={{ fontSize: "0.6875rem" }}>
                      Shown as a tag above the name (founders only)
                    </p>
                  </div>
                  <div>
                    <label className="block text-covenant-navy mb-2" style={labelStyle}>
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={editing.order ?? 99}
                      onChange={(e) =>
                        setEditing({ ...editing, order: parseInt(e.target.value) || 0 })
                      }
                      className={inputClass}
                      placeholder="0"
                      min={0}
                    />
                    <p className="text-slate-text/35 mt-1.5" style={{ fontSize: "0.6875rem" }}>
                      Lower numbers appear first within their group
                    </p>
                  </div>
                </div>

                {editing.type === "memorial" && (
                  <div>
                    <label className="block text-covenant-navy mb-2" style={labelStyle}>
                      Year of Passing
                    </label>
                    <input
                      type="text"
                      value={editing.death_year || ""}
                      onChange={(e) => setEditing({ ...editing, death_year: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. 2021"
                    />
                  </div>
                )}

                <div>
                  <AdminImagePicker
                    value={editing.image || ""}
                    onChange={(url) => setEditing({ ...editing, image: url })}
                    label="Photo"
                  />
                </div>

                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>
                    Bio
                  </label>
                  <textarea
                    value={editing.bio || ""}
                    onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                    rows={3}
                    className={inputClass + " resize-none"}
                    placeholder="Short biography or description..."
                  />
                  <p className="text-slate-text/35 mt-1.5" style={{ fontSize: "0.6875rem" }}>
                    Shown on founder/memorial cards. Leadership cards show name and role only.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-mist/20">
                <button
                  onClick={() => setEditing(null)}
                  className="px-5 py-2.5 rounded-xl text-slate-text hover:bg-field-sand/60 transition-all cursor-pointer"
                  style={{ fontSize: "0.8125rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editing.name?.trim()}
                  className="bg-covenant-navy text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-covenant-navy/15 transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  style={{ fontSize: "0.8125rem", fontWeight: 700 }}
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving..." : "Save Member"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-harvest-gold" />
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-mist/25 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-field-sand/60 flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-slate-text/25" />
          </div>
          <p
            className="text-covenant-navy mb-1"
            style={{ fontSize: "0.9375rem", fontWeight: 700 }}
          >
            No team members yet
          </p>
          <p className="text-slate-text mb-5" style={{ fontSize: "0.8125rem" }}>
            Add your team and they&rsquo;ll appear on the About page.
          </p>
          <button
            onClick={() => setEditing({ ...emptyMember })}
            className="bg-harvest-gold text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
            style={{ fontSize: "0.8125rem", fontWeight: 700 }}
          >
            <Plus size={16} /> Add First Member
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {(["memorial", "founder", "leadership"] as const).map((type) => {
            const group = groupedMembers[type];
            if (group.length === 0) return null;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg ${typeBadgeClass(type)}`}
                    style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.03em" }}
                  >
                    {typeLabel(type)}
                  </span>
                  <span className="text-slate-text/30" style={{ fontSize: "0.75rem" }}>
                    {group.length} member{group.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {group.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-2xl border border-mist/25 p-5 flex items-center gap-5 hover:border-mist/40 hover:shadow-md hover:shadow-covenant-navy/[0.02] transition-all duration-300"
                    >
                      <div className="text-slate-text/15 shrink-0">
                        <GripVertical size={16} />
                      </div>
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name || 'Team member photo'}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-field-sand/60 flex items-center justify-center shrink-0">
                          <Users size={18} className="text-slate-text/30" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className="text-covenant-navy truncate"
                            style={{ fontSize: "0.9375rem", fontWeight: 700 }}
                          >
                            {member.name}
                          </h3>
                          {member.badge && (
                            <span
                              className="shrink-0 px-2 py-0.5 rounded-md bg-harvest-gold/8 text-harvest-gold"
                              style={{ fontSize: "0.625rem", fontWeight: 700 }}
                            >
                              {member.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className="text-slate-text truncate"
                          style={{ fontSize: "0.8125rem" }}
                        >
                          {member.role}
                        </p>
                        {member.bio && (
                          <p
                            className="text-slate-text/40 truncate mt-0.5"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {member.bio}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-slate-text/20"
                          style={{ fontSize: "0.6875rem" }}
                          title="Sort order"
                        >
                          #{member.order}
                        </span>
                        <button
                          onClick={() => setEditing({ ...member })}
                          className="p-2.5 rounded-xl hover:bg-field-sand/60 text-slate-text/40 hover:text-covenant-navy transition-all cursor-pointer"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          disabled={deleting === member.id}
                          className="p-2.5 rounded-xl hover:bg-mission-red/5 text-slate-text/40 hover:text-mission-red transition-all cursor-pointer disabled:opacity-50"
                        >
                          {deleting === member.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && searchQuery && (
            <div className="bg-white rounded-2xl border border-mist/25 p-8 text-center">
              <p className="text-slate-text" style={{ fontSize: "0.8125rem" }}>
                No team members match &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}