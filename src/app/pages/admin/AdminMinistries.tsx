"use client"
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Save, ChevronDown, ChevronUp, ExternalLink, HeartHandshake } from "lucide-react";
import { getMinistries, saveMinistry, deleteMinistry } from "../../lib/api";
import type { MinistryProgram } from "../../data/ministryData";
import { AdminImagePicker } from "../../components/admin/AdminImagePicker";
import { ministries as fallbackMinistries } from "../../data/ministryData";

const ICON_OPTIONS = ["Utensils", "GraduationCap", "HeartHandshake", "Home", "Heart", "Church", "Users", "BookOpen"];
const COLOR_OPTIONS = [
  { label: "Mission Red", value: "#C84C3D" },
  { label: "Covenant Navy", value: "#103B53" },
  { label: "Harvest Gold", value: "#D89B3C" },
  { label: "Teal", value: "#6E8A8F" },
  { label: "Earth", value: "#A65C3A" },
];

const emptyMinistry: Partial<MinistryProgram> = {
  slug: "",
  title: "",
  tagline: "",
  heroImage: "",
  cardImage: "",
  icon: "HeartHandshake",
  color: "#C84C3D",
  goalText: "",
  description: "",
  subPrograms: [{ title: "", description: "" }],
  howToSupport: { intro: "", steps: [""], note: "" },
  scripture: { text: "", reference: "" },
  giveFundId: "general",
};

