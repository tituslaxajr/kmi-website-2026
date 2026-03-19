"use client"
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Type,
  Heading2,
  Heading3,
  Quote,
  Minus,
  ImageIcon,
  Youtube,
  List,
  ListOrdered,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  Search,
  Loader2,
  X,
  Check,
  Bold,
  Italic,
  Link,
  LayoutGrid,
  Upload,
} from "lucide-react";
import type { ContentBlock } from "../shared/StoryRenderer";
import { listAssets, uploadAsset } from "../../lib/api";

// ─── Block Menu Config ────────────────────────────────────────────────────

interface BlockMenuOption {
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

const BLOCK_MENU: BlockMenuOption[] = [
  { type: "paragraph", label: "Text", description: "Plain paragraph", icon: Type },
  { type: "heading-2", label: "Heading 2", description: "Large section heading", icon: Heading2 },
  { type: "heading-3", label: "Heading 3", description: "Small section heading", icon: Heading3 },
  { type: "quote", label: "Pull Quote", description: "Highlighted quotation", icon: Quote },
  { type: "divider", label: "Divider", description: "Visual separator", icon: Minus },
  { type: "image", label: "Image", description: "From asset library", icon: ImageIcon },
  { type: "embed", label: "YouTube Embed", description: "Paste a video URL", icon: Youtube },
  { type: "bullet-list", label: "Bullet List", description: "Unordered list", icon: List },
  { type: "numbered-list", label: "Numbered List", description: "Ordered list", icon: ListOrdered },
  { type: "gallery", label: "Gallery", description: "Multi-image grid", icon: LayoutGrid },
];

function createBlock(menuType: string): ContentBlock {
  switch (menuType) {
    case "heading-2":
      return { type: "heading", level: 2, content: "" };
    case "heading-3":
      return { type: "heading", level: 3, content: "" };
    case "quote":
      return { type: "quote", content: "" };
    case "divider":
      return { type: "divider" };
    case "image":
      return { type: "image", url: "", caption: "" };
    case "embed":
      return { type: "embed", url: "" };
    case "bullet-list":
      return { type: "bullet-list", items: [""] };
    case "numbered-list":
      return { type: "numbered-list", items: [""] };
    case "gallery":
      return { type: "gallery", images: [], columns: 2 };
    default:
      return { type: "paragraph", content: "" };
  }
}

// ─── Markdown Shortcut Detection ──────────────────────────────────────────
// Detects when a user types a markdown prefix at the start of an empty block

function detectMarkdownShortcut(text: string): string | null {
  if (text === "## ") return "heading-2";
  if (text === "### ") return "heading-3";
  if (text === "> ") return "quote";
  if (text === "- " || text === "* ") return "bullet-list";
  if (text === "1. ") return "numbered-list";
  if (text === "---" || text === "***") return "divider";
  return null;
}

// ─── Inline Format Helpers ────────────────────────────────────────────────

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  getCurrentValue: () => string,
  setValue: (v: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = getCurrentValue();
  const selected = value.slice(start, end);

  if (selected) {
    // Wrap selected text
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    setValue(newValue);
    // Re-select including markers
    requestAnimationFrame(() => {
      textarea.setSelectionRange(start + before.length, end + before.length);
      textarea.focus();
    });
  } else {
    // Insert markers with cursor between
    const newValue = value.slice(0, start) + before + after + value.slice(end);
    setValue(newValue);
    requestAnimationFrame(() => {
      textarea.setSelectionRange(start + before.length, start + before.length);
      textarea.focus();
    });
  }
}

// ─── Asset Picker Modal ───────────────────────────────────────────────────

interface AssetPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

interface UploadQueueItem {
  file: File;
  name: string;
  status: "pending" | "uploading" | "done" | "error";
  preview: string;
  publicUrl?: string;
  error?: string;
}

function AssetPicker({ onSelect, onClose }: AssetPickerProps) {
  const [assets, setAssets] = useState<Array<{ name: string; path: string; public_url: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "url">("library");
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

  useEffect(() => { loadAssets(); }, [loadAssets]);

  const filtered = assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  // Process upload queue sequentially
  useEffect(() => {
    if (isUploadingRef.current) return;
    const nextPending = uploadQueue.findIndex((item) => item.status === "pending");
    if (nextPending === -1) return;

    isUploadingRef.current = true;
    setUploadQueue((prev) => prev.map((item, idx) =>
      idx === nextPending ? { ...item, status: "uploading" as const } : item
    ));

    uploadAsset(uploadQueue[nextPending].file, `story-${Date.now()}-${uploadQueue[nextPending].file.name}`)
      .then((result) => {
        setUploadQueue((prev) => prev.map((item, idx) =>
          idx === nextPending ? { ...item, status: "done" as const, publicUrl: result.public_url } : item
        ));
      })
      .catch((e: any) => {
        setUploadQueue((prev) => prev.map((item, idx) =>
          idx === nextPending ? { ...item, status: "error" as const, error: e.message } : item
        ));
      })
      .finally(() => {
        isUploadingRef.current = false;
        loadAssets();
      });
  }, [uploadQueue, loadAssets]);

  const addFiles = (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
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

  const isAnyUploading = uploadQueue.some((item) => item.status === "uploading" || item.status === "pending");
  const doneCount = uploadQueue.filter((item) => item.status === "done").length;
  const totalCount = uploadQueue.length;
  const hasUploaded = doneCount > 0;

  return (
    <div className="fixed inset-0 bg-covenant-navy/30 backdrop-blur-sm z-50" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-mist/20 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-mist/20">
            <h3 className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "1.0625rem", fontWeight: 700 }}>
              Select Image
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-field-sand/60 text-slate-text cursor-pointer"><X size={18} /></button>
          </div>

          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              {([
                { key: "library" as const, label: "Asset Library" },
                { key: "upload" as const, label: "Upload" },
                { key: "url" as const, label: "Paste URL" },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${activeTab === tab.key ? "bg-field-sand text-covenant-navy" : "text-slate-text hover:bg-field-sand/50"}`}
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
                  onKeyDown={(e) => { if (e.key === "Enter" && urlValue.trim()) onSelect(urlValue.trim()); }}
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
                    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => !isAnyUploading && fileInputRef.current?.click()}
                  className={`rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                    uploadQueue.length > 0 ? "py-8" : "py-16"
                  } ${
                    dragOver
                      ? "border-harvest-gold bg-harvest-gold/5"
                      : "border-mist/40 hover:border-harvest-gold/30 bg-field-sand/10 hover:bg-harvest-gold/3"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`rounded-2xl bg-field-sand/60 flex items-center justify-center ${uploadQueue.length > 0 ? "w-10 h-10" : "w-14 h-14"}`}>
                      <Upload size={uploadQueue.length > 0 ? 16 : 22} className="text-slate-text/30" />
                    </div>
                    <div className="text-center">
                      <p className="text-covenant-navy" style={{ fontSize: uploadQueue.length > 0 ? "0.75rem" : "0.875rem", fontWeight: 600 }}>
                        {dragOver ? "Drop images here" : uploadQueue.length > 0 ? "Add more images" : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-slate-text/35 mt-0.5" style={{ fontSize: "0.6875rem" }}>
                        Select multiple files · PNG, JPG, WebP up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload queue / results */}
                {uploadQueue.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-covenant-navy" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
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
                          style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[220px] overflow-y-auto">
                      {uploadQueue.map((item, i) => (
                        <div key={`${item.name}-${i}`} className="relative">
                          <button
                            onClick={() => item.publicUrl && onSelect(item.publicUrl)}
                            disabled={item.status !== "done"}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all w-full ${
                              item.status === "done"
                                ? "border-transparent hover:border-harvest-gold/50 cursor-pointer hover:scale-[1.02]"
                                : "border-transparent cursor-default"
                            }`}
                          >
                            <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />

                            {/* Status overlay */}
                            {item.status === "pending" && (
                              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <div className="w-5 h-5 rounded-full border-2 border-mist/40" />
                              </div>
                            )}
                            {item.status === "uploading" && (
                              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <Loader2 size={16} className="animate-spin text-harvest-gold" />
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
                          <p className="text-slate-text/40 truncate mt-1 text-center" style={{ fontSize: "0.5625rem" }}>
                            {item.name}
                          </p>
                        </div>
                      ))}
                    </div>

                    {hasUploaded && !isAnyUploading && (
                      <p className="text-slate-text/30 mt-3 text-center" style={{ fontSize: "0.6875rem" }}>
                        Click an uploaded image to select it
                      </p>
                    )}
                  </div>
                )}

                {uploadQueue.length === 0 && (
                  <p className="text-center text-slate-text/30 mt-3" style={{ fontSize: "0.6875rem" }}>
                    Uploaded images are saved to your asset library
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="relative mb-4">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-text/30 pointer-events-none" />
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
                    <Loader2 size={20} className="animate-spin text-harvest-gold" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon size={28} className="mx-auto text-slate-text/15 mb-3" />
                    <p className="text-slate-text/50" style={{ fontSize: "0.8125rem" }}>
                      {search ? "No assets match your search." : "No assets uploaded yet. Use the Upload tab."}
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
                        <img src={asset.public_url} alt={asset.name} className="w-full h-full object-cover" />
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

// ─── Slash Command Menu ───────────────────────────────────────────────────

interface SlashMenuProps {
  query: string;
  onSelect: (menuType: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

function SlashMenu({ query, onSelect, onClose, position }: SlashMenuProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = BLOCK_MENU.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase()) ||
      opt.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIdx]) {
          onSelect(filtered[selectedIdx].type);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filtered, selectedIdx, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-xl shadow-xl border border-mist/30 py-2 w-[260px] z-50 max-h-[320px] overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      <p className="px-3.5 py-1.5 text-slate-text/40" style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Insert block
      </p>
      {filtered.map((opt, i) => (
        <button
          key={opt.type}
          onClick={() => onSelect(opt.type)}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left cursor-pointer transition-colors ${
            i === selectedIdx ? "bg-harvest-gold/8 text-covenant-navy" : "hover:bg-field-sand/40 text-slate-text"
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i === selectedIdx ? "bg-harvest-gold/12" : "bg-field-sand/60"}`}>
            <opt.icon size={14} className={i === selectedIdx ? "text-harvest-gold" : "text-slate-text/50"} />
          </div>
          <div>
            <p style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{opt.label}</p>
            <p className="text-slate-text/40" style={{ fontSize: "0.6875rem" }}>{opt.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Inline Formatting Toolbar ────────────────────────────────────────────

interface FloatingToolbarProps {
  position: { top: number; left: number };
  onBold: () => void;
  onItalic: () => void;
  onLink: () => void;
}

function FloatingToolbar({ position, onBold, onItalic, onLink }: FloatingToolbarProps) {
  return (
    <div
      className="fixed z-50 flex items-center gap-0.5 bg-covenant-navy rounded-lg shadow-xl p-1"
      style={{ top: position.top - 44, left: position.left }}
    >
      <button
        onMouseDown={(e) => { e.preventDefault(); onBold(); }}
        className="p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        title="Bold (Cmd+B)"
      >
        <Bold size={14} />
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); onItalic(); }}
        className="p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        title="Italic (Cmd+I)"
      >
        <Italic size={14} />
      </button>
      <button
        onMouseDown={(e) => { e.preventDefault(); onLink(); }}
        className="p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        title="Link (Cmd+K)"
      >
        <Link size={14} />
      </button>
    </div>
  );
}

// ─── Individual Block Editors ─────────────────────────────────────────────

interface BlockEditorProps {
  block: ContentBlock;
  index: number;
  focused: boolean;
  onChange: (block: ContentBlock) => void;
  onFocus: () => void;
  onDelete: () => void;
  onEnter: () => void;
  onSlash: (rect: DOMRect) => void;
  onSlashQuery: (q: string) => void;
  slashActive: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onOpenAssetPicker: () => void;
  onConvertBlock: (menuType: string) => void;
}

function BlockEditor({
  block,
  index,
  focused,
  onChange,
  onFocus,
  onDelete,
  onEnter,
  onSlash,
  onSlashQuery,
  slashActive,
  onMoveUp,
  onMoveDown,
  onOpenAssetPicker,
  onConvertBlock,
}: BlockEditorProps) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [slashStr, setSlashStr] = useState("");
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });

  // Track selection for floating toolbar
  const checkSelection = useCallback(() => {
    if (!textRef.current) return;
    const start = textRef.current.selectionStart;
    const end = textRef.current.selectionEnd;
    if (start !== end) {
      const rect = textRef.current.getBoundingClientRect();
      setToolbarPos({
        top: rect.top,
        left: rect.left + (rect.width / 2) - 60,
      });
      setShowFloatingToolbar(true);
    } else {
      setShowFloatingToolbar(false);
    }
  }, []);

  const getTextContent = useCallback((): string => {
    if (block.type === "paragraph" || block.type === "quote" || block.type === "heading") {
      return block.content;
    }
    return "";
  }, [block]);

  const setTextContent = useCallback((newContent: string) => {
    if (block.type === "paragraph" || block.type === "quote" || block.type === "heading") {
      onChange({ ...block, content: newContent });
    }
  }, [block, onChange]);

  const handleBold = useCallback(() => {
    if (textRef.current) wrapSelection(textRef.current, "**", "**", getTextContent, setTextContent);
  }, [getTextContent, setTextContent]);

  const handleItalic = useCallback(() => {
    if (textRef.current) wrapSelection(textRef.current, "*", "*", getTextContent, setTextContent);
  }, [getTextContent, setTextContent]);

  const handleLink = useCallback(() => {
    if (!textRef.current) return;
    const start = textRef.current.selectionStart;
    const end = textRef.current.selectionEnd;
    const value = getTextContent();
    const selected = value.slice(start, end);
    const url = prompt("Enter URL:", "https://");
    if (url) {
      const linkText = selected || "link text";
      const newValue = value.slice(0, start) + `[${linkText}](${url})` + value.slice(end);
      setTextContent(newValue);
    }
  }, [getTextContent, setTextContent]);

  const handleTextChange = (content: string) => {
    // Check for markdown shortcuts (only on paragraph blocks with fresh content)
    if (block.type === "paragraph" && !slashActive) {
      const shortcut = detectMarkdownShortcut(content);
      if (shortcut) {
        onConvertBlock(shortcut);
        return;
      }
    }

    // Check for slash command
    if (content.startsWith("/") && !slashActive) {
      const rect = textRef.current?.getBoundingClientRect();
      if (rect) onSlash(rect);
      setSlashStr("");
      return;
    }

    if (slashActive) {
      if (content.startsWith("/")) {
        const query = content.slice(1);
        setSlashStr(query);
        onSlashQuery(query);
        return;
      }
    }

    if (block.type === "paragraph" || block.type === "quote") {
      onChange({ ...block, content });
    } else if (block.type === "heading") {
      onChange({ ...block, content });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Inline formatting shortcuts
    const isMod = e.metaKey || e.ctrlKey;
    if (isMod && e.key === "b") {
      e.preventDefault();
      handleBold();
      return;
    }
    if (isMod && e.key === "i") {
      e.preventDefault();
      handleItalic();
      return;
    }
    if (isMod && e.key === "k") {
      e.preventDefault();
      handleLink();
      return;
    }

    // Block reorder shortcuts: Cmd+Shift+Arrow
    if (isMod && e.shiftKey && e.key === "ArrowUp") {
      e.preventDefault();
      onMoveUp();
      return;
    }
    if (isMod && e.shiftKey && e.key === "ArrowDown") {
      e.preventDefault();
      onMoveDown();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey && !slashActive) {
      e.preventDefault();
      onEnter();
    }
    if (e.key === "Backspace" && !slashActive) {
      const target = e.target as HTMLTextAreaElement;
      if (target.value === "") {
        e.preventDefault();
        onDelete();
      }
    }
  };

  // Auto-resize textarea
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    if (focused && textRef.current) {
      textRef.current.focus();
      const len = textRef.current.value.length;
      textRef.current.setSelectionRange(len, len);
    }
  }, [focused]);

  useEffect(() => {
    autoResize(textRef.current);
  }, [block]);

  const textAreaClass = "w-full bg-transparent border-0 outline-none resize-none text-ink placeholder:text-slate-text/25 leading-relaxed";

  const renderFloating = showFloatingToolbar && focused && (block.type === "paragraph" || block.type === "heading" || block.type === "quote");

  // Render different block types
  switch (block.type) {
    case "paragraph":
      return (
        <div className="relative">
          {renderFloating && (
            <FloatingToolbar position={toolbarPos} onBold={handleBold} onItalic={handleItalic} onLink={handleLink} />
          )}
          <textarea
            ref={textRef}
            value={slashActive ? "/" + slashStr : block.content}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onSelect={checkSelection}
            onBlur={() => setShowFloatingToolbar(false)}
            placeholder="Start writing, or type / for commands..."
            className={textAreaClass}
            style={{ fontSize: "1.0625rem", lineHeight: "1.85" }}
            rows={1}
            onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
          />
        </div>
      );

    case "heading":
      return (
        <div className="relative">
          {renderFloating && (
            <FloatingToolbar position={toolbarPos} onBold={handleBold} onItalic={handleItalic} onLink={handleLink} />
          )}
          <textarea
            ref={textRef}
            value={block.content}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onSelect={checkSelection}
            onBlur={() => setShowFloatingToolbar(false)}
            placeholder={block.level === 2 ? "Section heading..." : "Sub-heading..."}
            className={textAreaClass}
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: block.level === 2 ? "1.5rem" : "1.1875rem",
              fontWeight: block.level === 2 ? 800 : 700,
              letterSpacing: "-0.02em",
              lineHeight: "1.4",
            }}
            rows={1}
            onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
          />
        </div>
      );

    case "quote":
      return (
        <div className="relative">
          {renderFloating && (
            <FloatingToolbar position={toolbarPos} onBold={handleBold} onItalic={handleItalic} onLink={handleLink} />
          )}
          <div className="relative rounded-xl bg-covenant-navy/[0.02] border border-harvest-gold/15 px-6 py-5">
            {/* Decorative open quote */}
            <span
              className="absolute -top-3 left-4 text-harvest-gold/25 select-none pointer-events-none"
              style={{ fontFamily: "Georgia, serif", fontSize: "4rem", lineHeight: "1" }}
              aria-hidden="true"
            >&ldquo;</span>
            <textarea
              ref={textRef}
              value={block.content}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onSelect={checkSelection}
              onBlur={() => setShowFloatingToolbar(false)}
              placeholder="Enter a pull quote..."
              className={textAreaClass + " text-covenant-navy/70 pl-4"}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.125rem",
                fontWeight: 600,
                fontStyle: "italic",
                lineHeight: "1.65",
              }}
              rows={1}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            />
            {/* Decorative close quote */}
            {block.content && (
              <span
                className="absolute -bottom-4 right-5 text-harvest-gold/15 select-none pointer-events-none"
                style={{ fontFamily: "Georgia, serif", fontSize: "4rem", lineHeight: "1" }}
                aria-hidden="true"
              >&rdquo;</span>
            )}
            {/* Gold accent bar */}
            <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-harvest-gold/40" />
          </div>
        </div>
      );

    case "divider":
      return (
        <div className="flex items-center gap-2 py-3 cursor-default" onClick={onFocus}>
          <div className="h-[2px] flex-1 bg-mist/50 rounded-full" />
          <div className="h-[2px] w-2 bg-harvest-gold/30 rounded-full" />
          <div className="h-[2px] w-8 bg-harvest-gold/50 rounded-full" />
          <div className="h-[2px] w-2 bg-harvest-gold/30 rounded-full" />
          <div className="h-[2px] flex-1 bg-mist/50 rounded-full" />
        </div>
      );

    case "image":
      return (
        <div className="space-y-3" onClick={onFocus}>
          {block.url ? (
            <div className="rounded-xl overflow-hidden">
              <img src={block.url} alt={block.caption} className="w-full h-auto max-h-[400px] object-cover" />
            </div>
          ) : (
            <button
              onClick={onOpenAssetPicker}
              className="w-full py-12 rounded-xl border-2 border-dashed border-mist/40 hover:border-harvest-gold/30 bg-field-sand/20 hover:bg-harvest-gold/5 transition-all cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-field-sand/60 flex items-center justify-center">
                <ImageIcon size={18} className="text-slate-text/30" />
              </div>
              <div className="text-center">
                <p className="text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Add an image</p>
                <p className="text-slate-text/40" style={{ fontSize: "0.6875rem" }}>Choose from library or paste a URL</p>
              </div>
            </button>
          )}
          {block.url && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={block.caption}
                onChange={(e) => onChange({ ...block, caption: e.target.value })}
                placeholder="Add a caption (optional)"
                className="flex-1 bg-transparent border-0 outline-none text-slate-text/50 placeholder:text-slate-text/20 text-center"
                style={{ fontSize: "0.8125rem", fontStyle: "italic" }}
              />
              <button
                onClick={onOpenAssetPicker}
                className="text-slate-text/30 hover:text-harvest-gold transition-colors cursor-pointer p-1"
                title="Change image"
              >
                <ImageIcon size={14} />
              </button>
            </div>
          )}
        </div>
      );

    case "embed":
      return (
        <div className="space-y-3" onClick={onFocus}>
          <input
            ref={textRef as any}
            type="url"
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
            onFocus={onFocus}
            placeholder="Paste YouTube URL (e.g. https://youtube.com/watch?v=...)"
            className="w-full bg-field-sand/30 border border-mist/30 rounded-xl px-4 py-3 text-ink placeholder:text-slate-text/25 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30"
            style={{ fontSize: "0.875rem" }}
          />
          {block.url && (() => {
            const match = block.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
            const videoId = match ? match[1] : null;
            if (!videoId) return null;
            return (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-ink/5">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            );
          })()}
        </div>
      );

    case "bullet-list":
    case "numbered-list": {
      const isOrdered = block.type === "numbered-list";
      return (
        <div className="space-y-1.5" onClick={onFocus}>
          {block.items.map((item, j) => (
            <div key={j} className="flex items-start gap-2">
              <span className="text-harvest-gold/50 mt-2 shrink-0 w-5 text-right" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                {isOrdered ? `${j + 1}.` : "•"}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const items = [...block.items];
                  items[j] = e.target.value;
                  onChange({ ...block, items } as ContentBlock);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const items = [...block.items];
                    items.splice(j + 1, 0, "");
                    onChange({ ...block, items } as ContentBlock);
                  }
                  if (e.key === "Backspace" && item === "") {
                    e.preventDefault();
                    if (block.items.length <= 1) {
                      onDelete();
                      return;
                    }
                    const items = block.items.filter((_, k) => k !== j);
                    onChange({ ...block, items } as ContentBlock);
                  }
                }}
                className="flex-1 bg-transparent border-0 outline-none text-ink/80 placeholder:text-slate-text/20"
                style={{ fontSize: "1.0625rem", lineHeight: "1.8" }}
                placeholder="List item..."
              />
            </div>
          ))}
        </div>
      );
    }

    case "gallery": {
      const galleryImages = block.images;
      return (
        <div className="space-y-3" onClick={onFocus}>
          {/* Column toggle + image count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid size={14} className="text-harvest-gold" />
              <span className="text-slate-text/50" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>
                {galleryImages.length} {galleryImages.length === 1 ? "image" : "images"}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-field-sand/40 rounded-lg p-0.5">
              {([2, 3] as const).map((cols) => (
                <button
                  key={cols}
                  onClick={() => onChange({ ...block, columns: cols })}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    block.columns === cols
                      ? "bg-white text-covenant-navy shadow-sm"
                      : "text-slate-text/40 hover:text-covenant-navy"
                  }`}
                  style={{ fontSize: "0.625rem", fontWeight: 700 }}
                >
                  {cols} col
                </button>
              ))}
            </div>
          </div>

          {/* Image grid preview */}
          {galleryImages.length > 0 && (
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${block.columns}, 1fr)` }}
            >
              {galleryImages.map((img, j) => (
                <div key={j} className="relative group/img">
                  <div className="rounded-lg overflow-hidden aspect-[4/3] bg-field-sand/30">
                    <img
                      src={img.url}
                      alt={img.caption || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Hover controls */}
                  <div className="absolute inset-0 bg-covenant-navy/30 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    {j > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const imgs = [...galleryImages];
                          [imgs[j - 1], imgs[j]] = [imgs[j], imgs[j - 1]];
                          onChange({ ...block, images: imgs });
                        }}
                        className="p-1.5 rounded-lg bg-white/90 text-covenant-navy hover:bg-white transition-colors cursor-pointer"
                        title="Move left"
                      >
                        <ChevronUp size={12} className="rotate-[-90deg]" />
                      </button>
                    )}
                    {j < galleryImages.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const imgs = [...galleryImages];
                          [imgs[j], imgs[j + 1]] = [imgs[j + 1], imgs[j]];
                          onChange({ ...block, images: imgs });
                        }}
                        className="p-1.5 rounded-lg bg-white/90 text-covenant-navy hover:bg-white transition-colors cursor-pointer"
                        title="Move right"
                      >
                        <ChevronDown size={12} className="rotate-[-90deg]" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const imgs = galleryImages.filter((_, k) => k !== j);
                        onChange({ ...block, images: imgs });
                      }}
                      className="p-1.5 rounded-lg bg-white/90 text-mission-red hover:bg-white transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {/* Caption input */}
                  <input
                    type="text"
                    value={img.caption}
                    onChange={(e) => {
                      const imgs = [...galleryImages];
                      imgs[j] = { ...imgs[j], caption: e.target.value };
                      onChange({ ...block, images: imgs });
                    }}
                    placeholder="Caption..."
                    className="w-full mt-1.5 bg-transparent border-0 outline-none text-slate-text/40 placeholder:text-slate-text/15 text-center"
                    style={{ fontSize: "0.6875rem", fontStyle: "italic" }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add image button */}
          <button
            onClick={onOpenAssetPicker}
            className="w-full py-8 rounded-xl border-2 border-dashed border-mist/30 hover:border-harvest-gold/25 bg-field-sand/10 hover:bg-harvest-gold/3 transition-all cursor-pointer flex flex-col items-center gap-2"
          >
            <div className="w-9 h-9 rounded-lg bg-field-sand/60 flex items-center justify-center">
              <Plus size={16} className="text-slate-text/30" />
            </div>
            <div className="text-center">
              <p className="text-covenant-navy" style={{ fontSize: "0.75rem", fontWeight: 600 }}>Add image to gallery</p>
              <p className="text-slate-text/30" style={{ fontSize: "0.625rem" }}>From asset library or paste a URL</p>
            </div>
          </button>
        </div>
      );
    }

    default:
      return null;
  }
}

// ─── Main Block Editor ────────────────────────────────────────────────────

interface StoryBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  onSave?: () => void;
  onPublish?: () => void;
}

export function StoryBlockEditor({ blocks, onChange, onSave, onPublish }: StoryBlockEditorProps) {
  const [focusedIdx, setFocusedIdx] = useState<number>(0);
  const [slashMenu, setSlashMenu] = useState<{ blockIdx: number; position: { top: number; left: number }; query: string } | null>(null);
  const [assetPickerIdx, setAssetPickerIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateBlock = useCallback((idx: number, block: ContentBlock) => {
    const next = [...blocks];
    next[idx] = block;
    onChange(next);
  }, [blocks, onChange]);

  const deleteBlock = useCallback((idx: number) => {
    if (blocks.length <= 1) {
      onChange([{ type: "paragraph", content: "" }]);
      setFocusedIdx(0);
      return;
    }
    const next = blocks.filter((_, i) => i !== idx);
    onChange(next);
    setFocusedIdx(Math.max(0, idx - 1));
  }, [blocks, onChange]);

  const insertAfter = useCallback((idx: number, block?: ContentBlock) => {
    const next = [...blocks];
    const newBlock = block || { type: "paragraph" as const, content: "" };
    next.splice(idx + 1, 0, newBlock);
    onChange(next);
    setFocusedIdx(idx + 1);
  }, [blocks, onChange]);

  const moveBlock = useCallback((idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onChange(next);
    setFocusedIdx(newIdx);
  }, [blocks, onChange]);

  const convertBlock = useCallback((idx: number, menuType: string) => {
    const newBlock = createBlock(menuType);
    const next = [...blocks];
    next[idx] = newBlock;
    onChange(next);
    setFocusedIdx(idx);
    if (menuType === "image") {
      setTimeout(() => setAssetPickerIdx(idx), 100);
    }
  }, [blocks, onChange]);

  const handleSlashSelect = useCallback((menuType: string) => {
    if (slashMenu === null) return;
    const idx = slashMenu.blockIdx;
    convertBlock(idx, menuType);
    setSlashMenu(null);
  }, [slashMenu, convertBlock]);

  const handleAssetSelect = useCallback((url: string) => {
    if (assetPickerIdx === null) return;
    const block = blocks[assetPickerIdx];
    if (block.type === "image") {
      updateBlock(assetPickerIdx, { ...block, url });
    } else if (block.type === "gallery") {
      updateBlock(assetPickerIdx, {
        ...block,
        images: [...block.images, { url, caption: "" }],
      });
      // Don't close — allow adding multiple images in succession
      return;
    }
    setAssetPickerIdx(null);
  }, [assetPickerIdx, blocks, updateBlock]);

  // Global keyboard shortcuts: Cmd+S save, Cmd+Enter publish
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
      if (isMod && e.key === "Enter") {
        e.preventDefault();
        onPublish?.();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, onPublish]);

  // Close slash menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (slashMenu) setSlashMenu(null);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [slashMenu]);

  return (
    <div ref={containerRef} className="relative">
      <div className="space-y-1">
        {blocks.map((block, idx) => (
          <div
            key={idx}
            className={`group relative flex items-start gap-0 transition-all duration-200`}
          >
            {/* Block controls — left gutter */}
            <div className={`flex items-center gap-0.5 pt-2 pr-2 shrink-0 transition-opacity duration-200 ${
              focusedIdx === idx ? "opacity-100" : "opacity-0 group-hover:opacity-60"
            }`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  insertAfter(idx - 1);
                }}
                className="p-1 rounded text-slate-text/25 hover:text-harvest-gold hover:bg-harvest-gold/8 transition-colors cursor-pointer"
                title="Add block above"
              >
                <Plus size={14} />
              </button>
              <div className="flex flex-col">
                <button
                  onClick={() => moveBlock(idx, -1)}
                  disabled={idx === 0}
                  className="p-0.5 rounded text-slate-text/20 hover:text-covenant-navy disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-default"
                >
                  <ChevronUp size={11} />
                </button>
                <button
                  onClick={() => moveBlock(idx, 1)}
                  disabled={idx === blocks.length - 1}
                  className="p-0.5 rounded text-slate-text/20 hover:text-covenant-navy disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-default"
                >
                  <ChevronDown size={11} />
                </button>
              </div>
            </div>

            {/* Block content */}
            <div className={`flex-1 min-w-0 py-1.5 px-1 rounded-lg transition-all`}>
              <BlockEditor
                block={block}
                index={idx}
                focused={focusedIdx === idx}
                onChange={(b) => updateBlock(idx, b)}
                onFocus={() => {
                  setFocusedIdx(idx);
                  if (slashMenu && slashMenu.blockIdx !== idx) setSlashMenu(null);
                }}
                onDelete={() => deleteBlock(idx)}
                onEnter={() => insertAfter(idx)}
                onSlash={(rect) => {
                  setSlashMenu({
                    blockIdx: idx,
                    position: { top: rect.bottom + 4, left: rect.left },
                    query: "",
                  });
                }}
                onSlashQuery={(q) => {
                  setSlashMenu((prev) => prev ? { ...prev, query: q } : null);
                }}
                slashActive={slashMenu?.blockIdx === idx}
                onMoveUp={() => moveBlock(idx, -1)}
                onMoveDown={() => moveBlock(idx, 1)}
                onOpenAssetPicker={() => setAssetPickerIdx(idx)}
                onConvertBlock={(menuType) => convertBlock(idx, menuType)}
              />
            </div>

            {/* Delete — right gutter */}
            <div className={`pt-2 pl-1 shrink-0 transition-opacity duration-200 ${
              focusedIdx === idx && blocks.length > 1 ? "opacity-100" : "opacity-0 group-hover:opacity-40"
            }`}>
              <button
                onClick={() => deleteBlock(idx)}
                className="p-1 rounded text-slate-text/25 hover:text-mission-red hover:bg-mission-red/5 transition-colors cursor-pointer"
                title="Delete block"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add block button at bottom */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => insertAfter(blocks.length - 1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-text/30 hover:text-harvest-gold hover:bg-harvest-gold/5 transition-all cursor-pointer"
          style={{ fontSize: "0.75rem", fontWeight: 600 }}
        >
          <Plus size={14} /> Add block
        </button>
      </div>

      {/* Slash Command Menu */}
      {slashMenu && (
        <SlashMenu
          query={slashMenu.query}
          onSelect={handleSlashSelect}
          onClose={() => setSlashMenu(null)}
          position={slashMenu.position}
        />
      )}

      {/* Asset Picker Modal */}
      {assetPickerIdx !== null && (
        <AssetPicker
          onSelect={handleAssetSelect}
          onClose={() => setAssetPickerIdx(null)}
        />
      )}
    </div>
  );
}