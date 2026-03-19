"use client"
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, X, Save, DollarSign, Search, TrendingUp } from "lucide-react";
import { getDonations, saveDonation, deleteDonation } from "../../lib/api";

interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  fund: string;
  date: string;
  notes?: string;
}

const FUNDS = ["Child Sponsorship", "General Fund", "Church Support", "Community Relief", "Education", "Emergency Relief"];

const inputClass = "w-full px-4 py-3.5 rounded-xl bg-field-sand/50 text-ink focus:outline-none focus:ring-2 focus:ring-harvest-gold/40 border border-transparent focus:border-harvest-gold/20 transition-all";
const labelStyle = { fontSize: "0.8125rem" as const, fontWeight: 700 as const };

export function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Donation> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { loadDonations(); }, []);

  const loadDonations = async () => {
    setLoading(true);
    try {
      const data = await getDonations();
      setDonations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load donations:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editing?.donor_name?.trim() || !editing.amount) return;
    setSaving(true);
    try {
      await saveDonation(editing);
      setEditing(null);
      await loadDonations();
    } catch (e: any) {
      alert("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this donation record?")) return;
    setDeleting(id);
    try {
      await deleteDonation(id);
      await loadDonations();
    } catch (e: any) {
      alert("Failed to delete: " + e.message);
    } finally {
      setDeleting(null);
    }
  };

  const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const filtered = donations.filter((d) =>
    !searchQuery ||
    d.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.fund?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 1.875rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>Donations</h1>
          <p className="text-slate-text mt-1" style={{ fontSize: "0.875rem" }}>Track and manage donation records.</p>
        </div>
        <button
          onClick={() => setEditing({ donor_name: "", amount: 0, fund: "General Fund", notes: "" })}
          className="bg-harvest-gold text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-harvest-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
          style={{ fontSize: "0.8125rem", fontWeight: 700 }}
        >
          <Plus size={16} /> Record Donation
        </button>
      </div>

      {/* Summary cards */}
      {!loading && donations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-mist/25 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-harvest-gold/8 flex items-center justify-center">
              <DollarSign size={18} className="text-harvest-gold" />
            </div>
            <div>
              <p className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                ${total.toLocaleString()}
              </p>
              <p className="text-slate-text/60" style={{ fontSize: "0.75rem", fontWeight: 500 }}>Total received</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-mist/25 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-covenant-navy/5 flex items-center justify-center">
              <TrendingUp size={18} className="text-covenant-navy/60" />
            </div>
            <div>
              <p className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                {donations.length}
              </p>
              <p className="text-slate-text/60" style={{ fontSize: "0.75rem", fontWeight: 500 }}>Donations recorded</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {!loading && donations.length > 0 && (
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-text/30 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-ink placeholder:text-slate-text/35 focus:outline-none focus:ring-2 focus:ring-harvest-gold/25 border border-mist/30 focus:border-harvest-gold/20 transition-all"
            placeholder="Search by donor or fund..."
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
                  {editing.id ? "Edit Donation" : "Record Donation"}
                </h2>
                <button onClick={() => setEditing(null)} className="text-slate-text hover:text-covenant-navy cursor-pointer p-1.5 rounded-lg hover:bg-field-sand/60 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>Donor Name *</label>
                  <input type="text" value={editing.donor_name || ""} onChange={(e) => setEditing({ ...editing, donor_name: e.target.value })}
                    className={inputClass} placeholder="Donor name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-covenant-navy mb-2" style={labelStyle}>Amount ($) *</label>
                    <input type="number" min="0" step="0.01" value={editing.amount || ""} onChange={(e) => setEditing({ ...editing, amount: parseFloat(e.target.value) || 0 })}
                      className={inputClass} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-covenant-navy mb-2" style={labelStyle}>Fund</label>
                    <select value={editing.fund || "General Fund"} onChange={(e) => setEditing({ ...editing, fund: e.target.value })}
                      className={inputClass}>
                      {FUNDS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>Notes</label>
                  <textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                    rows={3} className={inputClass + " resize-none"} placeholder="Optional notes" />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-mist/20">
                <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl text-slate-text hover:bg-field-sand/60 transition-all cursor-pointer" style={{ fontSize: "0.8125rem" }}>Cancel</button>
                <button onClick={handleSave} disabled={saving || !editing.donor_name?.trim() || !editing.amount}
                  className="bg-covenant-navy text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-covenant-navy/15 transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donations Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="animate-spin text-harvest-gold" /></div>
      ) : donations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-mist/25 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-field-sand/60 flex items-center justify-center mx-auto mb-4">
            <DollarSign size={24} className="text-slate-text/25" />
          </div>
          <p className="text-covenant-navy mb-1" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>No donations yet</p>
          <p className="text-slate-text" style={{ fontSize: "0.8125rem" }}>Seed the database from the Dashboard or record a donation.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-mist/25 overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-mist/20 bg-field-sand/20">
                <th className="text-left px-5 py-3 text-covenant-navy/40" style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Donor</th>
                <th className="text-left px-5 py-3 text-covenant-navy/40" style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Amount</th>
                <th className="text-left px-5 py-3 text-covenant-navy/40 hidden sm:table-cell" style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Fund</th>
                <th className="text-left px-5 py-3 text-covenant-navy/40 hidden md:table-cell" style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Date</th>
                <th className="px-5 py-3" style={{ width: "50px" }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-mist/15 last:border-0 hover:bg-field-sand/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{d.donor_name}</span>
                    {d.notes && <p className="text-slate-text/50 truncate max-w-[200px]" style={{ fontSize: "0.6875rem" }}>{d.notes}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-harvest-gold" style={{ fontSize: "0.875rem", fontWeight: 700 }}>${d.amount?.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="bg-field-sand/60 text-covenant-navy/70 px-2.5 py-1 rounded-lg" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>{d.fund || "General"}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-slate-text/50" style={{ fontSize: "0.75rem" }}>{new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => handleDelete(d.id)} disabled={deleting === d.id}
                      className="p-2 rounded-lg hover:bg-mission-red/5 text-slate-text/30 hover:text-mission-red transition-all cursor-pointer disabled:opacity-50">
                      {deleting === d.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && searchQuery && (
            <div className="px-5 py-8 text-center">
              <p className="text-slate-text" style={{ fontSize: "0.8125rem" }}>No donations match &ldquo;{searchQuery}&rdquo;</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}