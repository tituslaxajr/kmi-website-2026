"use client"
import { useState, useEffect } from "react";
import { Trash2, Loader2, Download, Mail, Users } from "lucide-react";
import { getSubscribers, deleteSubscriber } from "../../lib/api";

interface Subscriber {
  email: string;
  confirmed: boolean;
  created_at: string;
}

export function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const data = await getSubscribers();
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load subscribers:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`Remove subscriber ${email}?`)) return;
    setDeleting(email);
    try {
      await deleteSubscriber(email);
      await loadSubscribers();
    } catch (e: any) {
      console.error("Delete subscriber error:", e);
      alert("Failed to delete: " + e.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const header = "Email,Confirmed,Subscribed Date\n";
    const rows = subscribers.map((s) =>
      `"${s.email}","${s.confirmed ? "Yes" : "No"}","${s.created_at ? new Date(s.created_at).toLocaleDateString() : ""}"`
    ).join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kapatid-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
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
            Subscribers
          </h1>
          <p className="text-slate-text mt-1" style={{ fontSize: "0.875rem" }}>
            Manage newsletter subscribers.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={subscribers.length === 0}
          className="bg-covenant-navy text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-covenant-navy/15 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-default disabled:hover:translate-y-0 shrink-0 self-start sm:self-auto"
          style={{ fontSize: "0.8125rem", fontWeight: 700 }}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-mist/25 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-harvest-gold/8 flex items-center justify-center">
            <Users size={18} className="text-harvest-gold" />
          </div>
          <div>
            <p
              className="text-covenant-navy"
              style={{ fontSize: "1.25rem", fontWeight: 800 }}
            >
              {loading ? "..." : subscribers.length}
            </p>
            <p className="text-slate-text" style={{ fontSize: "0.75rem" }}>
              Total Subscribers
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-mist/25 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Mail size={18} className="text-green-600" />
          </div>
          <div>
            <p
              className="text-covenant-navy"
              style={{ fontSize: "1.25rem", fontWeight: 800 }}
            >
              {loading ? "..." : subscribers.filter((s) => s.confirmed).length}
            </p>
            <p className="text-slate-text" style={{ fontSize: "0.75rem" }}>
              Confirmed
            </p>
          </div>
        </div>
      </div>

      {/* Subscriber table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-harvest-gold" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-mist/25 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-field-sand/60 flex items-center justify-center mx-auto mb-4">
            <Mail size={24} className="text-slate-text/40" />
          </div>
          <p className="text-covenant-navy mb-1" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>No subscribers yet</p>
          <p
            className="text-slate-text"
            style={{ fontSize: "0.8125rem" }}
          >
            Share your newsletter subscribe form to start
            building your list.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-mist/25 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_130px_60px] gap-4 px-5 py-3 bg-field-sand/20 border-b border-mist/20">
            <span
              className="text-covenant-navy/40"
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Email
            </span>
            <span
              className="text-covenant-navy/40"
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Status
            </span>
            <span
              className="text-covenant-navy/40"
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Subscribed
            </span>
            <span />
          </div>

          {/* Table rows */}
          {subscribers.map((sub) => (
            <div
              key={sub.email}
              className="grid grid-cols-[1fr_100px_130px_60px] gap-4 items-center px-5 py-3.5 border-b border-mist/20 last:border-b-0 hover:bg-field-sand/20 transition-colors"
            >
              <span
                className="text-ink truncate"
                style={{ fontSize: "0.8125rem", fontWeight: 500 }}
              >
                {sub.email}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs w-fit ${
                  sub.confirmed
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {sub.confirmed ? "Confirmed" : "Pending"}
              </span>
              <span
                className="text-slate-text"
                style={{ fontSize: "0.75rem" }}
              >
                {sub.created_at ? formatDate(sub.created_at) : "—"}
              </span>
              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(sub.email)}
                  disabled={deleting === sub.email}
                  className="p-2 rounded-lg hover:bg-mission-red/5 text-slate-text/40 hover:text-mission-red transition-all cursor-pointer disabled:opacity-50"
                >
                  {deleting === sub.email ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}