export function AdminMinistries() {
  const [ministries, setMinistries] = useState<MinistryProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<MinistryProgram> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [expandedSub, setExpandedSub] = useState<number | null>(0);

  useEffect(() => {
    loadMinistries();
  }, []);

  const loadMinistries = async () => {
    setLoading(true);
    try {
      const data = await getMinistries();
      setMinistries(Array.isArray(data) && data.length > 0 ? data.filter((m): m is MinistryProgram => m != null) : []);
    } catch (e) {
      console.error("Failed to load ministries:", e);
      setMinistries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm("This will populate the database with the 4 default ministry programs. Continue?")) return;
    setSeeding(true);
    try {
      for (const m of fallbackMinistries) {
        await saveMinistry(m);
      }
      await loadMinistries();
    } catch (e: any) {
      console.error("Seed defaults error:", e);
      alert("Failed to seed: " + e.message);
    } finally {
      setSeeding(false);
    }
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!editing?.title?.trim()) return;
    setSaving(true);
    try {
      const slug = editing.slug || generateSlug(editing.title!);
      await saveMinistry({ ...editing, slug });
      setEditing(null);
      await loadMinistries();
    } catch (e: any) {
      console.error("Save ministry error:", e);
      alert("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this ministry?")) return;
    setDeleting(slug);
    try {
      await deleteMinistry(slug);
      await loadMinistries();
    } catch (e: any) {
      console.error("Delete ministry error:", e);
      alert("Failed to delete: " + e.message);
    } finally {
      setDeleting(null);
    }
  };

  // Sub-program helpers
  const updateSubProgram = (index: number, field: "title" | "description", value: string) => {
    if (!editing) return;
    const subs = [...(editing.subPrograms || [])];
    subs[index] = { ...subs[index], [field]: value };
    setEditing({ ...editing, subPrograms: subs });
  };

  const addSubProgram = () => {
    if (!editing) return;
    setEditing({ ...editing, subPrograms: [...(editing.subPrograms || []), { title: "", description: "" }] });
  };

  const removeSubProgram = (index: number) => {
    if (!editing) return;
    const subs = (editing.subPrograms || []).filter((_, i) => i !== index);
    setEditing({ ...editing, subPrograms: subs });
  };

  // Support step helpers
  const updateStep = (index: number, value: string) => {
    if (!editing) return;
    const steps = [...(editing.howToSupport?.steps || [])];
    steps[index] = value;
    setEditing({ ...editing, howToSupport: { ...editing.howToSupport!, steps } });
  };

  const addStep = () => {
    if (!editing) return;
    setEditing({ ...editing, howToSupport: { ...editing.howToSupport!, steps: [...(editing.howToSupport?.steps || []), ""] } });
  };

  const removeStep = (index: number) => {
    if (!editing) return;
    const steps = (editing.howToSupport?.steps || []).filter((_, i) => i !== index);
    setEditing({ ...editing, howToSupport: { ...editing.howToSupport!, steps } });
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl bg-field-sand/50 text-ink focus:outline-none focus:ring-2 focus:ring-harvest-gold/40 border border-transparent focus:border-harvest-gold/20 transition-all";
  const labelClass = "block text-covenant-navy mb-2";
  const labelStyle = { fontSize: "0.8125rem" as const, fontWeight: 700 as const };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1
            className="text-covenant-navy"
            style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 1.875rem)", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Ministries
          </h1>
          <p className="text-slate-text mt-1" style={{ fontSize: "0.875rem" }}>
            Manage ministry programs.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 self-start sm:self-auto">
          {ministries.length === 0 && !loading && (
            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="bg-field-sand text-covenant-navy px-5 py-2.5 rounded-xl hover:bg-mist transition-all duration-300 cursor-pointer flex items-center gap-2 disabled:opacity-60"
              style={{ fontSize: "0.8125rem", fontWeight: 600 }}
            >
              {seeding ? <Loader2 size={16} className="animate-spin" /> : null}
              {seeding ? "Seeding..." : "Seed Defaults"}
            </button>
          )}
          <button
            onClick={() => setEditing({ ...emptyMinistry })}
            className="bg-harvest-gold text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-harvest-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center gap-2"
            style={{ fontSize: "0.8125rem", fontWeight: 700 }}
          >
            <Plus size={16} /> New Ministry
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 bg-covenant-navy/30 backdrop-blur-sm z-50">
          <div className="relative w-full h-full overflow-y-auto flex items-start justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 border border-mist/20">
              <div className="flex items-center justify-between p-6 border-b border-mist/20">
                <h2 className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 700 }}>
                  {editing.slug ? "Edit Ministry" : "New Ministry"}
                </h2>
                <button onClick={() => setEditing(null)} className="text-slate-text hover:text-covenant-navy cursor-pointer p-1.5 rounded-lg hover:bg-field-sand/60 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Title & Slug */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} style={labelStyle}>Title *</label>
                    <input
                      type="text"
                      value={editing.title || ""}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: generateSlug(e.target.value) })}
                      className={inputClass}
                      placeholder="Feeding Program"
                    />
                  </div>
                  <div>
                    <label className={labelClass} style={labelStyle}>Slug</label>
                    <input
                      type="text"
                      value={editing.slug || ""}
                      onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                      className={inputClass}
                      placeholder="feeding-program"
                    />
                  </div>
                </div>

                {/* Tagline */}
                <div>
                  <label className={labelClass} style={labelStyle}>Tagline</label>
                  <input
                    type="text"
                    value={editing.tagline || ""}
                    onChange={(e) => setEditing({ ...editing, tagline: e.target.value })}
                    className={inputClass}
                    placeholder="Short tagline for cards"
                  />
                </div>

                {/* Icon, Color, Give Fund */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass} style={labelStyle}>Icon</label>
                    <select
                      value={editing.icon || "HeartHandshake"}
                      onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                      className={inputClass}
                    >
                      {ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} style={labelStyle}>Color</label>
                    <select
                      value={editing.color || "#C84C3D"}
                      onChange={(e) => setEditing({ ...editing, color: e.target.value })}
                      className={inputClass}
                    >
                      {COLOR_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} style={labelStyle}>Give Fund ID</label>
                    <input
                      type="text"
                      value={editing.giveFundId || ""}
                      onChange={(e) => setEditing({ ...editing, giveFundId: e.target.value })}
                      className={inputClass}
                      placeholder="general"
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="grid grid-cols-2 gap-4">
                  <AdminImagePicker
                    value={editing.heroImage || ""}
                    onChange={(url) => setEditing({ ...editing, heroImage: url })}
                    label="Hero Image"
                  />
                  <AdminImagePicker
                    value={editing.cardImage || ""}
                    onChange={(url) => setEditing({ ...editing, cardImage: url })}
                    label="Card Image"
                  />
                </div>

                {/* Goal */}
                <div>
                  <label className={labelClass} style={labelStyle}>Goal Statement</label>
                  <textarea
                    value={editing.goalText || ""}
                    onChange={(e) => setEditing({ ...editing, goalText: e.target.value })}
                    rows={3}
                    className={inputClass + " resize-none"}
                    placeholder="The Gospel-centered goal of this ministry..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass} style={labelStyle}>Full Description</label>
                  <textarea
                    value={editing.description || ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={4}
                    className={inputClass + " resize-none"}
                    placeholder="Detailed description..."
                  />
                </div>

                {/* Sub-Programs */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={labelClass} style={{ ...labelStyle, marginBottom: 0 }}>Sub-Programs</label>
                    <button onClick={addSubProgram} className="text-harvest-gold hover:underline cursor-pointer" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      + Add Sub-Program
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(editing.subPrograms || []).map((sub, i) => (
                      <div key={i} className="bg-field-sand/30 rounded-xl p-4 border border-mist/25">
                        <div className="flex items-center justify-between mb-2">
                          <button
                            onClick={() => setExpandedSub(expandedSub === i ? null : i)}
                            className="flex items-center gap-1.5 text-covenant-navy cursor-pointer"
                            style={{ fontSize: "0.8125rem", fontWeight: 600 }}
                          >
                            {expandedSub === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {sub.title || `Sub-Program ${i + 1}`}
                          </button>
                          {(editing.subPrograms || []).length > 1 && (
                            <button onClick={() => removeSubProgram(i)} className="text-mission-red/60 hover:text-mission-red cursor-pointer p-1">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        {expandedSub === i && (
                          <div className="space-y-2 mt-2">
                            <input
                              type="text"
                              value={sub.title}
                              onChange={(e) => updateSubProgram(i, "title", e.target.value)}
                              className={inputClass}
                              placeholder="Sub-program title"
                            />
                            <textarea
                              value={sub.description}
                              onChange={(e) => updateSubProgram(i, "description", e.target.value)}
                              rows={3}
                              className={inputClass + " resize-none"}
                              placeholder="Sub-program description..."
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scripture */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass} style={labelStyle}>Scripture Text</label>
                    <input
                      type="text"
                      value={editing.scripture?.text || ""}
                      onChange={(e) => setEditing({ ...editing, scripture: { ...editing.scripture!, text: e.target.value } })}
                      className={inputClass}
                      placeholder="For I was hungry and you gave me..."
                    />
                  </div>
                  <div>
                    <label className={labelClass} style={labelStyle}>Reference</label>
                    <input
                      type="text"
                      value={editing.scripture?.reference || ""}
                      onChange={(e) => setEditing({ ...editing, scripture: { ...editing.scripture!, reference: e.target.value } })}
                      className={inputClass}
                      placeholder="Matthew 25:35"
                    />
                  </div>
                </div>

                {/* How to Support */}
                <div>
                  <label className={labelClass} style={labelStyle}>How to Support — Intro</label>
                  <textarea
                    value={editing.howToSupport?.intro || ""}
                    onChange={(e) => setEditing({ ...editing, howToSupport: { ...editing.howToSupport!, intro: e.target.value } })}
                    rows={2}
                    className={inputClass + " resize-none"}
                    placeholder="Introduction to how supporters can help..."
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass} style={{ ...labelStyle, marginBottom: 0 }}>Steps</label>
                    <button onClick={addStep} className="text-harvest-gold hover:underline cursor-pointer" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      + Add Step
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(editing.howToSupport?.steps || []).map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-covenant-navy/30 mt-3.5 shrink-0" style={{ fontSize: "0.75rem", fontWeight: 800 }}>{i + 1}.</span>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => updateStep(i, e.target.value)}
                          className={inputClass + " flex-1"}
                          placeholder={`Step ${i + 1}`}
                        />
                        {(editing.howToSupport?.steps || []).length > 1 && (
                          <button onClick={() => removeStep(i)} className="text-mission-red/60 hover:text-mission-red cursor-pointer mt-3.5">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>Important Note (optional)</label>
                  <textarea
                    value={editing.howToSupport?.note || ""}
                    onChange={(e) => setEditing({ ...editing, howToSupport: { ...editing.howToSupport!, note: e.target.value } })}
                    rows={2}
                    className={inputClass + " resize-none"}
                    placeholder="Please do not donate until..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-mist/20">
                <button
                  onClick={() => setEditing(null)}
                  className="px-5 py-2.5 rounded-xl text-slate-text hover:bg-field-sand/60 transition-all cursor-pointer"
                  style={{ fontSize: "0.875rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !editing.title?.trim()}
                  className="bg-covenant-navy text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-covenant-navy/15 transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  style={{ fontSize: "0.8125rem", fontWeight: 700 }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "Saving..." : "Save Ministry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-harvest-gold" />
        </div>
      ) : ministries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-mist/25 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-field-sand/60 flex items-center justify-center mx-auto mb-4">
            <HeartHandshake size={24} className="text-slate-text/25" />
          </div>
          <p className="text-covenant-navy mb-1" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>No ministries yet</p>
          <p className="text-slate-text mb-4" style={{ fontSize: "0.8125rem" }}>
            Seed the 4 default programs or create a new one.
          </p>
          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="bg-harvest-gold text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-harvest-gold/25 transition-all duration-300 cursor-pointer disabled:opacity-60"
            style={{ fontSize: "0.8125rem", fontWeight: 700 }}
          >
            {seeding ? "Seeding..." : "Seed 4 Default Ministries"}
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {ministries.map((ministry) => (
            <div
              key={ministry.slug}
              className="bg-white rounded-2xl border border-mist/25 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 hover:border-mist/40 hover:shadow-md hover:shadow-covenant-navy/[0.02] transition-all duration-300"
            >
              {ministry.cardImage ? (
                <img src={ministry.cardImage} alt="" className="w-full sm:w-14 h-32 sm:h-14 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-full sm:w-14 h-32 sm:h-14 rounded-xl bg-field-sand/60 flex items-center justify-center shrink-0">
                  <HeartHandshake size={18} className="text-slate-text/30" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ministry.color }} />
                  <h3 className="text-covenant-navy truncate" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>{ministry.title}</h3>
                </div>
                <p className="text-slate-text truncate" style={{ fontSize: "0.8125rem" }}>{ministry.tagline}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-harvest-gold/70" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>{ministry.icon}</span>
                  <span className="text-slate-text/40" style={{ fontSize: "0.6875rem" }}>/{ministry.slug}</span>
                  <span className="text-slate-text/40" style={{ fontSize: "0.6875rem" }}>
                    {ministry.subPrograms?.length || 0} sub-programs
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                <a
                  href={`/ministries/${ministry.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl hover:bg-field-sand/60 text-slate-text/40 hover:text-covenant-navy transition-all"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => setEditing({ ...ministry })}
                  className="p-2.5 rounded-xl hover:bg-field-sand/60 text-slate-text/40 hover:text-covenant-navy transition-all cursor-pointer"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(ministry.slug)}
                  disabled={deleting === ministry.slug}
                  className="p-2.5 rounded-xl hover:bg-mission-red/5 text-slate-text/40 hover:text-mission-red transition-all cursor-pointer disabled:opacity-50"
                >
                  {deleting === ministry.slug ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}