import React from "react";

// ─── Block Types ──────────────────────────────────────────────────────────

export interface ParagraphBlock {
  type: "paragraph";
  content: string;
}

export interface HeadingBlock {
  type: "heading";
  level: 2 | 3;
  content: string;
}

export interface QuoteBlock {
  type: "quote";
  content: string;
}

export interface DividerBlock {
  type: "divider";
}

export interface ImageBlock {
  type: "image";
  url: string;
  caption: string;
}

export interface EmbedBlock {
  type: "embed";
  url: string;
}

export interface BulletListBlock {
  type: "bullet-list";
  items: string[];
}

export interface NumberedListBlock {
  type: "numbered-list";
  items: string[];
}

export interface GalleryBlock {
  type: "gallery";
  images: Array<{ url: string; caption: string }>;
  columns: 2 | 3;
}

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | QuoteBlock
  | DividerBlock
  | ImageBlock
  | EmbedBlock
  | BulletListBlock
  | NumberedListBlock
  | GalleryBlock;

// ─── Helpers ──────────────────────────────────────────────────────────────

export function isJsonBlocks(content: any): content is ContentBlock[] {
  return Array.isArray(content) && content.length > 0 && typeof content[0]?.type === "string";
}

export function parseContent(content: any): ContentBlock[] | null {
  if (!content) return null;
  if (isJsonBlocks(content)) return content;
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (isJsonBlocks(parsed)) return parsed;
    } catch {
      // Not JSON — return null, caller should handle as legacy plain text
    }
  }
  return null;
}

export function blocksToPlainText(blocks: ContentBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "paragraph":
        case "heading":
        case "quote":
          return b.content;
        case "bullet-list":
        case "numbered-list":
          return b.items.join(" ");
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join(" ");
}

