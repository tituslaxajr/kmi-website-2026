"use client"
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Save, MapPin, Search, Users } from "lucide-react";
import { getPartners, savePartner, deletePartner } from "../../lib/api";
import { AdminImagePicker } from "../../components/admin/AdminImagePicker";
import type { Partner } from "../../data/mockData";

const emptyPartner: Partial<Partner> = {
  church_name: "",
  pastor_name: "",
  location: "",
  mission_statement: "",
  bio: "",
  image: "",
};

const inputClass = "w-full px-4 py-3.5 rounded-xl bg-field-sand/50 text-ink focus:outline-none focus:ring-2 focus:ring-harvest-gold/40 border border-transparent focus:border-harvest-gold/20 transition-all";
const labelStyle = { fontSize: "0.8125rem" as const, fontWeight: 700 as const };

export function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Partner> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { loadPartners(); }, []);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const data = await getPartners();
      setPartners(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load partners:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editing?.church_name?.trim()) return;
    setSaving(true);
    try {
      await savePartner(editing);
      setEditing(null);
      await loadPartners();
    } catch (e: any) {
      alert("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    setDeleting(id);
    try {
      await deletePartner(id);
      await loadPartners();
    } catch (e: any) {
      alert("Failed to delete: " + e.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = partners.filter((p) =>
    !searchQuery || p.church_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.pastor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 1.875rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>Partners</h1>
          <p className="text-slate-text mt-1" style={{ fontSize: "0.875rem" }}>Manage local church partners and pastors.</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyPartner })}
          className="bg-harvest-gold text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-harvest-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
          style={{ fontSize: "0.8125rem", fontWeight: 700 }}
        >
          <Plus size={16} /> New Partner
        </button>
      </div>

      {/* Search bar */}
      {!loading && partners.length > 0 && (
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-text/30 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-ink placeholder:text-slate-text/35 focus:outline-none focus:ring-2 focus:ring-harvest-gold/25 border border-mist/30 focus:border-harvest-gold/20 transition-all"
            placeholder="Search partners..."
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
                <h2 className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 700 }}>
                  {editing.id ? "Edit Partner" : "New Partner"}
                </h2>
                <button onClick={() => setEditing(null)} className="text-slate-text hover:text-covenant-navy cursor-pointer p-1.5 rounded-lg hover:bg-field-sand/60 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>Church Name *</label>
                  <input
                    type="text" value={editing.church_name || ""}
                    onChange={(e) => setEditing({ ...editing, church_name: e.target.value })}
                    className={inputClass}
                    placeholder="Church name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-covenant-navy mb-2" style={labelStyle}>Pastor Name</label>
                    <input
                      type="text" value={editing.pastor_name || ""}
                      onChange={(e) => setEditing({ ...editing, pastor_name: e.target.value })}
                      className={inputClass}
                      placeholder="Pastor name"
                    />
                  </div>
                  <div>
                    <label className="block text-covenant-navy mb-2" style={labelStyle}>Location</label>
                    <input
                      type="text" value={editing.location || ""}
                      onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                      className={inputClass}
                      placeholder="City, Province"
                    />
                  </div>
                </div>
                <div>
                  <AdminImagePicker
                    value={editing.image || ""}
                    onChange={(url) => setEditing({ ...editing, image: url })}
                    label="Partner Image"
                  />
                </div>
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>Mission Statement</label>
                  <textarea
                    value={editing.mission_statement || ""}
                    onChange={(e) => setEditing({ ...editing, mission_statement: e.target.value })}
                    rows={2}
                    className={inputClass + " resize-none"}
                    placeholder="Mission statement"
                  />
                </div>
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>Bio</label>
                  <textarea
                    value={editing.bio || ""}
                    onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                    rows={4}
                    className={inputClass + " resize-none"}
                    placeholder="Partner biography..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-mist/20">
                <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl text-slate-text hover:bg-field-sand/60 transition-all cursor-pointer" style={{ fontSize: "0.8125rem" }}>Cancel</button>
                <button
                  onClick={handleSave} disabled={saving || !editing.church_name?.trim()}
                  className="bg-covenant-navy text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-covenant-navy/15 transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  style={{ fontSize: "0.8125rem", fontWeight: 700 }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "Saving..." : "Save Partner"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partners List */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-harvest-gold" /></div>
      ) : partners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-mist/25 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-field-sand/60 flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-slate-text/25" />
          </div>
          <p className="text-covenant-navy mb-1" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>No partners yet</p>
          <p className="text-slate-text" style={{ fontSize: "0.8125rem" }}>Create one or seed the database from the Dashboard.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((partner) => (
            <div key={partner.id} className="bg-white rounded-2xl border border-mist/25 p-5 flex items-center gap-5 hover:border-mist/40 hover:shadow-md hover:shadow-covenant-navy/[0.02] transition-all duration-300">
              {partner.image ? (
                <img src={partner.image} alt={partner.name || 'Partner photo'} className="w-14 h-14 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-field-sand/60 flex items-center justify-center shrink-0">
                  <Users size={18} className="text-slate-text/30" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-covenant-navy truncate" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>{partner.church_name}</h3>
                <p className="text-slate-text truncate" style={{ fontSize: "0.8125rem" }}>{partner.pastor_name}</p>
                {partner.location && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={11} className="text-harvest-gold/60" />
                    <span className="text-slate-text/60" style={{ fontSize: "0.75rem" }}>{partner.location}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => setEditing({ ...partner })} className="p-2.5 rounded-xl hover:bg-field-sand/60 text-slate-text/40 hover:text-covenant-navy transition-all cursor-pointer">
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(partner.id)} disabled={deleting === partner.id}
                  className="p-2.5 rounded-xl hover:bg-mission-red/5 text-slate-text/40 hover:text-mission-red transition-all cursor-pointer disabled:opacity-50"
                >
                  {deleting === partner.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && searchQuery && (
            <div className="bg-white rounded-2xl border border-mist/25 p-8 text-center">
              <p className="text-slate-text" style={{ fontSize: "0.8125rem" }}>No partners match &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}