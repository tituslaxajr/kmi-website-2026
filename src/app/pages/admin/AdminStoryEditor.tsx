"use client"
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  Pencil,
  Monitor,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  Settings2,
  Clock,
  LetterText,
  ImageIcon,
  Trash2,
  History,
  RotateCcw,
  CalendarClock,
  Search,
  Quote,
  Sparkles,
  Plus,
  Check,
  Upload,
} from "lucide-react";
import {
  getStory,
  saveStory,
  sendNewsletter,
  getNewsletterLog,
  getPartners,
  saveRevision,
  getRevisions,
  listAssets,
  uploadAsset,
} from "../../lib/api";
import { StoryBlockEditor } from "../../components/admin/StoryBlockEditor";
import {
  StoryRenderer,
  type ContentBlock,
  parseContent,
  blocksToPlainText,
  countWords,
  countCharacters,
  estimateReadingTime,
} from "../../components/shared/StoryRenderer";

const CATEGORIES = ["Community", "Education", "Relief", "Church", "Testimony", "Missions"];

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ─── Auto-Quote Extraction ────────────────────────────────────────────────

interface QuoteCandidate {
  text: string;
  score: number;
  sourceBlockIndex: number;
}

const IMPACT_WORDS = new Set([
  "god", "jesus", "christ", "faith", "hope", "love", "grace", "prayer", "miracle",
  "transform", "transformed", "transformation", "changed", "healing", "healed",
  "blessed", "blessing", "salvation", "redeemed", "forgiven", "mercy",
  "community", "together", "mission", "purpose", "calling", "serve", "serving",
  "children", "families", "church", "gospel", "worship", "praise",
  "overcome", "overcame", "victory", "breakthrough", "impossible", "amazing",
  "incredible", "beautiful", "powerful", "heart", "soul", "spirit",
  "never", "always", "first", "finally", "everything", "nothing",
  "believe", "dream", "journey", "story",
]);

const STRONG_STARTERS = new Set([
  "we", "i", "this", "god", "when", "for", "it", "there", "every",
  "what", "sometimes", "through", "despite", "in",
]);

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/([.!?])\s+/g, "$1|||")
    .split("|||")
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function scoreSentence(sentence: string): number {
  const words = sentence.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  let score = 0;

  // Length score: sweet spot is 10-30 words
  if (wordCount >= 10 && wordCount <= 30) score += 20;
  else if (wordCount >= 7 && wordCount <= 40) score += 10;
  else if (wordCount < 5 || wordCount > 50) score -= 15;

  // Impact words
  const impactCount = words.filter((w) => IMPACT_WORDS.has(w.replace(/[^a-z]/g, ""))).length;
  score += impactCount * 8;

  // Strong starters
  const firstWord = words[0]?.replace(/[^a-z]/g, "") || "";
  if (STRONG_STARTERS.has(firstWord)) score += 5;

  // First person (personal & relatable)
  const firstPerson = words.filter((w) => ["i", "we", "my", "our", "us", "me"].includes(w)).length;
  score += Math.min(firstPerson * 4, 12);

  // Emotional punctuation
  if (sentence.includes("!")) score += 3;
  if (sentence.includes("—") || sentence.includes("–")) score += 4;

  // Penalize questions (less quotable as pullouts)
  if (sentence.endsWith("?")) score -= 5;

  // Penalize very generic / connective sentences
  const generics = ["however", "therefore", "additionally", "furthermore", "moreover", "also"];
  if (generics.some((g) => firstWord === g)) score -= 10;

  // Boost if starts with a quote-worthy phrase
  const lc = sentence.toLowerCase();
  if (lc.startsWith("this is") || lc.startsWith("that was") || lc.startsWith("it was")) score += 3;

  return score;
}

function extractQuoteCandidates(blocks: ContentBlock[], maxResults = 5): QuoteCandidate[] {
  const candidates: QuoteCandidate[] = [];

  blocks.forEach((block, blockIndex) => {
    if (block.type !== "paragraph" || !block.content?.trim()) return;
    // Strip markdown formatting for analysis
    const raw = block.content
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

    const sentences = splitIntoSentences(raw);
    for (const sentence of sentences) {
      const score = scoreSentence(sentence);
      if (score > 10) {
        candidates.push({ text: sentence, score, sourceBlockIndex: blockIndex });
      }
    }
  });

  // Sort by score descending and return top N
  candidates.sort((a, b) => b.score - a.score);
  // Deduplicate — avoid two quotes from the same block
  const seen = new Set<number>();
  const unique: QuoteCandidate[] = [];
  for (const c of candidates) {
    if (!seen.has(c.sourceBlockIndex)) {
      unique.push(c);
      seen.add(c.sourceBlockIndex);
    }
    if (unique.length >= maxResults) break;
  }
  return unique;
}