export function countWords(blocks: ContentBlock[]): number {
  const text = blocksToPlainText(blocks);
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function countCharacters(blocks: ContentBlock[]): number {
  return blocksToPlainText(blocks).length;
}

export function estimateReadingTime(blocks: ContentBlock[]): number {
  const words = countWords(blocks);
  return Math.max(1, Math.ceil(words / 230));
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// ─── Inline Formatting Parser ─────────────────────────────────────────────
// Supports: **bold**, *italic*, [text](url)

interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

function parseInlineFormatting(raw: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  // Combined regex: link, bold, italic
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      segments.push({ text: raw.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined && match[2] !== undefined) {
      // Link: [text](url)
      segments.push({ text: match[1], href: match[2] });
    } else if (match[3] !== undefined) {
      // Bold: **text**
      segments.push({ text: match[3], bold: true });
    } else if (match[4] !== undefined) {
      // Italic: *text*
      segments.push({ text: match[4], italic: true });
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < raw.length) {
    segments.push({ text: raw.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ text: raw });
  }

  return segments;
}

function RenderInlineText({ text }: { text: string }) {
  const segments = parseInlineFormatting(text);
  const hasFormatting = segments.length > 1 || segments.some(s => s.bold || s.italic || s.href);

  if (!hasFormatting) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {segments.map((seg, i) => {
        if (seg.href) {
          return (
            <a
              key={i}
              href={seg.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-harvest-gold hover:text-[#c88e30] underline underline-offset-2 transition-colors"
            >
              {seg.text}
            </a>
          );
        }
        if (seg.bold) {
          return <strong key={i} className="font-bold text-covenant-navy">{seg.text}</strong>;
        }
        if (seg.italic) {
          return <em key={i}>{seg.text}</em>;
        }
        return <span key={i}>{seg.text}</span>;
      })}
    </span>
  );
}

// ─── Renderer Component ───────────────────────────────────────────────────

interface StoryRendererProps {
  blocks: ContentBlock[];
  className?: string;
}

export function StoryRenderer({ blocks, className = "" }: StoryRendererProps) {
  return (
    <div className={`story-renderer space-y-6 ${className}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p
                key={i}
                className="text-ink/80"
                style={{ fontSize: "1.0625rem", lineHeight: "1.9" }}
              >
                <RenderInlineText text={block.content} />
              </p>
            );

          case "heading":
            if (block.level === 2) {
              return (
                <h2
                  key={i}
                  className="text-covenant-navy mt-10 mb-4"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    lineHeight: "1.3",
                  }}
                >
                  <RenderInlineText text={block.content} />
                </h2>
              );
            }
            return (
              <h3
                key={i}
                className="text-covenant-navy mt-8 mb-3"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.1875rem",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  lineHeight: "1.35",
                }}
              >
                <RenderInlineText text={block.content} />
              </h3>
            );

          case "quote":
            return (
              <blockquote
                key={i}
                className="relative my-10 mx-auto max-w-[90%] rounded-xl bg-covenant-navy/[0.02] border border-harvest-gold/15 px-8 py-7 sm:px-10 sm:py-8"
              >
                {/* Decorative open quote */}
                <span
                  className="absolute -top-4 left-5 text-harvest-gold/20 select-none pointer-events-none"
                  style={{ fontFamily: "Georgia, serif", fontSize: "5rem", lineHeight: "1" }}
                  aria-hidden="true"
                >&ldquo;</span>
                {/* Gold accent bar */}
                <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full bg-harvest-gold/40" />
                <p
                  className="relative text-covenant-navy/75 pl-3"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.1875rem",
                    lineHeight: "1.7",
                    fontWeight: 600,
                    fontStyle: "italic",
                    letterSpacing: "-0.01em",
                  }}
                >
                  <RenderInlineText text={block.content} />
                </p>
                {/* Decorative close quote */}
                <span
                  className="absolute -bottom-5 right-6 text-harvest-gold/12 select-none pointer-events-none"
                  style={{ fontFamily: "Georgia, serif", fontSize: "5rem", lineHeight: "1" }}
                  aria-hidden="true"
                >&rdquo;</span>
              </blockquote>
            );

          case "divider":
            return (
              <div key={i} className="flex items-center gap-2 my-10">
                <div className="h-[2px] w-8 bg-harvest-gold/50 rounded-full" />
                <div className="h-[2px] w-2 bg-harvest-gold/20 rounded-full" />
              </div>
            );

          case "image":
            return (
              <figure key={i} className="my-8 -mx-2 sm:-mx-4 lg:-mx-10">
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src={block.url}
                    alt={block.caption || ""}
                    className="w-full h-auto object-cover"
                  />
                </div>
                {block.caption && (
                  <figcaption
                    className="text-center text-slate-text/40 mt-3 px-4"
                    style={{ fontSize: "0.75rem", fontStyle: "italic" }}
                  >
                    <RenderInlineText text={block.caption} />
                  </figcaption>
                )}
              </figure>
            );

          case "embed": {
            const videoId = getYouTubeId(block.url);
            if (!videoId) return null;
            return (
              <div key={i} className="my-8 -mx-2 sm:-mx-4 lg:-mx-10">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-ink/5">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              </div>
            );
          }

          case "bullet-list":
            return (
              <ul key={i} className="pl-6 space-y-2 my-4">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="text-ink/80 list-disc"
                    style={{ fontSize: "1.0625rem", lineHeight: "1.8" }}
                  >
                    <RenderInlineText text={item} />
                  </li>
                ))}
              </ul>
            );

          case "numbered-list":
            return (
              <ol key={i} className="pl-6 space-y-2 my-4">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="text-ink/80 list-decimal"
                    style={{ fontSize: "1.0625rem", lineHeight: "1.8" }}
                  >
                    <RenderInlineText text={item} />
                  </li>
                ))}
              </ol>
            );

          case "gallery":
            return (
              <div key={i} className="my-8 -mx-2 sm:-mx-4 lg:-mx-10">
                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: `repeat(${block.columns}, 1fr)` }}
                >
                  {block.images.map((img, j) => (
                    <figure key={j} className="relative">
                      <div className="rounded-xl overflow-hidden aspect-[4/3]">
                        <img
                          src={img.url}
                          alt={img.caption || ""}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {img.caption && (
                        <figcaption
                          className="text-center text-slate-text/40 mt-2 px-2"
                          style={{ fontSize: "0.6875rem", fontStyle: "italic" }}
                        >
                          <RenderInlineText text={img.caption} />
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}