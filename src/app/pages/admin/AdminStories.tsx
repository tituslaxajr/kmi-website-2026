"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Loader2, X, Eye, EyeOff, Search, BookOpen, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { getStories, deleteStory } from "../../lib/api";
import type { Story } from "../../data/mockData";

export function AdminStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const data = await getStories();
      setStories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load stories:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    setDeleting(id);
    try {
      await deleteStory(id);
      await loadStories();
    } catch (e: any) {
      console.error("Delete story error:", e);
      alert("Failed to delete: " + e.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = stories.filter(
    (s) =>
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Stories
          </h1>
          <p className="text-slate-text mt-1" style={{ fontSize: "0.875rem" }}>
            Manage field stories and testimonies.
          </p>
        </div>
        <Link
          href="/admin/stories/new"
          className="bg-harvest-gold text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-harvest-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-2 no-underline shrink-0 self-start sm:self-auto"
          style={{ fontSize: "0.8125rem", fontWeight: 700 }}
        >
          <Plus size={16} /> New Story
        </Link>
      </div>

      {/* Search bar */}
      {!loading && stories.length > 0 && (
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
            placeholder="Search stories..."
            style={{ fontSize: "0.875rem" }}
          />
        </div>
      )}

      {/* Stories List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-harvest-gold" />
        </div>
      ) : stories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-mist/25 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-field-sand/60 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} className="text-slate-text/25" />
          </div>
          <p className="text-covenant-navy mb-1" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>
            No stories yet
          </p>
          <p className="text-slate-text mb-5" style={{ fontSize: "0.8125rem" }}>
            Create your first story or seed the database from the Dashboard.
          </p>
          <Link
            href="/admin/stories/new"
            className="inline-flex items-center gap-2 bg-harvest-gold text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-harvest-gold/20 transition-all no-underline"
            style={{ fontSize: "0.8125rem", fontWeight: 700 }}
          >
            <Plus size={14} /> Write a Story
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-2xl border border-mist/25 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 hover:border-mist/40 hover:shadow-md hover:shadow-covenant-navy/[0.02] transition-all duration-300"
            >
              {story.featured_image ? (
                <img
                  src={story.featured_image}
                  alt=""
                  className="w-full sm:w-14 h-32 sm:h-14 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-full sm:w-14 h-32 sm:h-14 rounded-xl bg-field-sand/60 flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-slate-text/30" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className="text-covenant-navy truncate"
                    style={{ fontSize: "0.9375rem", fontWeight: 700 }}
                  >
                    {story.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-lg shrink-0 ${
                      story.published
                        ? "bg-green-50 text-green-700"
                        : "bg-field-sand text-slate-text"
                    }`}
                    style={{ fontSize: "0.625rem", fontWeight: 600 }}
                  >
                    {story.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-slate-text truncate" style={{ fontSize: "0.8125rem" }}>
                  {story.summary}
                </p>
                <div className="flex gap-3 mt-1">
                  <span
                    className="text-harvest-gold/70"
                    style={{ fontSize: "0.6875rem", fontWeight: 600 }}
                  >
                    {story.category}
                  </span>
                  <span className="text-slate-text/40" style={{ fontSize: "0.6875rem" }}>
                    {story.created_at}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                {story.published && (
                  <a
                    href={`/stories/${story.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl hover:bg-field-sand/60 text-slate-text/30 hover:text-covenant-navy transition-all"
                    title="View on site"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
                <Link
                  href={`/admin/stories/edit/${story.id}`}
                  className="p-2.5 rounded-xl hover:bg-field-sand/60 text-slate-text/40 hover:text-covenant-navy transition-all"
                  title="Edit story"
                >
                  <Edit2 size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(story.id)}
                  disabled={deleting === story.id}
                  className="p-2.5 rounded-xl hover:bg-mission-red/5 text-slate-text/40 hover:text-mission-red transition-all cursor-pointer disabled:opacity-50"
                  title="Delete story"
                >
                  {deleting === story.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && searchQuery && (
            <div className="bg-white rounded-2xl border border-mist/25 p-8 text-center">
              <p className="text-slate-text" style={{ fontSize: "0.8125rem" }}>
                No stories match &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}