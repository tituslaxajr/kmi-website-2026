"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  DollarSign,
  Film,
  TrendingUp,
  Heart,
  Loader2,
  Database,
  CheckCircle,
  ArrowUpRight,
  Plus,
  HeartHandshake,
  Mail,
  ImageIcon,
  Clock,
} from "lucide-react";
import { getDashboardStats, checkSeeded, seedData } from "../../lib/api";
import {
  stories as mockStories,
  partners as mockPartners,
  mediaItems as mockMedia,
  impactStats as mockImpact,
} from "../../data/mockData";
import { useAuth } from "../../context/AuthContext";

const mockDonations = [
  { id: "d1", donor_name: "John Smith", amount: 100, fund: "Child Sponsorship", date: "2026-02-28T10:00:00Z" },
  { id: "d2", donor_name: "Grace Lee", amount: 250, fund: "General Fund", date: "2026-02-27T15:30:00Z" },
  { id: "d3", donor_name: "Anonymous", amount: 50, fund: "Church Support", date: "2026-02-26T09:00:00Z" },
  { id: "d4", donor_name: "Maria Santos", amount: 500, fund: "Community Relief", date: "2026-02-25T14:00:00Z" },
  { id: "d5", donor_name: "David Cruz", amount: 75, fund: "Education", date: "2026-02-24T11:00:00Z" },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const quickActions = [
  { label: "New Story", icon: Plus, path: "/admin/stories", color: "#103B53", bg: "bg-covenant-navy/5" },
  { label: "Add Partner", icon: Users, path: "/admin/partners", color: "#C84C3D", bg: "bg-mission-red/5" },
  { label: "Record Gift", icon: DollarSign, path: "/admin/donations", color: "#D89B3C", bg: "bg-harvest-gold/5" },
  { label: "Upload Media", icon: Film, path: "/admin/media", color: "#6E8A8F", bg: "bg-dust-blue/5" },
];

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashStats, isSeeded] = await Promise.all([
        getDashboardStats().catch(() => null),
        checkSeeded().catch(() => false),
      ]);
      setStats(dashStats);
      setSeeded(isSeeded);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedData({
        stories: mockStories,
        partners: mockPartners,
        mediaItems: mockMedia,
        impactStats: mockImpact,
        donations: mockDonations,
      });
      console.log("Seed result:", result);
      setSeeded(true);
      await loadData();
    } catch (e: any) {
      console.error("Seed error details:", e);
      alert("Failed to seed data: " + e.message + "\n\nCheck browser console for details.");
    } finally {
      setSeeding(false);
    }
  };

  const statCards = [
    {
      label: "Stories Published",
      value: stats?.storiesCount ?? "\u2014",
      icon: BookOpen,
      color: "#103B53",
      bgColor: "bg-covenant-navy/5",
      path: "/admin/stories",
    },
    {
      label: "Partner Churches",
      value: stats?.partnersCount ?? "\u2014",
      icon: Users,
      color: "#C84C3D",
      bgColor: "bg-mission-red/5",
      path: "/admin/partners",
    },
    {
      label: "Media Items",
      value: stats?.mediaCount ?? "\u2014",
      icon: Film,
      color: "#D89B3C",
      bgColor: "bg-harvest-gold/5",
      path: "/admin/media",
    },
    {
      label: "Total Donations",
      value: stats?.totalDonations ? `$${stats.totalDonations.toLocaleString()}` : "\u2014",
      icon: DollarSign,
      color: "#6E8A8F",
      bgColor: "bg-dust-blue/5",
      path: "/admin/donations",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      {/* Header with greeting */}
      <div className="mb-8">
        <h1
          className="text-covenant-navy"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.5rem, 3vw, 1.875rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          {getGreeting()}, {user?.name?.split(" ")[0] || "Admin"}
        </h1>
        <p className="text-slate-text mt-1" style={{ fontSize: "0.875rem" }}>
          Here&apos;s what&apos;s happening with your ministry today.
        </p>
      </div>

      {/* Seed Banner */}
      {!seeded && !loading && (
        <div className="bg-harvest-gold/6 border border-harvest-gold/15 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-harvest-gold/12 flex items-center justify-center shrink-0">
            <Database size={18} className="text-harvest-gold" />
          </div>
          <div className="flex-1">
            <p className="text-covenant-navy" style={{ fontWeight: 700, fontSize: "0.875rem" }}>
              Initialize Database
            </p>
            <p className="text-slate-text" style={{ fontSize: "0.8125rem" }}>
              Seed with sample stories, partners, media, and donations to get started.
            </p>
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="bg-harvest-gold text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-harvest-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0 flex items-center gap-2 shrink-0"
            style={{ fontSize: "0.8125rem", fontWeight: 700 }}
          >
            {seeding ? <Loader2 size={15} className="animate-spin" /> : <Database size={15} />}
            {seeding ? "Seeding..." : "Seed Data"}
          </button>
        </div>
      )}

      {seeded && !loading && (
        <div className="bg-emerald-50/70 border border-emerald-200/40 rounded-xl p-3.5 mb-6 flex items-center gap-2.5">
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          <p className="text-emerald-700" style={{ fontSize: "0.8125rem" }}>
            Database initialized. Manage all data from the admin pages.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-harvest-gold" />
        </div>
      ) : (
        <div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => (
              <Link
                key={stat.label}
                href={stat.path}
                className="bg-white rounded-2xl p-5 border border-mist/25 hover:border-mist/50 hover:shadow-lg hover:shadow-covenant-navy/[0.03] transition-all duration-400 hover:-translate-y-0.5 group block"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.bgColor}`}
                  >
                    <stat.icon size={16} style={{ color: stat.color }} strokeWidth={2} />
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="text-mist group-hover:text-harvest-gold transition-colors duration-300"
                  />
                </div>
                <div
                  className="text-covenant-navy"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.625rem",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-slate-text mt-0.5" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                  {stat.label}
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2
              className="text-covenant-navy mb-3"
              style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.path}
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border border-mist/25 hover:border-mist/50 hover:shadow-md hover:shadow-covenant-navy/[0.02] transition-all duration-300 group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.bg} group-hover:scale-105 transition-transform`}>
                    <action.icon size={14} style={{ color: action.color }} />
                  </div>
                  <span className="text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-2xl border border-mist/25 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-mist/20">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-harvest-gold/8 flex items-center justify-center">
                  <Heart size={13} className="text-harvest-gold" />
                </div>
                <h2
                  className="text-covenant-navy"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Recent Donations
                </h2>
              </div>
              <Link
                href="/admin/donations"
                className="text-harvest-gold hover:text-[#c88e30] transition-colors flex items-center gap-1"
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-mist/15">
              {(stats?.recentDonations || []).length > 0 ? (
                stats.recentDonations.slice(0, 5).map((d: any, i: number) => (
                  <div key={d.id || i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-field-sand/20 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-harvest-gold/6 flex items-center justify-center shrink-0">
                      <DollarSign size={13} className="text-harvest-gold/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                        ${d.amount?.toLocaleString()}{" "}
                        <span className="text-slate-text/60 font-normal">&middot; {d.fund || "General"}</span>
                      </p>
                      <p className="text-slate-text/50 truncate" style={{ fontSize: "0.6875rem" }}>
                        {d.donor_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Clock size={11} className="text-slate-text/30" />
                      <span className="text-slate-text/40" style={{ fontSize: "0.6875rem", fontWeight: 500 }}>
                        {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-field-sand/60 flex items-center justify-center mx-auto mb-3">
                    <DollarSign size={20} className="text-slate-text/25" />
                  </div>
                  <p className="text-slate-text/60" style={{ fontSize: "0.8125rem" }}>
                    No donations recorded yet.
                  </p>
                  <Link
                    href="/admin/donations"
                    className="inline-flex items-center gap-1 text-harvest-gold hover:underline mt-2"
                    style={{ fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    Record a donation <ArrowUpRight size={11} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}