function AutoQuoteModal({
  candidates,
  insertedIndices,
  onInsert,
  onClose,
}: {
  candidates: QuoteCandidate[];
  insertedIndices: Set<number>;
  onInsert: (candidate: QuoteCandidate) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-covenant-navy/20 backdrop-blur-sm z-50" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-mist/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-harvest-gold/10 flex items-center justify-center">
              <Sparkles size={16} className="text-harvest-gold" />
            </div>
            <div>
              <h3 className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700 }}>
                Auto-Quote Suggestions
              </h3>
              <p className="text-slate-text/45" style={{ fontSize: "0.6875rem" }}>
                Select quotes to insert as pullouts in your story
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-field-sand/60 text-slate-text cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Candidates list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {candidates.length === 0 ? (
            <div className="text-center py-12">
              <Quote size={32} className="mx-auto text-slate-text/15 mb-3" />
              <p className="text-slate-text/40" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                No strong quotes found
              </p>
              <p className="text-slate-text/30 mt-1" style={{ fontSize: "0.75rem" }}>
                Write more paragraph content and try again — impactful, mid-length sentences work best.
              </p>
            </div>
          ) : (
            candidates.map((candidate, i) => {
              const isInserted = insertedIndices.has(i);
              return (
                <div
                  key={i}
                  className={`relative rounded-xl border p-4 transition-all ${
                    isInserted
                      ? "border-green-200 bg-green-50/50"
                      : "border-mist/25 hover:border-harvest-gold/30 bg-white hover:bg-harvest-gold/[0.02]"
                  }`}
                >
                  {/* Score badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md ${
                          candidate.score >= 30
                            ? "bg-harvest-gold/15 text-harvest-gold"
                            : candidate.score >= 20
                            ? "bg-field-sand text-slate-text/60"
                            : "bg-mist/30 text-slate-text/40"
                        }`}
                        style={{ fontSize: "0.5625rem", fontWeight: 700 }}
                      >
                        {candidate.score >= 30 ? "Strong" : candidate.score >= 20 ? "Good" : "Fair"}
                      </span>
                    </div>
                    {isInserted ? (
                      <span className="flex items-center gap-1 text-green-600" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>
                        <Check size={12} /> Inserted
                      </span>
                    ) : (
                      <button
                        onClick={() => onInsert(candidate)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-harvest-gold/8 hover:bg-harvest-gold/15 text-harvest-gold transition-colors cursor-pointer"
                        style={{ fontSize: "0.6875rem", fontWeight: 600 }}
                      >
                        <Plus size={11} /> Insert
                      </button>
                    )}
                  </div>

                  {/* Quote preview */}
                  <div className="relative pl-4">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full bg-harvest-gold/30" />
                    <p
                      className="text-covenant-navy/70"
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "0.875rem",
                        lineHeight: "1.6",
                        fontWeight: 600,
                        fontStyle: "italic",
                      }}
                    >
                      &ldquo;{candidate.text}&rdquo;
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-mist/20 px-5 py-3.5 flex items-center justify-between">
          <p className="text-slate-text/30" style={{ fontSize: "0.6875rem" }}>
            Quotes are scored by impact, length, and emotional resonance
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-field-sand/60 hover:bg-field-sand text-covenant-navy transition-colors cursor-pointer"
            style={{ fontSize: "0.8125rem", fontWeight: 600 }}
          >
            Done
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── Revision History Drawer ──────────────────────────────────────────────

interface Revision {
  key: string;
  title: string;
  summary: string;
  content: any;
  saved_at: string;
  published: boolean;
}

function RevisionDrawer({
  revisions,
  loading,
  onRestore,
  onClose,
}: {
  revisions: Revision[];
  loading: boolean;
  onRestore: (revision: Revision) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-covenant-navy/20 backdrop-blur-sm z-50" onClick={onClose}>
      <div
        className="relative h-full w-full"
      >
      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl border-l border-mist/20 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-mist/20">
          <div className="flex items-center gap-2.5">
            <History size={16} className="text-harvest-gold" />
            <h3 className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700 }}>
              Revision History
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-field-sand/60 text-slate-text cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-harvest-gold" />
            </div>
          ) : revisions.length === 0 ? (
            <div className="text-center py-16">
              <History size={32} className="mx-auto text-slate-text/15 mb-3" />
              <p className="text-slate-text/40" style={{ fontSize: "0.8125rem" }}>No revisions saved yet.</p>
              <p className="text-slate-text/30 mt-1" style={{ fontSize: "0.6875rem" }}>Revisions are saved on each manual save.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {revisions.map((rev, i) => {
                const date = new Date(rev.saved_at);
                const isLatest = i === 0;
                return (
                  <div
                    key={rev.key}
                    className={`p-4 rounded-xl border transition-colors ${
                      isLatest ? "border-harvest-gold/30 bg-harvest-gold/3" : "border-mist/20 hover:border-mist/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                          {rev.title || "Untitled"}
                        </span>
                        {isLatest && (
                          <span className="px-1.5 py-0.5 rounded bg-harvest-gold/10 text-harvest-gold" style={{ fontSize: "0.5625rem", fontWeight: 700 }}>
                            Latest
                          </span>
                        )}
                      </div>
                      {rev.published && (
                        <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-700" style={{ fontSize: "0.5625rem", fontWeight: 700 }}>
                          Published
                        </span>
                      )}
                    </div>
                    <p className="text-slate-text/40 mb-3" style={{ fontSize: "0.6875rem" }}>
                      {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at{" "}
                      {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                    {!isLatest && (
                      <button
                        onClick={() => onRestore(rev)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-field-sand/60 hover:bg-harvest-gold/10 text-slate-text hover:text-covenant-navy transition-colors cursor-pointer"
                        style={{ fontSize: "0.6875rem", fontWeight: 600 }}
                      >
                        <RotateCcw size={11} /> Restore this version
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────

export function AdminStoryEditor() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const isNew = !id || id === "new";

  // ─── State ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>([{ type: "paragraph", content: "" }]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [category, setCategory] = useState("Community");
  const [published, setPublished] = useState(false);
  const [sendNewsletterFlag, setSendNewsletterFlag] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(id && id !== "new" ? id : null);
  const [publishAt, setPublishAt] = useState("");

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  const [newsletterLog, setNewsletterLog] = useState<any>(null);

  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [revisionsLoading, setRevisionsLoading] = useState(false);

  // Auto-quote state
  const [autoQuoteOpen, setAutoQuoteOpen] = useState(false);
  const [autoQuoteCandidates, setAutoQuoteCandidates] = useState<QuoteCandidate[]>([]);
  const [autoQuoteInserted, setAutoQuoteInserted] = useState<Set<number>>(new Set());

  // Cover image picker state
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [coverAssets, setCoverAssets] = useState<Array<{ name: string; path: string; public_url: string }>>([]);
  const [coverAssetsLoading, setCoverAssetsLoading] = useState(false);
  const [coverTab, setCoverTab] = useState<"library" | "upload" | "url">("upload");
  const [coverUrlValue, setCoverUrlValue] = useState("");
  const [coverUploadQueue, setCoverUploadQueue] = useState<Array<{
    file: File; name: string; status: "pending" | "uploading" | "done" | "error";
    preview: string; publicUrl?: string; error?: string;
  }>>([]);
  const [coverDragOver, setCoverDragOver] = useState(false);
  const [coverSearch, setCoverSearch] = useState("");
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const coverIsUploadingRef = useRef(false);

  // Partners for dropdown
  const [partners, setPartners] = useState<Array<{ id: string; church_name?: string; pastor_name?: string }>>([]);
  const [partnerSearch, setPartnerSearch] = useState("");

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const hasUnsavedChanges = useRef(false);

  // ─── Unsaved changes guard ───────────────────────────────────────────────
  // Browser beforeunload
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Track changes
  useEffect(() => {
    const currentStr = JSON.stringify({ title, slug, summary, blocks, featuredImage, partnerId, category, published });
    hasUnsavedChanges.current = currentStr !== lastSavedRef.current && title.trim().length > 0;
  }, [title, slug, summary, blocks, featuredImage, partnerId, category, published]);

  // ─── Load existing story ────────────────────────────────────────────────
  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    getStory(id!)
      .then((data) => {
        if (data) {
          setTitle(data.title || "");
          setSlug(data.slug || "");
          setSummary(data.summary || "");
          setFeaturedImage(data.featured_image || "");
          setPartnerId(data.partner_id || "");
          setCategory(data.category || "Community");
          setPublished(data.published ?? false);
          setStoryId(data.id);

          const parsed = parseContent(data.content);
          if (parsed) {
            setBlocks(parsed);
          } else if (typeof data.content === "string" && data.content.trim()) {
            const paragraphs = data.content.split(/\n\n/).filter((p: string) => p.trim());
            setBlocks(
              paragraphs.length > 0
                ? paragraphs.map((p: string) => ({ type: "paragraph" as const, content: p.trim() }))
                : [{ type: "paragraph", content: data.content }]
            );
          }

          lastSavedRef.current = JSON.stringify({
            title: data.title || "",
            slug: data.slug || "",
            summary: data.summary || "",
            blocks: parsed || [{ type: "paragraph", content: data.content || "" }],
            featuredImage: data.featured_image || "",
            partnerId: data.partner_id || "",
            category: data.category || "Community",
            published: data.published ?? false,
          });
        }
      })
      .catch((e) => {
        console.error("Failed to load story:", e);
      })
      .finally(() => setLoading(false));

    if (id) {
      getNewsletterLog(id)
        .then((log) => { if (log) setNewsletterLog(log); })
        .catch(() => {});
    }
  }, [id, isNew]);

  // Load partners for dropdown (Feature 5)
  useEffect(() => {
    getPartners()
      .then((data) => {
        if (Array.isArray(data)) setPartners(data);
      })
      .catch(() => {});
  }, []);

  // ─── Autosave ───────────────────────────────────────────────────────────
  const getPayload = useCallback(() => ({
    ...(storyId ? { id: storyId } : {}),
    title,
    slug: slug || generateSlug(title),
    summary,
    content: blocks,
    featured_image: featuredImage,
    partner_id: partnerId,
    category,
    published,
  }), [storyId, title, slug, summary, blocks, featuredImage, partnerId, category, published]);

  const doSave = useCallback(async (payload: any, showStatus = true) => {
    if (!payload.title?.trim()) return null;
    if (showStatus) setSaveStatus("saving");
    try {
      const saved = await saveStory(payload);
      if (saved?.id && !storyId) {
        setStoryId(saved.id);
      }
      if (saved?.slug && !slug) {
        setSlug(saved.slug);
      }
      const refStr = JSON.stringify({
        title: payload.title,
        slug: payload.slug,
        summary: payload.summary,
        blocks: payload.content,
        featuredImage: payload.featured_image,
        partnerId: payload.partner_id,
        category: payload.category,
        published: payload.published,
      });
      lastSavedRef.current = refStr;
      hasUnsavedChanges.current = false;

      // Save revision snapshot (Feature 9)
      if (saved?.id) {
        saveRevision(saved.id, {
          title: payload.title,
          summary: payload.summary,
          content: payload.content,
          published: payload.published,
        }).catch((e: any) => console.warn("Revision save failed:", e.message));
      }

      if (showStatus) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
      return saved;
    } catch (e: any) {
      console.error("Save error:", e);
      if (showStatus) setSaveStatus("error");
      return null;
    }
  }, [storyId, slug]);

  // Autosave every 15 seconds if content changed
  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    if (!title.trim()) return;

    autosaveTimer.current = setTimeout(() => {
      if (hasUnsavedChanges.current) {
        const payload = getPayload();
        doSave({ ...payload, published: false }, true);
      }
    }, 15000);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [title, slug, summary, blocks, featuredImage, partnerId, category, getPayload, doSave]);

  // ─── Save handlers ──────────────────────────────────────────────────────
  const handleSaveDraft = useCallback(async () => {
    setSaving(true);
    setNewsletterStatus(null);
    const payload = { ...getPayload(), published: false };
    await doSave(payload);
    setPublished(false);
    setSaving(false);
  }, [getPayload, doSave]);

  const handlePublish = useCallback(async () => {
    if (!title.trim()) return;
    if (blocks.length === 0 || (blocks.length === 1 && blocks[0].type === "paragraph" && !(blocks[0] as any).content?.trim())) {
      alert("Cannot publish with empty content.");
      return;
    }

    setSaving(true);
    setNewsletterStatus(null);
    const payload = { ...getPayload(), published: true };
    const saved = await doSave(payload);
    setPublished(true);

    if (saved?.id && sendNewsletterFlag) {
      try {
        const result = await sendNewsletter(saved.id);
        if (result.already_sent) {
          setNewsletterStatus("already_sent");
        } else if (result.sent > 0) {
          setNewsletterStatus(`sent_${result.sent}`);
        } else {
          setNewsletterStatus("no_subscribers");
        }
      } catch (e: any) {
        console.error("Newsletter send error:", e);
        setNewsletterStatus("error");
      }
    }
    setSaving(false);

    // Navigate back to admin stories list after a brief delay so user sees the save confirmation
    hasUnsavedChanges.current = false;
    setTimeout(() => router.push("/admin/stories"), 1200);
  }, [title, blocks, getPayload, doSave, sendNewsletterFlag]);

  // ─── Slug auto-gen ──────────────────────────────────────────────────────
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!storyId) {
      setSlug(generateSlug(newTitle));
    }
  };

  // ─── Revision history ──────────────────────────────────────────────────
  const openRevisions = async () => {
    setRevisionsOpen(true);
    if (!storyId) return;
    setRevisionsLoading(true);
    try {
      const data = await getRevisions(storyId);
      setRevisions(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("Load revisions error:", e);
    } finally {
      setRevisionsLoading(false);
    }
  };

  const handleRestoreRevision = (rev: Revision) => {
    if (!confirm(`Restore revision from ${new Date(rev.saved_at).toLocaleString()}? Your current content will be replaced.`)) return;
    setTitle(rev.title || title);
    setSummary(rev.summary || summary);
    const parsed = parseContent(rev.content);
    if (parsed) {
      setBlocks(parsed);
    }
    setRevisionsOpen(false);
  };

  // ─── Featured image handlers ───────────────────────────────────────────
  const handleFeaturedImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (url && url.startsWith("http")) setFeaturedImage(url);
  };

  const loadCoverAssets = useCallback(() => {
    setCoverAssetsLoading(true);
    listAssets()
      .then((data) => setCoverAssets(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Failed to load assets:", e))
      .finally(() => setCoverAssetsLoading(false));
  }, []);

  const openCoverPicker = () => {
    setCoverPickerOpen(true);
    setCoverTab("upload");
    setCoverUrlValue("");
    setCoverSearch("");
    setCoverUploadQueue([]);
    coverIsUploadingRef.current = false;
    loadCoverAssets();
  };

  // Process cover upload queue
  useEffect(() => {
    if (coverIsUploadingRef.current) return;
    const nextIdx = coverUploadQueue.findIndex((item) => item.status === "pending");
    if (nextIdx === -1) return;

    coverIsUploadingRef.current = true;
    setCoverUploadQueue((prev) => prev.map((item, idx) =>
      idx === nextIdx ? { ...item, status: "uploading" as const } : item
    ));

    uploadAsset(coverUploadQueue[nextIdx].file, `cover-${Date.now()}-${coverUploadQueue[nextIdx].file.name}`)
      .then((result) => {
        setCoverUploadQueue((prev) => prev.map((item, idx) =>
          idx === nextIdx ? { ...item, status: "done" as const, publicUrl: result.public_url } : item
        ));
      })
      .catch((e: any) => {
        setCoverUploadQueue((prev) => prev.map((item, idx) =>
          idx === nextIdx ? { ...item, status: "error" as const, error: e.message } : item
        ));
      })
      .finally(() => {
        coverIsUploadingRef.current = false;
        loadCoverAssets();
      });
  }, [coverUploadQueue, loadCoverAssets]);

  const addCoverFiles = (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    const newItems = imageFiles.map((file) => ({
      file,
      name: file.name,
      status: "pending" as const,
      preview: URL.createObjectURL(file),
    }));

    setCoverUploadQueue((prev) => [...prev, ...newItems]);
  };

  // ─── Validation ─────────────────────────────────────────────────────────
  const canPublish = title.trim().length > 0 &&
    blocks.length > 0 &&
    !(blocks.length === 1 && blocks[0].type === "paragraph" && !(blocks[0] as any).content?.trim());

  // ─── Word count stats ──────────────────────────────────────────────────
  const words = countWords(blocks);
  const chars = countCharacters(blocks);
  const readMin = estimateReadingTime(blocks);

  // ─── Partner dropdown filter ────────────────────────────────────────────
  const filteredPartners = partners.filter((p) => {
    const name = (p.church_name || p.pastor_name || "").toLowerCase();
    return name.includes(partnerSearch.toLowerCase());
  });

  // ─── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-harvest-gold" />
      </div>
    );
  }

  return (
    <div className="relative">
    <div className="min-h-screen bg-white">
      {/* ── Sticky Toolbar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-mist/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left — back + status */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/admin/stories")}
              className="p-2 rounded-lg hover:bg-field-sand/60 text-slate-text transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <p className="text-covenant-navy truncate" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                {title || "Untitled Story"}
              </p>
              <div className="flex items-center gap-2">
                {saveStatus === "saving" && (
                  <span className="flex items-center gap-1 text-slate-text/40" style={{ fontSize: "0.6875rem" }}>
                    <Loader2 size={10} className="animate-spin" /> Saving...
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="flex items-center gap-1 text-green-600/60" style={{ fontSize: "0.6875rem" }}>
                    <CheckCircle2 size={10} /> Saved
                  </span>
                )}
                {saveStatus === "error" && (
                  <span className="flex items-center gap-1 text-mission-red/60" style={{ fontSize: "0.6875rem" }}>
                    <AlertCircle size={10} /> Save failed
                  </span>
                )}
                {published && (
                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-lg" style={{ fontSize: "0.5625rem", fontWeight: 700 }}>
                    Published
                  </span>
                )}
                {!published && storyId && (
                  <span className="bg-field-sand text-slate-text px-2 py-0.5 rounded-lg" style={{ fontSize: "0.5625rem", fontWeight: 700 }}>
                    Draft
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center — Edit/Preview toggle */}
          <div className="flex items-center bg-field-sand/60 rounded-lg p-0.5">
            <button
              onClick={() => setMode("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                mode === "edit" ? "bg-white text-covenant-navy shadow-sm" : "text-slate-text/60 hover:text-covenant-navy"
              }`}
              style={{ fontSize: "0.75rem", fontWeight: 600 }}
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                mode === "preview" ? "bg-white text-covenant-navy shadow-sm" : "text-slate-text/60 hover:text-covenant-navy"
              }`}
              style={{ fontSize: "0.75rem", fontWeight: 600 }}
            >
              <Monitor size={12} /> Preview
            </button>
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Auto-Quote */}
            {mode === "edit" && (
              <button
                onClick={() => {
                  const candidates = extractQuoteCandidates(blocks);
                  setAutoQuoteCandidates(candidates);
                  setAutoQuoteInserted(new Set());
                  setAutoQuoteOpen(true);
                }}
                className="p-2 rounded-lg hover:bg-field-sand/60 text-slate-text/60 hover:text-harvest-gold transition-colors cursor-pointer"
                title="Auto-quote pullout"
              >
                <Sparkles size={18} />
              </button>
            )}
            {/* Revision History */}
            {storyId && (
              <button
                onClick={openRevisions}
                className="p-2 rounded-lg hover:bg-field-sand/60 text-slate-text/60 hover:text-covenant-navy transition-colors cursor-pointer"
                title="Revision history"
              >
                <History size={18} />
              </button>
            )}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                settingsOpen ? "bg-harvest-gold/10 text-harvest-gold" : "hover:bg-field-sand/60 text-slate-text/60"
              }`}
              title="Story settings"
            >
              <Settings2 size={18} />
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={saving || !title.trim()}
              className="px-4 py-2 rounded-lg border border-mist/30 text-slate-text hover:bg-field-sand/40 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              style={{ fontSize: "0.8125rem", fontWeight: 600 }}
            >
              {saving && !published ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={saving || !canPublish}
              className="bg-harvest-gold text-white px-4 py-2 rounded-lg hover:bg-[#c88e30] hover:shadow-lg hover:shadow-harvest-gold/20 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              style={{ fontSize: "0.8125rem", fontWeight: 700 }}
            >
              {saving && published ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* ── Newsletter Status ─────────────────────────────────────── */}
      {newsletterStatus && (
        <div className="max-w-[720px] mx-auto px-6 pt-4">
          <div className={`rounded-xl px-5 py-3 flex items-center gap-3 ${
            newsletterStatus === "error" ? "bg-mission-red/8 text-mission-red" :
            newsletterStatus === "already_sent" ? "bg-amber-50 text-amber-700" :
            newsletterStatus === "no_subscribers" ? "bg-mist text-slate-text" :
            "bg-green-50 text-green-700"
          }`}>
            {newsletterStatus === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
              {newsletterStatus === "error" && "Failed to send newsletter."}
              {newsletterStatus === "already_sent" && "Newsletter already sent for this story."}
              {newsletterStatus === "no_subscribers" && "No subscribers found."}
              {newsletterStatus.startsWith("sent_") && `Newsletter sent to ${newsletterStatus.split("_")[1]} subscriber(s)!`}
            </span>
            <button onClick={() => setNewsletterStatus(null)} className="ml-auto opacity-60 hover:opacity-100 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Settings Drawer ───────────────────────────────────────── */}
      {settingsOpen && (
        <div className="border-b border-mist/20 bg-field-sand/20">
          <div className="max-w-[720px] mx-auto px-6 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 700 }}>
                Story Settings
              </h3>
              <button onClick={() => setSettingsOpen(false)} className="p-1 rounded text-slate-text/40 hover:text-covenant-navy cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-covenant-navy mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-mist/30 text-ink placeholder:text-slate-text/25 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30"
                  style={{ fontSize: "0.8125rem" }}
                  placeholder="url-friendly-slug"
                />
              </div>
              <div>
                <label className="block text-covenant-navy mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-mist/30 text-ink focus:outline-none focus:ring-2 focus:ring-harvest-gold/30"
                  style={{ fontSize: "0.8125rem" }}
                >
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Partner Selector Dropdown (Feature 5) */}
              <div className="sm:col-span-2">
                <label className="block text-covenant-navy mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                  Partner Church
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-text/30 pointer-events-none" />
                    <input
                      type="text"
                      value={partnerSearch}
                      onChange={(e) => setPartnerSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white border border-mist/30 text-ink placeholder:text-slate-text/25 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30"
                      style={{ fontSize: "0.8125rem" }}
                      placeholder="Search partners..."
                    />
                  </div>
                  {partnerId && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-harvest-gold/10 text-covenant-navy" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                        {partners.find(p => p.id === partnerId)?.church_name || partnerId.slice(0, 8) + "..."}
                      </span>
                      <button
                        onClick={() => setPartnerId("")}
                        className="text-slate-text/30 hover:text-mission-red transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  {partnerSearch && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg border border-mist/30 shadow-lg max-h-[200px] overflow-y-auto z-10">
                      {filteredPartners.length === 0 ? (
                        <p className="px-4 py-3 text-slate-text/40" style={{ fontSize: "0.75rem" }}>No partners found</p>
                      ) : (
                        filteredPartners.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setPartnerId(p.id);
                              setPartnerSearch("");
                            }}
                            className={`w-full text-left px-4 py-2.5 hover:bg-field-sand/40 transition-colors cursor-pointer ${
                              p.id === partnerId ? "bg-harvest-gold/5 text-covenant-navy" : "text-ink"
                            }`}
                            style={{ fontSize: "0.8125rem" }}
                          >
                            <span style={{ fontWeight: 600 }}>{p.church_name || "Unknown Church"}</span>
                            {p.pastor_name && (
                              <span className="text-slate-text/40 ml-2" style={{ fontSize: "0.6875rem" }}>
                                — {p.pastor_name}
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Scheduled Publishing (Feature 10) */}
              <div>
                <label className="block text-covenant-navy mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                  <span className="flex items-center gap-1.5">
                    <CalendarClock size={12} /> Schedule Publish
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-mist/30 text-ink placeholder:text-slate-text/25 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30"
                  style={{ fontSize: "0.8125rem" }}
                />
                {publishAt && (
                  <p className="text-harvest-gold mt-1.5 flex items-center gap-1" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>
                    <CalendarClock size={10} />
                    Scheduled: {new Date(publishAt).toLocaleString()}
                    <button
                      onClick={() => setPublishAt("")}
                      className="text-slate-text/30 hover:text-mission-red ml-1 cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </p>
                )}
              </div>

              {/* Featured Image URL (kept for manual entry) */}
              <div>
                <label className="block text-covenant-navy mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700 }}>Featured Image URL</label>
                <input
                  type="url"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-mist/30 text-ink placeholder:text-slate-text/25 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30"
                  style={{ fontSize: "0.8125rem" }}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            {/* Newsletter toggle */}
            <div className="bg-white rounded-xl p-4 border border-mist/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="text-harvest-gold" />
                  <div>
                    <p className="text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>Send newsletter on publish</p>
                    <p className="text-slate-text/50" style={{ fontSize: "0.6875rem" }}>Email all subscribers when published.</p>
                  </div>
                </div>
                <button
                  onClick={() => setSendNewsletterFlag(!sendNewsletterFlag)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${
                    sendNewsletterFlag ? "bg-harvest-gold" : "bg-mist"
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    sendNewsletterFlag ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>
              {newsletterLog && (
                <div className="mt-3 pt-3 border-t border-mist/20 flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-green-600 shrink-0" />
                  <p className="text-green-700" style={{ fontSize: "0.6875rem" }}>
                    Sent on {new Date(newsletterLog.sent_at).toLocaleDateString()} to {newsletterLog.recipient_count} subscriber(s).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Area ─────────────────────────────────────── */}
      <div className="max-w-[720px] mx-auto px-6 py-10">
        {mode === "edit" ? (
          <div className="space-y-6">
            {/* Featured Image Preview (Feature 4) */}
            {featuredImage ? (
              <div
                className="relative rounded-2xl overflow-hidden group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFeaturedImageDrop}
              >
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-auto max-h-[320px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-covenant-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={openCoverPicker}
                      className="px-3 py-1.5 rounded-lg bg-white/90 text-covenant-navy hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
                      style={{ fontSize: "0.6875rem", fontWeight: 600 }}
                    >
                      <ImageIcon size={12} /> Change
                    </button>
                    <button
                      onClick={() => setFeaturedImage("")}
                      className="p-1.5 rounded-lg bg-white/90 text-mission-red hover:bg-white transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl border-2 border-dashed border-mist/30 hover:border-harvest-gold/30 bg-field-sand/10 hover:bg-harvest-gold/3 transition-all cursor-pointer flex flex-col items-center justify-center py-10 gap-3"
                onClick={openCoverPicker}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFeaturedImageDrop}
              >
                <div className="w-12 h-12 rounded-xl bg-field-sand/60 flex items-center justify-center">
                  <ImageIcon size={20} className="text-slate-text/25" />
                </div>
                <div className="text-center">
                  <p className="text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Add cover image</p>
                  <p className="text-slate-text/35" style={{ fontSize: "0.6875rem" }}>Upload, choose from library, or paste a URL</p>
                </div>
              </div>
            )}

            {/* Title */}
            <textarea
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Story title"
              className="w-full bg-transparent border-0 outline-none resize-none text-covenant-navy placeholder:text-mist/60"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 800,
                lineHeight: "1.2",
                letterSpacing: "-0.025em",
              }}
              rows={1}
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }}
            />

            {/* Summary */}
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a brief summary for story cards..."
              className="w-full bg-transparent border-0 outline-none resize-none text-ink/60 placeholder:text-slate-text/20"
              style={{ fontSize: "1.125rem", lineHeight: "1.7" }}
              rows={2}
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }}
            />

            {/* Divider */}
            <div className="h-px bg-mist/30" />

            {/* Block Editor */}
            <StoryBlockEditor
              blocks={blocks}
              onChange={setBlocks}
              onSave={handleSaveDraft}
              onPublish={handlePublish}
            />
          </div>
        ) : (
          /* ── Preview Mode ─────────────────────────────────── */
          <div>
            {featuredImage && (
              <div className="rounded-2xl overflow-hidden mb-8 -mx-2 sm:-mx-4 lg:-mx-10">
                <img src={featuredImage} alt={title} className="w-full h-auto max-h-[400px] object-cover" />
              </div>
            )}

            <h1
              className="text-covenant-navy mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 800,
                lineHeight: "1.2",
                letterSpacing: "-0.025em",
              }}
            >
              {title || "Untitled Story"}
            </h1>

            {summary && (
              <p
                className="text-ink mb-8 first-letter:float-left first-letter:text-[3.25rem] first-letter:leading-[0.85] first-letter:mr-3 first-letter:mt-1.5 first-letter:font-bold first-letter:text-covenant-navy"
                style={{ fontSize: "1.125rem", lineHeight: "1.8" }}
              >
                {summary}
              </p>
            )}

            <div className="flex items-center gap-2 mb-10">
              <div className="h-[2px] w-8 bg-harvest-gold/50 rounded-full" />
              <div className="h-[2px] w-2 bg-harvest-gold/20 rounded-full" />
            </div>

            <StoryRenderer blocks={blocks} />
          </div>
        )}
      </div>

      {/* ── Word Count / Reading Time Footer (Feature 1) ──────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-md border-t border-mist/15">
        <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-text/40" style={{ fontSize: "0.6875rem" }}>
              <LetterText size={11} />
              {words.toLocaleString()} {words === 1 ? "word" : "words"}
            </span>
            <span className="text-slate-text/15">|</span>
            <span className="text-slate-text/40" style={{ fontSize: "0.6875rem" }}>
              {chars.toLocaleString()} chars
            </span>
            <span className="text-slate-text/15">|</span>
            <span className="flex items-center gap-1.5 text-slate-text/40" style={{ fontSize: "0.6875rem" }}>
              <Clock size={11} />
              {readMin} min read
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-text/25" style={{ fontSize: "0.625rem" }}>
              {blocks.length} {blocks.length === 1 ? "block" : "blocks"}
            </span>
            <span className="text-slate-text/15">|</span>
            <span className="text-slate-text/25" style={{ fontSize: "0.625rem" }}>
              Cmd+S save · Cmd+Enter publish · Cmd+B bold · Cmd+I italic · Cmd+K link
            </span>
          </div>
        </div>
      </div>

      {/* ── Revision History Drawer (Feature 9) ───────────────────── */}
      {revisionsOpen && (
        <RevisionDrawer
          revisions={revisions}
          loading={revisionsLoading}
          onRestore={handleRestoreRevision}
          onClose={() => setRevisionsOpen(false)}
        />
      )}

      {/* ── Cover Image Picker Modal ─────────────────────────────── */}
      {coverPickerOpen && (
        <div className="fixed inset-0 bg-covenant-navy/30 backdrop-blur-sm z-50" onClick={() => setCoverPickerOpen(false)}>
          <div className="relative w-full h-full flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-mist/20 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-mist/20">
              <h3 className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "1.0625rem", fontWeight: 700 }}>
                Cover Image
              </h3>
              <button onClick={() => setCoverPickerOpen(false)} className="p-1.5 rounded-lg hover:bg-field-sand/60 text-slate-text cursor-pointer"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              {/* Tabs */}
              <div className="flex items-center gap-2">
                {([
                  { key: "upload" as const, label: "Upload" },
                  { key: "library" as const, label: "Asset Library" },
                  { key: "url" as const, label: "Paste URL" },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setCoverTab(tab.key)}
                    className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${coverTab === tab.key ? "bg-field-sand text-covenant-navy" : "text-slate-text hover:bg-field-sand/50"}`}
                    style={{ fontSize: "0.8125rem", fontWeight: 600 }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {coverTab === "upload" ? (
                <div>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) addCoverFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />

                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setCoverDragOver(true); }}
                    onDragLeave={() => setCoverDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setCoverDragOver(false);
                      if (e.dataTransfer.files.length > 0) addCoverFiles(e.dataTransfer.files);
                    }}
                    onClick={() => coverFileInputRef.current?.click()}
                    className={`rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                      coverUploadQueue.length > 0 ? "py-8" : "py-16"
                    } ${
                      coverDragOver
                        ? "border-harvest-gold bg-harvest-gold/5"
                        : "border-mist/40 hover:border-harvest-gold/30 bg-field-sand/10 hover:bg-harvest-gold/3"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`rounded-2xl bg-field-sand/60 flex items-center justify-center ${coverUploadQueue.length > 0 ? "w-10 h-10" : "w-14 h-14"}`}>
                        <Upload size={coverUploadQueue.length > 0 ? 16 : 22} className="text-slate-text/30" />
                      </div>
                      <div className="text-center">
                        <p className="text-covenant-navy" style={{ fontSize: coverUploadQueue.length > 0 ? "0.75rem" : "0.875rem", fontWeight: 600 }}>
                          {coverDragOver ? "Drop images here" : coverUploadQueue.length > 0 ? "Add more images" : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-slate-text/35 mt-0.5" style={{ fontSize: "0.6875rem" }}>
                          Select multiple files · PNG, JPG, WebP up to 10MB each
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Upload queue */}
                  {coverUploadQueue.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-covenant-navy" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                          {coverUploadQueue.some((item) => item.status === "uploading" || item.status === "pending")
                            ? `Uploading ${coverUploadQueue.filter((i) => i.status === "done").length + 1} of ${coverUploadQueue.length}...`
                            : `${coverUploadQueue.filter((i) => i.status === "done").length} image${coverUploadQueue.filter((i) => i.status === "done").length !== 1 ? "s" : ""} uploaded`}
                        </p>
                        {!coverUploadQueue.some((item) => item.status === "uploading" || item.status === "pending") && (
                          <button
                            onClick={() => setCoverUploadQueue([])}
                            className="text-slate-text/40 hover:text-slate-text/60 transition-colors cursor-pointer"
                            style={{ fontSize: "0.6875rem" }}
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Progress bar */}
                      {coverUploadQueue.some((item) => item.status === "uploading" || item.status === "pending") && (
                        <div className="w-full h-1.5 bg-field-sand rounded-full mb-3 overflow-hidden">
                          <div
                            className="h-full bg-harvest-gold rounded-full transition-all duration-300"
                            style={{ width: `${coverUploadQueue.length > 0 ? (coverUploadQueue.filter((i) => i.status === "done").length / coverUploadQueue.length) * 100 : 0}%` }}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[220px] overflow-y-auto">
                        {coverUploadQueue.map((item, i) => (
                          <div key={`${item.name}-${i}`} className="relative">
                            <button
                              onClick={() => {
                                if (item.publicUrl) {
                                  setFeaturedImage(item.publicUrl);
                                  setCoverPickerOpen(false);
                                }
                              }}
                              disabled={item.status !== "done"}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all w-full ${
                                item.status === "done"
                                  ? "border-transparent hover:border-harvest-gold/50 cursor-pointer hover:scale-[1.02]"
                                  : "border-transparent cursor-default"
                              }`}
                            >
                              <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />

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

                      {coverUploadQueue.some((i) => i.status === "done") && !coverUploadQueue.some((i) => i.status === "uploading" || i.status === "pending") && (
                        <p className="text-slate-text/30 mt-3 text-center" style={{ fontSize: "0.6875rem" }}>
                          Click an uploaded image to set it as cover
                        </p>
                      )}
                    </div>
                  )}

                  {coverUploadQueue.length === 0 && (
                    <p className="text-center text-slate-text/30 mt-3" style={{ fontSize: "0.6875rem" }}>
                      Uploaded images are saved to your asset library
                    </p>
                  )}
                </div>
              ) : coverTab === "url" ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={coverUrlValue}
                    onChange={(e) => setCoverUrlValue(e.target.value)}
                    className="flex-1 bg-field-sand/50 border border-mist/30 rounded-xl px-4 py-3 text-ink placeholder:text-slate-text/30 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30"
                    style={{ fontSize: "0.875rem" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && coverUrlValue.trim()) {
                        setFeaturedImage(coverUrlValue.trim());
                        setCoverPickerOpen(false);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (coverUrlValue.trim()) {
                        setFeaturedImage(coverUrlValue.trim());
                        setCoverPickerOpen(false);
                      }
                    }}
                    disabled={!coverUrlValue.trim()}
                    className="px-5 py-3 bg-harvest-gold text-white rounded-xl hover:bg-[#c88e30] disabled:opacity-40 transition-colors cursor-pointer"
                    style={{ fontSize: "0.875rem", fontWeight: 700 }}
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="relative mb-4">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-text/30 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      value={coverSearch}
                      onChange={(e) => setCoverSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-field-sand/50 border border-mist/30 rounded-xl text-ink placeholder:text-slate-text/30 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30"
                      style={{ fontSize: "0.8125rem" }}
                    />
                  </div>
                  {coverAssetsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={20} className="animate-spin text-harvest-gold" />
                    </div>
                  ) : coverAssets.filter((a) => a.name.toLowerCase().includes(coverSearch.toLowerCase())).length === 0 ? (
                    <div className="text-center py-12">
                      <ImageIcon size={28} className="mx-auto text-slate-text/15 mb-3" />
                      <p className="text-slate-text/50" style={{ fontSize: "0.8125rem" }}>
                        {coverSearch ? "No assets match your search." : "No assets uploaded yet. Use the Upload tab."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[340px] overflow-y-auto">
                      {coverAssets
                        .filter((a) => a.name.toLowerCase().includes(coverSearch.toLowerCase()))
                        .map((asset) => (
                        <button
                          key={asset.path}
                          onClick={() => {
                            setFeaturedImage(asset.public_url);
                            setCoverPickerOpen(false);
                          }}
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
      )}

      {/* ── Auto-Quote Modal (Feature 8) ────────────────────────── */}
      {autoQuoteOpen && (
        <AutoQuoteModal
          candidates={autoQuoteCandidates}
          insertedIndices={autoQuoteInserted}
          onInsert={(candidate) => {
            // Find candidate index in array
            const candIdx = autoQuoteCandidates.indexOf(candidate);
            // Count how many quotes were already inserted before this candidate's source position
            const insertedBefore = autoQuoteCandidates
              .filter((c, ci) => autoQuoteInserted.has(ci) && c.sourceBlockIndex <= candidate.sourceBlockIndex)
              .length;
            const adjustedIndex = candidate.sourceBlockIndex + insertedBefore;

            setAutoQuoteInserted((prev) => new Set([...prev, candIdx]));
            setBlocks((prev) => {
              const newBlocks = [...prev];
              newBlocks.splice(adjustedIndex + 1, 0, {
                type: "quote",
                content: candidate.text,
              });
              return newBlocks;
            });
          }}
          onClose={() => setAutoQuoteOpen(false)}
        />
      )}
    </div>
    </div>
  );
}