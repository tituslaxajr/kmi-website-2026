"use client"
import React, { useState, useEffect } from "react";
import { Loader2, Save, Play, ExternalLink, X, Settings, Video } from "lucide-react";
import { getSiteSettings, saveSiteSettings } from "../../lib/api";

const inputClass = "w-full px-4 py-3.5 rounded-xl bg-field-sand/50 text-ink focus:outline-none focus:ring-2 focus:ring-harvest-gold/40 border border-transparent focus:border-harvest-gold/20 transition-all";
const labelStyle = { fontSize: "0.8125rem" as const, fontWeight: 700 as const };

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function AdminSiteSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSiteSettings();
      setSettings(data || {});
    } catch (e) {
      console.error("Failed to load site settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const result = await saveSiteSettings(settings);
      setSettings(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      alert("Failed to save: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const videoId = extractYouTubeId(settings.homepage_video_url || "");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
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
            Site Settings
          </h1>
          <p className="text-slate-text mt-1" style={{ fontSize: "0.875rem" }}>
            Manage global settings for the public website.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-covenant-navy text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-covenant-navy/15 transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center gap-2 shrink-0 self-start sm:self-auto"
          style={{ fontSize: "0.8125rem", fontWeight: 700 }}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <span className="text-green-300">Saved!</span>
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : saved ? "" : "Save Settings"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-harvest-gold" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Homepage Video */}
          <div className="bg-white rounded-2xl border border-mist/25 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 sm:px-6 py-4 border-b border-mist/20">
              <div className="w-8 h-8 rounded-lg bg-covenant-navy/5 flex items-center justify-center">
                <Video size={15} className="text-covenant-navy" />
              </div>
              <div>
                <h2
                  className="text-covenant-navy"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Homepage Featured Video
                </h2>
                <p className="text-slate-text" style={{ fontSize: "0.75rem" }}>
                  Appears in the &ldquo;From the Field&rdquo; section on the home page.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div>
                <label className="block text-covenant-navy mb-2" style={labelStyle}>
                  YouTube Video URL
                </label>
                <input
                  type="url"
                  value={settings.homepage_video_url || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, homepage_video_url: e.target.value })
                  }
                  className={inputClass}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={{ fontSize: "0.875rem" }}
                />
                <p className="text-slate-text/60 mt-1.5" style={{ fontSize: "0.75rem" }}>
                  Supports youtube.com/watch, youtu.be, and embed URLs.
                </p>
              </div>

              <div>
                <label className="block text-covenant-navy mb-2" style={labelStyle}>
                  Section Title
                </label>
                <input
                  type="text"
                  value={settings.homepage_video_title || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, homepage_video_title: e.target.value })
                  }
                  className={inputClass}
                  placeholder="From the Field"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>

              <div>
                <label className="block text-covenant-navy mb-2" style={labelStyle}>
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={settings.homepage_video_subtitle || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, homepage_video_subtitle: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Watch stories of God's faithfulness from the communities we serve."
                  style={{ fontSize: "0.875rem" }}
                />
              </div>

              {/* Preview */}
              {videoId && (
                <div>
                  <label className="block text-covenant-navy mb-2" style={labelStyle}>
                    Preview
                  </label>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black/5 border border-mist/20">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Video preview"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={`https://www.youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-harvest-gold hover:underline"
                      style={{ fontSize: "0.75rem", fontWeight: 600 }}
                    >
                      Open in YouTube <ExternalLink size={11} />
                    </a>
                    <span className="text-mist">|</span>
                    <button
                      onClick={() =>
                        setSettings({ ...settings, homepage_video_url: "" })
                      }
                      className="text-mission-red/60 hover:text-mission-red transition-colors cursor-pointer"
                      style={{ fontSize: "0.75rem", fontWeight: 600 }}
                    >
                      Remove video
                    </button>
                  </div>
                </div>
              )}

              {settings.homepage_video_url && !videoId && (
                <div className="bg-mission-red/5 border border-mission-red/15 rounded-xl p-3.5 flex items-start gap-2.5">
                  <X size={14} className="text-mission-red shrink-0 mt-0.5" />
                  <p className="text-mission-red/80" style={{ fontSize: "0.8125rem" }}>
                    Could not extract a valid YouTube video ID from this URL. Please check the format.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Future settings sections can be added here */}
          <div className="bg-field-sand/30 border border-dashed border-mist/40 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-field-sand/60 flex items-center justify-center mx-auto mb-3">
              <Settings size={20} className="text-slate-text/25" />
            </div>
            <p className="text-slate-text/50" style={{ fontSize: "0.8125rem" }}>
              More settings coming soon — SEO, social links, footer text, and more.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
