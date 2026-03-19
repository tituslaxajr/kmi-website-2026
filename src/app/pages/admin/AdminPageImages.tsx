"use client"
import React, { useState, useEffect, useRef } from "react";
import {
  ImageIcon,
  Loader2,
  Save,
  Upload,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { getPageImages, savePageImages, listAssets, uploadAsset } from "../../lib/api";
import { IMAGE_SLOTS, getSlotsByPage, type ImageSlot } from "../../hooks/useSiteImages";
import { IMAGES } from "../../data/mockData";
import { MINISTRY_IMAGES } from "../../data/ministryData";
import { toast } from "sonner";

// Build default images map (same as useSiteImages hook)
const DEFAULT_IMAGES: Record<string, string> = {
  ...IMAGES,
  ministry_heroOverview: MINISTRY_IMAGES.heroOverview,
  ministry_feeding: MINISTRY_IMAGES.feeding,
  ministry_childSponsorship: MINISTRY_IMAGES.childSponsorship,
  ministry_seniorCitizen: MINISTRY_IMAGES.seniorCitizen,
  ministry_ofw: MINISTRY_IMAGES.ofw,
};

interface Asset {
  name: string;
  path: string;
  public_url: string;
}

export function AdminPageImages() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [savedOverrides, setSavedOverrides] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set(["Home", "Stories", "Partners", "Impact & Give", "About", "Contact", "Ministries", "Shared", "Scripture BGs"]));
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [assetSearch, setAssetSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current overrides
  useEffect(() => {
    setLoading(true);
    getPageImages()
      .then((data) => {
        if (data && typeof data === "object") {
          setOverrides(data);
          setSavedOverrides(data);
        }
      })
      .catch((e) => {
        console.error("Failed to load page images:", e);
        toast.error("Failed to load page image overrides");
      })
      .finally(() => setLoading(false));
  }, []);

  // Load assets library when picker opens
  useEffect(() => {
    if (editingSlot) {
      setAssetsLoading(true);
      listAssets()
        .then((data) => setAssets(Array.isArray(data) ? data : []))
        .catch((e) => console.error("Failed to load assets:", e))
        .finally(() => setAssetsLoading(false));
    }
  }, [editingSlot]);

  const hasChanges = JSON.stringify(overrides) !== JSON.stringify(savedOverrides);

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePageImages(overrides);
      setSavedOverrides({ ...overrides });
      toast.success("Page images saved! Changes will appear after a page refresh.");
    } catch (e: any) {
      console.error("Failed to save page images:", e);
      toast.error(`Failed to save: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setOverrides({ ...savedOverrides });
    toast.info("Changes reverted");
  };

  const setImageUrl = (key: string, url: string) => {
    setOverrides((prev) => ({ ...prev, [key]: url }));
  };

  const resetToDefault = (key: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const getCurrentUrl = (key: string) => {
    return overrides[key] || DEFAULT_IMAGES[key] || "";
  };

  const isOverridden = (key: string) => {
    return key in overrides && overrides[key] !== DEFAULT_IMAGES[key];
  };

  const togglePage = (page: string) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const handleUploadForSlot = async (file: File, slotKey: string) => {
    setUploading(true);
    try {
      const result = await uploadAsset(file, `page-${slotKey}-${file.name}`);
      if (result.public_url) {
        setImageUrl(slotKey, result.public_url);
        setEditingSlot(null);
        toast.success("Image uploaded and assigned");
      }
    } catch (e: any) {
      console.error("Upload error:", e);
      toast.error(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlInput = (slotKey: string, url: string) => {
    if (url.trim()) {
      setImageUrl(slotKey, url.trim());
      setEditingSlot(null);
      toast.success("Image URL set");
    }
  };

  const groupedSlots = getSlotsByPage();
  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(assetSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-harvest-gold" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-covenant-navy"
            style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 1.875rem)", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Page Images
          </h1>
          <p className="text-slate-text mt-1" style={{ fontSize: "0.875rem" }}>
            Override hero backgrounds, section images, and scripture backdrops across the site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleRevert}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-mist/40 text-slate-text hover:bg-field-sand/50 transition-colors cursor-pointer"
              style={{ fontSize: "0.8125rem", fontWeight: 600 }}
            >
              <RotateCcw size={14} />
              Revert
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-harvest-gold text-white hover:bg-[#c88e30] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            style={{ fontSize: "0.8125rem", fontWeight: 700 }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Unsaved indicator */}
      {hasChanges && (
        <div className="bg-harvest-gold/8 border border-harvest-gold/20 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-harvest-gold animate-pulse" />
          <p className="text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
            You have unsaved changes
          </p>
        </div>
      )}

      {/* Page Groups */}
      <div className="space-y-3">
        {groupedSlots.map(({ page, slots }) => {
          const isExpanded = expandedPages.has(page);
          const overriddenCount = slots.filter((s) => isOverridden(s.key)).length;

          return (
            <div key={page} className="bg-white rounded-2xl border border-mist/30 overflow-hidden">
              {/* Group header */}
              <button
                onClick={() => togglePage(page)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-field-sand/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-slate-text" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-text" />
                  )}
                  <h3
                    className="text-covenant-navy"
                    style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 700 }}
                  >
                    {page}
                  </h3>
                  <span
                    className="text-slate-text/50"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {slots.length} image{slots.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {overriddenCount > 0 && (
                  <span
                    className="bg-harvest-gold/10 text-harvest-gold px-2 py-0.5 rounded-full"
                    style={{ fontSize: "0.6875rem", fontWeight: 700 }}
                  >
                    {overriddenCount} customized
                  </span>
                )}
              </button>

              {/* Slots */}
              {isExpanded && (
                <div className="border-t border-mist/20">
                  {slots.map((slot) => (
                    <ImageSlotRow
                      key={slot.key}
                      slot={slot}
                      currentUrl={getCurrentUrl(slot.key)}
                      isOverridden={isOverridden(slot.key)}
                      isEditing={editingSlot === slot.key}
                      onEdit={() => {
                        setEditingSlot(editingSlot === slot.key ? null : slot.key);
                        setAssetSearch("");
                      }}
                      onReset={() => resetToDefault(slot.key)}
                      onSelectUrl={(url) => {
                        setImageUrl(slot.key, url);
                        setEditingSlot(null);
                      }}
                      assets={filteredAssets}
                      assetsLoading={assetsLoading}
                      assetSearch={assetSearch}
                      onAssetSearchChange={setAssetSearch}
                      onUpload={(file) => handleUploadForSlot(file, slot.key)}
                      uploading={uploading}
                      onUrlInput={(url) => handleUrlInput(slot.key, url)}
                      fileInputRef={fileInputRef}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && editingSlot) {
            handleUploadForSlot(file, editingSlot);
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Individual Image Slot Row ───────────────────────────────────────────

function ImageSlotRow({
  slot,
  currentUrl,
  isOverridden,
  isEditing,
  onEdit,
  onReset,
  onSelectUrl,
  assets,
  assetsLoading,
  assetSearch,
  onAssetSearchChange,
  onUpload,
  uploading,
  onUrlInput,
  fileInputRef,
}: {
  slot: ImageSlot;
  currentUrl: string;
  isOverridden: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onReset: () => void;
  onSelectUrl: (url: string) => void;
  assets: Asset[];
  assetsLoading: boolean;
  assetSearch: string;
  onAssetSearchChange: (s: string) => void;
  onUpload: (file: File) => void;
  uploading: boolean;
  onUrlInput: (url: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [urlMode, setUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  return (
    <div className="border-b border-mist/10 last:border-b-0">
      {/* Main row */}
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Thumbnail */}
        <div className="w-16 h-12 rounded-lg overflow-hidden bg-field-sand/50 shrink-0 border border-mist/20">
          {currentUrl ? (
            <img src={currentUrl} alt={slot.label} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={16} className="text-slate-text/30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-covenant-navy truncate"
              style={{ fontSize: "0.8125rem", fontWeight: 700 }}
            >
              {slot.label}
            </span>
            {isOverridden && (
              <span
                className="bg-harvest-gold/10 text-harvest-gold px-1.5 py-0.5 rounded shrink-0"
                style={{ fontSize: "0.5625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Custom
              </span>
            )}
          </div>
          <p className="text-slate-text/60 truncate" style={{ fontSize: "0.6875rem" }}>
            {slot.desc}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isOverridden && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-text/70 hover:bg-field-sand/50 transition-colors cursor-pointer"
              style={{ fontSize: "0.6875rem", fontWeight: 600 }}
              title="Reset to default"
            >
              <RotateCcw size={12} />
              Default
            </button>
          )}
          <button
            onClick={onEdit}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isEditing
                ? "bg-harvest-gold/10 text-harvest-gold"
                : "bg-field-sand/50 text-covenant-navy hover:bg-field-sand"
            }`}
            style={{ fontSize: "0.6875rem", fontWeight: 700 }}
          >
            {isEditing ? (
              <>
                <X size={12} /> Close
              </>
            ) : (
              <>
                <ImageIcon size={12} /> Change
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded picker */}
      {isEditing && (
        <div className="px-6 pb-5">
          <div className="bg-field-sand/40 rounded-xl border border-mist/20 p-4">
            {/* Tabs: Assets | Upload | URL */}
            <div className="flex items-center gap-1 mb-4">
              <button
                onClick={() => setUrlMode(false)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  !urlMode ? "bg-white text-covenant-navy shadow-sm" : "text-slate-text hover:bg-white/50"
                }`}
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                From Library
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg text-slate-text hover:bg-white/50 transition-colors cursor-pointer flex items-center gap-1"
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                <Upload size={12} />
                Upload New
              </button>
              <button
                onClick={() => {
                  setUrlMode(true);
                  setUrlValue("");
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  urlMode ? "bg-white text-covenant-navy shadow-sm" : "text-slate-text hover:bg-white/50"
                }`}
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                Paste URL
              </button>
            </div>

            {uploading && (
              <div className="flex items-center gap-2 py-4 justify-center">
                <Loader2 size={16} className="animate-spin text-harvest-gold" />
                <span className="text-slate-text" style={{ fontSize: "0.8125rem" }}>Uploading...</span>
              </div>
            )}

            {!uploading && urlMode && (
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  className="flex-1 bg-white border border-mist/40 rounded-lg px-3 py-2 text-covenant-navy placeholder:text-slate-text/30 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30"
                  style={{ fontSize: "0.8125rem" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && urlValue.trim()) onUrlInput(urlValue);
                  }}
                />
                <button
                  onClick={() => urlValue.trim() && onUrlInput(urlValue)}
                  disabled={!urlValue.trim()}
                  className="px-4 py-2 bg-harvest-gold text-white rounded-lg hover:bg-[#c88e30] disabled:opacity-40 transition-colors cursor-pointer"
                  style={{ fontSize: "0.8125rem", fontWeight: 700 }}
                >
                  <Check size={14} />
                </button>
              </div>
            )}

            {!uploading && !urlMode && (
              <>
                {/* Search */}
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text/40" />
                  <input
                    type="text"
                    placeholder="Search uploaded assets..."
                    value={assetSearch}
                    onChange={(e) => onAssetSearchChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-mist/40 rounded-lg text-covenant-navy placeholder:text-slate-text/30 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30"
                    style={{ fontSize: "0.8125rem" }}
                  />
                </div>

                {/* Asset grid */}
                {assetsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 size={16} className="animate-spin text-harvest-gold" />
                  </div>
                ) : assets.length === 0 ? (
                  <div className="text-center py-6">
                    <ImageIcon size={24} className="mx-auto text-slate-text/20 mb-2" />
                    <p className="text-slate-text/50" style={{ fontSize: "0.8125rem" }}>
                      No assets found. Upload an image or paste a URL.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-[240px] overflow-y-auto pr-1">
                    {assets.map((asset) => {
                      const isSelected = currentUrl === asset.public_url;
                      return (
                        <button
                          key={asset.path}
                          onClick={() => onSelectUrl(asset.public_url)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer hover:scale-[1.03] ${
                            isSelected ? "border-harvest-gold ring-2 ring-harvest-gold/20" : "border-transparent hover:border-harvest-gold/30"
                          }`}
                        >
                          <img src={asset.public_url} alt={asset.name} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-harvest-gold/20 flex items-center justify-center">
                              <Check size={16} className="text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}