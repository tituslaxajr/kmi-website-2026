"use client"
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ImageIcon,
  Search,
  Loader2,
  X,
  Check,
  Upload,
  Trash2,
} from "lucide-react";
import { listAssets, uploadAsset } from "../../lib/api";

interface AdminImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

interface UploadQueueItem {
  file: File;
  name: string;
  status: "pending" | "uploading" | "done" | "error";
  preview: string;
  publicUrl?: string;
  error?: string;
}

export function AdminImagePicker({ value, onChange, label = "Image" }: AdminImagePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = (url: string) => {
    onChange(url);
    setShowPicker(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div>
      <label
        className="block text-covenant-navy mb-2"
        style={{ fontSize: "0.8125rem", fontWeight: 700 }}
      >
        {label}
      </label>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-mist/25 hover:border-harvest-gold/30 transition-all">
          <img
            src={value}
            alt="Selected"
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-covenant-navy/0 group-hover:bg-covenant-navy/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="px-4 py-2 bg-white/95 text-covenant-navy rounded-lg shadow-lg cursor-pointer hover:bg-white transition-colors"
              style={{ fontSize: "0.75rem", fontWeight: 700 }}
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-white/95 text-mission-red rounded-lg shadow-lg cursor-pointer hover:bg-white transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full py-10 rounded-xl border-2 border-dashed border-mist/40 hover:border-harvest-gold/30 bg-field-sand/20 hover:bg-harvest-gold/5 transition-all cursor-pointer flex flex-col items-center gap-2.5"
        >
          <div className="w-12 h-12 rounded-2xl bg-field-sand/60 flex items-center justify-center">
            <ImageIcon size={20} className="text-slate-text/30" />
          </div>
          <div className="text-center">
            <p
              className="text-covenant-navy"
              style={{ fontSize: "0.8125rem", fontWeight: 600 }}
            >
              Click to add an image
            </p>
            <p
              className="text-slate-text/35 mt-0.5"
              style={{ fontSize: "0.6875rem" }}
            >
              Browse library, upload, or paste a URL
            </p>
          </div>
        </button>
      )}

      {showPicker && (
        <ImagePickerModal
          onSelect={handleSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

// ─── Image Picker Modal ─────────────────────────────────────────────────────

interface ImagePickerModalProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

function ImagePickerModal({ onSelect, onClose }: ImagePickerModalProps) {
  const [assets, setAssets] = useState<
    Array<{ name: string; path: string; public_url: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "url">(
    "library"
  );
  const [urlValue, setUrlValue] = useState("");
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploadingRef = useRef(false);

  const loadAssets = useCallback(() => {
    setLoading(true);
    listAssets()
      .then((data) => setAssets(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Failed to load assets:", e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const filtered = assets.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  // Process upload queue sequentially
  useEffect(() => {
    if (isUploadingRef.current) return;
    const nextPending = uploadQueue.findIndex(
      (item) => item.status === "pending"
    );
    if (nextPending === -1) return;

    isUploadingRef.current = true;
    setUploadQueue((prev) =>
      prev.map((item, idx) =>
        idx === nextPending
          ? { ...item, status: "uploading" as const }
          : item
      )
    );

    uploadAsset(
      uploadQueue[nextPending].file,
      `partner-${Date.now()}-${uploadQueue[nextPending].file.name}`
    )
      .then((result) => {
        setUploadQueue((prev) =>
          prev.map((item, idx) =>
            idx === nextPending
              ? {
                  ...item,
                  status: "done" as const,
                  publicUrl: result.public_url,
                }
              : item
          )
        );
      })
      .catch((e: any) => {
        setUploadQueue((prev) =>
          prev.map((item, idx) =>
            idx === nextPending
              ? { ...item, status: "error" as const, error: e.message }
              : item
          )
        );
      })
      .finally(() => {
        isUploadingRef.current = false;
        loadAssets();
      });
  }, [uploadQueue, loadAssets]);

  const addFiles = (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (imageFiles.length === 0) return;

    const newItems: UploadQueueItem[] = imageFiles.map((file) => ({
      file,
      name: file.name,
      status: "pending" as const,
      preview: URL.createObjectURL(file),
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const isAnyUploading = uploadQueue.some(
    (item) => item.status === "uploading" || item.status === "pending"
  );
  const doneCount = uploadQueue.filter((item) => item.status === "done").length;
  const totalCount = uploadQueue.length;
  const hasUploaded = doneCount > 0;

  return (
    <div
      className="fixed inset-0 bg-covenant-navy/30 backdrop-blur-sm z-[60]"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center p-6" onClick={(e) => e.stopPropagation()}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-mist/20 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-mist/20">
          <h3
            className="text-covenant-navy"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.0625rem",
              fontWeight: 700,
            }}
          >
            Select Image
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-field-sand/60 text-slate-text cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            {(
              [
                { key: "library" as const, label: "Asset Library" },
                { key: "upload" as const, label: "Upload" },
                { key: "url" as const, label: "Paste URL" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-field-sand text-covenant-navy"
                    : "text-slate-text hover:bg-field-sand/50"
                }`}
                style={{ fontSize: "0.8125rem", fontWeight: 600 }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "url" ? (
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                className="flex-1 bg-field-sand/50 border border-mist/30 rounded-xl px-4 py-3 text-ink placeholder:text-slate-text/30 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30"
                style={{ fontSize: "0.875rem" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && urlValue.trim())
                    onSelect(urlValue.trim());
                }}
                autoFocus
              />
              <button
                onClick={() => urlValue.trim() && onSelect(urlValue.trim())}
                disabled={!urlValue.trim()}
                className="px-5 py-3 bg-harvest-gold text-white rounded-xl hover:bg-[#c88e30] disabled:opacity-40 transition-colors cursor-pointer"
                style={{ fontSize: "0.875rem", fontWeight: 700 }}
              >
                <Check size={16} />
              </button>
            </div>
          ) : activeTab === "upload" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0)
                    addFiles(e.target.files);
                  e.target.value = "";
                }}
              />

              {/* Drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() =>
                  !isAnyUploading && fileInputRef.current?.click()
                }
                className={`rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  uploadQueue.length > 0 ? "py-8" : "py-16"
                } ${
                  dragOver
                    ? "border-harvest-gold bg-harvest-gold/5"
                    : "border-mist/40 hover:border-harvest-gold/30 bg-field-sand/10 hover:bg-harvest-gold/3"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`rounded-2xl bg-field-sand/60 flex items-center justify-center ${
                      uploadQueue.length > 0 ? "w-10 h-10" : "w-14 h-14"
                    }`}
                  >
                    <Upload
                      size={uploadQueue.length > 0 ? 16 : 22}
                      className="text-slate-text/30"
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-covenant-navy"
                      style={{
                        fontSize:
                          uploadQueue.length > 0 ? "0.75rem" : "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      {dragOver
                        ? "Drop images here"
                        : uploadQueue.length > 0
                        ? "Add more images"
                        : "Click to upload or drag and drop"}
                    </p>
                    <p
                      className="text-slate-text/35 mt-0.5"
                      style={{ fontSize: "0.6875rem" }}
                    >
                      PNG, JPG, WebP up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload queue / results */}
              {uploadQueue.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p
                      className="text-covenant-navy"
                      style={{ fontSize: "0.75rem", fontWeight: 700 }}
                    >
                      {isAnyUploading
                        ? `Uploading ${doneCount + 1} of ${totalCount}...`
                        : `${doneCount} image${doneCount !== 1 ? "s" : ""} uploaded`}
                    </p>
                    {!isAnyUploading && (
                      <button
                        onClick={() => setUploadQueue([])}
                        className="text-slate-text/40 hover:text-slate-text/60 transition-colors cursor-pointer"
                        style={{ fontSize: "0.6875rem" }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Progress bar */}
                  {isAnyUploading && (
                    <div className="w-full h-1.5 bg-field-sand rounded-full mb-3 overflow-hidden">
                      <div
                        className="h-full bg-harvest-gold rounded-full transition-all duration-300"
                        style={{
                          width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[220px] overflow-y-auto">
                    {uploadQueue.map((item, i) => (
                      <div key={`${item.name}-${i}`} className="relative">
                        <button
                          onClick={() =>
                            item.publicUrl && onSelect(item.publicUrl)
                          }
                          disabled={item.status !== "done"}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all w-full ${
                            item.status === "done"
                              ? "border-transparent hover:border-harvest-gold/50 cursor-pointer hover:scale-[1.02]"
                              : "border-transparent cursor-default"
                          }`}
                        >
                          <img
                            src={item.preview}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />

                          {/* Status overlay */}
                          {item.status === "pending" && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                              <div className="w-5 h-5 rounded-full border-2 border-mist/40" />
                            </div>
                          )}
                          {item.status === "uploading" && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                              <Loader2
                                size={16}
                                className="animate-spin text-harvest-gold"
                              />
                            </div>
                          )}
                          {item.status === "done" && (
                            <div className="absolute top-1.5 right-1.5">
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                                <Check size={10} className="text-white" />
                              </div>
                            </div>
                          )}
                          {item.status === "error" && (
                            <div className="absolute inset-0 bg-mission-red/10 flex items-center justify-center">
                              <X size={16} className="text-mission-red" />
                            </div>
                          )}
                        </button>
                        <p
                          className="text-slate-text/40 truncate mt-1 text-center"
                          style={{ fontSize: "0.5625rem" }}
                        >
                          {item.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  {hasUploaded && !isAnyUploading && (
                    <p
                      className="text-slate-text/30 mt-3 text-center"
                      style={{ fontSize: "0.6875rem" }}
                    >
                      Click an uploaded image to select it
                    </p>
                  )}
                </div>
              )}

              {uploadQueue.length === 0 && (
                <p
                  className="text-center text-slate-text/30 mt-3"
                  style={{ fontSize: "0.6875rem" }}
                >
                  Uploaded images are saved to your asset library
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="relative mb-4">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-text/30 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-field-sand/50 border border-mist/30 rounded-xl text-ink placeholder:text-slate-text/30 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30"
                  style={{ fontSize: "0.8125rem" }}
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2
                    size={20}
                    className="animate-spin text-harvest-gold"
                  />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon
                    size={28}
                    className="mx-auto text-slate-text/15 mb-3"
                  />
                  <p
                    className="text-slate-text/50"
                    style={{ fontSize: "0.8125rem" }}
                  >
                    {search
                      ? "No assets match your search."
                      : "No assets uploaded yet. Use the Upload tab."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[340px] overflow-y-auto">
                  {filtered.map((asset) => (
                    <button
                      key={asset.path}
                      onClick={() => onSelect(asset.public_url)}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-harvest-gold/50 transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <img
                        src={asset.public_url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}