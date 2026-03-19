"use client"
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Save, Play, Search, Film } from "lucide-react";
import { getMedia, saveMedia, deleteMedia } from "../../lib/api";
import type { MediaItem } from "../../data/mockData";

const MEDIA_CATEGORIES = ["Documentary", "Field Report", "Worship", "Testimony", "Event"];

const emptyMedia: Partial<MediaItem> = {
  title: "",
  youtube_url: "",
  category: "Documentary",
  thumbnail: "",
};

const inputClass = "w-full px-4 py-3.5 rounded-xl bg-field-sand/50 text-ink focus:outline-none focus:ring-2 focus:ring-harvest-gold/40 border border-transparent focus:border-harvest-gold/20 transition-all";
const labelStyle = { fontSize: "0.8125rem" as const, fontWeight: 700 as const };

export function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<MediaItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { loadMedia(); }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await getMedia();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load media:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editing?.title?.trim()) return;
    setSaving(true);
    try {
      await saveMedia(editing);
      setEditing(null);
      await loadMedia();
    } catch (e: any) {
      alert("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media item?")) return;
    setDeleting(id);
    try {
      await deleteMedia(id);
      await loadMedia();
    } catch (e: any) {
      alert("Failed to delete: " + e.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = items.filter((item) =>
    !searchQuery ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 1.875rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>Media</h1>
          <p className="text-slate-text mt-1" style={{ fontSize: "0.875rem" }}>Manage videos, documentaries, and media content.</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyMedia })}
          className="bg-harvest-gold text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-harvest-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
          style={{ fontSize: "0.8125rem", fontWeight: 700 }}
        >
          <Plus size={16} /> New Media
        </button>
      </div>

      {/* Search */}
      {!loading && items.length > 0 && (
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-text/30 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-ink placeholder:text-slate-text/35 focus:outline-none focus:ring-2 focus:ring-harvest-gold/25 border border-mist/30 focus:border-harvest-gold/20 transition-all"
            placeholder="Search media..."
            style={{ fontSize: "0.875rem" }}
          />
        </div>
      )}

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 bg-covenant-navy/30 backdrop-blur-sm z-50">
          <div className="relative w-full h-full overflow-y-auto flex items-start justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 border border-mist/20">
              <div className="flex items-center justify-between p-6 border-b border-mist/20">
                <h2 className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 700 }}>
                  {editing.id ? "Edit Media" : "New Media"}
                </h2>
                <button onClick={() => setEditing(null)} className="text-slate-text hover:text-covenant-navy cursor-pointer p-1.5 rounded-lg hover:bg-field-sand/60 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>Title *</label>
                  <input type="text" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className={inputClass} placeholder="Video title" />
                </div>
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>YouTube URL</label>
                  <input type="url" value={editing.youtube_url || ""} onChange={(e) => setEditing({ ...editing, youtube_url: e.target.value })}
                    className={inputClass} placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>Thumbnail URL</label>
                  <input type="url" value={editing.thumbnail || ""} onChange={(e) => setEditing({ ...editing, thumbnail: e.target.value })}
                    className={inputClass} placeholder="https://images.unsplash.com/..." />
                </div>
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>Category</label>
                  <select value={editing.category || "Documentary"} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className={inputClass}>
                    {MEDIA_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-mist/20">
                <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl text-slate-text hover:bg-field-sand/60 transition-all cursor-pointer" style={{ fontSize: "0.8125rem" }}>Cancel</button>
                <button onClick={handleSave} disabled={saving || !editing.title?.trim()}
                  className="bg-covenant-navy text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-covenant-navy/15 transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "Saving..." : "Save Media"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-harvest-gold" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-mist/25 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-field-sand/60 flex items-center justify-center mx-auto mb-4">
            <Film size={24} className="text-slate-text/25" />
          </div>
          <p className="text-covenant-navy mb-1" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>No media items yet</p>
          <p className="text-slate-text" style={{ fontSize: "0.8125rem" }}>Create one or seed the database from the Dashboard.</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-mist/25 overflow-hidden hover:border-mist/40 hover:shadow-md hover:shadow-covenant-navy/[0.02] transition-all duration-300 group">
                <div className="relative aspect-video">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title || item.type || 'Media thumbnail'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-field-sand/60 flex items-center justify-center">
                      <Play size={28} className="text-slate-text/20" />
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5 bg-covenant-navy/80 text-white px-2.5 py-0.5 rounded-lg backdrop-blur-sm" style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.02em" }}>
                    {item.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-covenant-navy truncate mb-2.5" style={{ fontSize: "0.875rem", fontWeight: 700 }}>{item.title}</h3>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setEditing({ ...item })} className="p-2 rounded-lg hover:bg-field-sand/60 text-slate-text/40 hover:text-covenant-navy transition-all cursor-pointer">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                      className="p-2 rounded-lg hover:bg-mission-red/5 text-slate-text/40 hover:text-mission-red transition-all cursor-pointer disabled:opacity-50">
                      {deleting === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && searchQuery && (
            <div className="bg-white rounded-2xl border border-mist/25 p-8 text-center mt-4">
              <p className="text-slate-text" style={{ fontSize: "0.8125rem" }}>No media match &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}