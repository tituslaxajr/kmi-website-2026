"use client"
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  X,
  Upload,
  Copy,
  Search,
  ImageIcon,
  Check,
  CloudUpload,
} from "lucide-react";
import { listAssets, uploadAsset, deleteAsset } from "../../lib/api";
import { toast } from "sonner";

interface Asset {
  name: string;
  path: string;
  size: number;
  mimetype: string;
  created_at: string;
  updated_at?: string;
  public_url: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AdminAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Asset | null>(null);
  const [search, setSearch] = useState("");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [dragFile, setDragFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await listAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load assets:", e);
      toast.error("Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!dragFile) return;
    setUploading(true);
    try {
      await uploadAsset(dragFile, customName || undefined);
      toast.success("Image uploaded successfully");
      setShowUpload(false);
      setDragFile(null);
      setCustomName("");
      await loadAssets();
    } catch (e: any) {
      toast.error("Upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.path);
    try {
      await deleteAsset(confirmDelete.path);
      toast.success("Image deleted");
      setConfirmDelete(null);
      await loadAssets();
    } catch (e: any) {
      toast.error("Delete failed: " + e.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleCopy = async (url: string, path: string) => {
    try {
      // Try the modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback: use a temporary textarea (works in iframes / non-secure contexts)
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedPath(path);
      toast.success("URL copied");
      setTimeout(() => setCopiedPath(null), 2000);
    } catch {
      // Last resort: show the URL so the user can manually copy it
      toast.info("Copy this URL: " + url, { duration: 8000 });
    }
  };

  const onFileSelect = (file: File | null) => {
    if (!file) return;
    // Validate: image files only
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    setDragFile(file);
    // Pre-fill custom name from original filename (without extension)
    const nameWithoutExt = file.name.replace(/\.[^.]+$/, "");
    setCustomName(nameWithoutExt);
    setShowUpload(true);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  }, []);

  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-covenant-navy"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Image Assets
          </h1>
          <p className="text-slate-text mt-1" style={{ fontSize: "0.9375rem" }}>
            Upload and manage reusable images for stories, partners, and media.
          </p>
        </div>
        <button
          onClick={() => {
            setDragFile(null);
            setCustomName("");
            setShowUpload(true);
          }}
          className="bg-harvest-gold text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-harvest-gold/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center gap-2"
          style={{ fontSize: "0.8125rem", fontWeight: 700 }}
        >
          <Plus size={18} /> Upload Image
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-text"
        />
        <input
          type="text"
          placeholder="Search by filename..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 pl-11 pr-4 py-3 rounded-xl bg-white border border-mist/50 text-ink focus:outline-none focus:ring-2 focus:ring-harvest-gold/50 transition-all"
          style={{ fontSize: "0.875rem" }}
        />
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50">
          <div className="relative w-full h-full overflow-y-auto flex items-start justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-8 border border-mist/30">
              <div className="flex items-center justify-between p-6 border-b border-mist/30">
                <h2
                  className="text-covenant-navy"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                  }}
                >
                  Upload Image
                </h2>
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setDragFile(null);
                    setCustomName("");
                  }}
                  className="text-slate-text hover:text-covenant-navy cursor-pointer p-1 rounded-lg hover:bg-field-sand/60 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Drop zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? "border-harvest-gold bg-harvest-gold/5"
                      : dragFile
                      ? "border-green-400 bg-green-50/50"
                      : "border-mist hover:border-harvest-gold/60 hover:bg-field-sand/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
                  />
                  {dragFile ? (
                    <div className="space-y-2">
                      {dragFile.type.startsWith("image/") && (
                        <img
                          src={URL.createObjectURL(dragFile)}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-xl mx-auto shadow-sm"
                        />
                      )}
                      <p
                        className="text-covenant-navy"
                        style={{ fontSize: "0.875rem", fontWeight: 600 }}
                      >
                        {dragFile.name}
                      </p>
                      <p className="text-slate-text" style={{ fontSize: "0.75rem" }}>
                        {formatFileSize(dragFile.size)} &middot; Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <CloudUpload size={36} className="mx-auto text-slate-text" />
                      <p
                        className="text-covenant-navy"
                        style={{ fontSize: "0.9375rem", fontWeight: 600 }}
                      >
                        Drag & drop an image here
                      </p>
                      <p className="text-slate-text" style={{ fontSize: "0.8125rem" }}>
                        or click to browse files
                      </p>
                    </div>
                  )}
                </div>

                {/* Optional rename */}
                {dragFile && (
                  <div>
                    <label
                      className="block text-covenant-navy mb-1.5"
                      style={{ fontSize: "0.8125rem", fontWeight: 500 }}
                    >
                      Rename (optional)
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-field-sand text-ink focus:outline-none focus:ring-2 focus:ring-harvest-gold"
                      placeholder="Enter a custom filename"
                    />
                    <p className="text-slate-text mt-1" style={{ fontSize: "0.6875rem" }}>
                      Extension will be preserved from the original file.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-mist">
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setDragFile(null);
                    setCustomName("");
                  }}
                  className="px-5 py-2.5 rounded-full text-slate-text hover:bg-field-sand transition-all cursor-pointer"
                  style={{ fontSize: "0.875rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !dragFile}
                  className="bg-covenant-navy text-white px-5 py-2.5 rounded-full hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  style={{ fontSize: "0.875rem", fontWeight: 600 }}
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50">
          <div className="relative w-full h-full flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-mist/30">
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-mission-red/10 flex items-center justify-center mx-auto">
                  <Trash2 size={24} className="text-mission-red" />
                </div>
                <h3
                  className="text-covenant-navy"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                  }}
                >
                  Delete Image?
                </h3>
                <p className="text-slate-text" style={{ fontSize: "0.875rem" }}>
                  This will permanently delete{" "}
                  <span className="font-semibold text-covenant-navy">
                    {confirmDelete.name}
                  </span>
                  . Any content using this image URL will show a broken image.
                </p>
              </div>
              <div className="flex gap-3 p-6 border-t border-mist">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-2.5 rounded-full text-slate-text hover:bg-field-sand transition-all cursor-pointer"
                  style={{ fontSize: "0.875rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!!deleting}
                  className="flex-1 bg-mission-red text-white px-4 py-2.5 rounded-full hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ fontSize: "0.875rem", fontWeight: 600 }}
                >
                  {deleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-harvest-gold" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-field-sand flex items-center justify-center mx-auto mb-5">
            <ImageIcon size={36} className="text-slate-text" />
          </div>
          <p
            className="text-covenant-navy mb-2"
            style={{ fontSize: "1.0625rem", fontWeight: 600 }}
          >
            {search ? "No matching assets" : "No assets yet"}
          </p>
          <p className="text-slate-text" style={{ fontSize: "0.875rem" }}>
            {search
              ? "Try a different search term."
              : "Upload your first image to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.path}
              className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Image preview */}
              <div className="relative aspect-[4/3] overflow-hidden bg-field-sand">
                <img
                  src={asset.public_url}
                  alt={asset.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <p
                  className="text-covenant-navy truncate"
                  title={asset.name}
                  style={{ fontSize: "0.8125rem", fontWeight: 600 }}
                >
                  {asset.name}
                </p>
                <div className="flex items-center gap-2 text-slate-text" style={{ fontSize: "0.6875rem" }}>
                  <span>{formatFileSize(asset.size)}</span>
                  <span>&middot;</span>
                  <span>{formatDate(asset.created_at)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleCopy(asset.public_url, asset.path)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-field-sand/70 hover:bg-harvest-gold/10 text-slate-text hover:text-harvest-gold transition-all cursor-pointer"
                    style={{ fontSize: "0.6875rem", fontWeight: 600 }}
                    title="Copy public URL"
                  >
                    {copiedPath === asset.path ? (
                      <Check size={12} className="text-green-600" />
                    ) : (
                      <Copy size={12} />
                    )}
                    {copiedPath === asset.path ? "Copied!" : "Copy URL"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(asset)}
                    className="p-1.5 rounded-lg hover:bg-mission-red/5 text-slate-text hover:text-mission-red transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}