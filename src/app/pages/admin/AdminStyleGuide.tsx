"use client"
import React from "react";
import { Heart, Users, BookOpen, DollarSign, Film, Palette, ArrowRight, Minus } from "lucide-react";
import { Button } from "../../components/shared/Button";
import { ScriptureBlock } from "../../components/shared/ScriptureBlock";
import { CTABanner } from "../../components/shared/CTABanner";

/* ── Data (locked) ────────────────────────────────────────────── */

const colors = [
  { name: "Mission Red", variable: "--mission-red", hex: "#C84C3D", usage: "Navigation, highlights, hero overlays" },
  { name: "Covenant Navy", variable: "--covenant-navy", hex: "#103B53", usage: "Footer, dark sections, cinematic scripture, charts" },
  { name: "Field Sand", variable: "--field-sand", hex: "#F1ECE3", usage: "Main content backgrounds" },
  { name: "Light Linen", variable: "--light-linen", hex: "#FAF8F4", usage: "Cards, clean sections" },
  { name: "Harvest Gold", variable: "--harvest-gold", hex: "#D89B3C", usage: "Buttons, icons, accents, CTA banner backgrounds" },
  { name: "Ink", variable: "--ink", hex: "#1E1E1E", usage: "Primary body text" },
  { name: "Slate", variable: "--slate-text", hex: "#5F6368", usage: "Muted text, captions" },
  { name: "Mist", variable: "--mist", hex: "#E5DFD6", usage: "Dividers, borders, soft backgrounds" },
];

const typography = [
  { name: "H1", family: "Inter", size: "Clamp 40-72px", weight: "ExtraBold (800)", css: "clamp(2.5rem, 5vw, 4.5rem)" },
  { name: "H2", family: "Inter", size: "Clamp 32-52px", weight: "Bold (700)", css: "clamp(2rem, 4vw, 3.25rem)" },
  { name: "H3", family: "Inter", size: "Clamp 24-32px", weight: "SemiBold (600)", css: "clamp(1.5rem, 2.5vw, 2rem)" },
  { name: "H4", family: "Inter", size: "22px / 30px", weight: "SemiBold (600)", css: "1.375rem / 1.875rem" },
  { name: "Body Large", family: "DM Sans", size: "18px / 28px", weight: "Regular (400)", css: "1.125rem / 1.75rem" },
  { name: "Body", family: "DM Sans", size: "16px / 26px", weight: "Regular (400)", css: "1rem / 1.625rem" },
  { name: "Small", family: "DM Sans", size: "14px / 22px", weight: "Regular (400)", css: "0.875rem / 1.375rem" },
  { name: "Quote / Scripture", family: "Inter", size: "Clamp 1.125-2rem", weight: "Light (300)", css: "var(--font-serif) — all scripture & pull quotes" },
];

const spacingRules = [
  { label: "Base Grid", value: "4px" },
  { label: "Section (Desktop)", value: "96-128px" },
  { label: "Section (Tablet)", value: "72-96px" },
  { label: "Section (Mobile)", value: "56-72px" },
  { label: "Card Padding", value: "24-32px" },
  { label: "Card Radius", value: "16-24px" },
  { label: "Button Radius", value: "999px (pill)" },
  { label: "Max Container", value: "1280px" },
];

const ctaPages = [
  { page: "Home", headline: "Be Part of What God Is Doing", link: "/give" },
  { page: "Stories", headline: "Help Write the Next Chapter", link: "/give" },
  { page: "Story Detail", headline: "Every Story Starts with a Step of Faith", link: "/give" },
  { page: "Partners", headline: "Stand With a Local Church Today", link: "/give" },
  { page: "Partner Detail", headline: "Walk Alongside This Church", link: "/give" },
  { page: "Impact", headline: "Help Us Reach the Next Community", link: "/give" },
  { page: "Media", headline: "See Yourself in This Story", link: "/give" },
  { page: "Give", headline: "See the Lives You're Changing", link: "/stories + /impact" },
  { page: "About", headline: "Join the Kapatid Family", link: "/give" },
  { page: "Contact", headline: "Ready to Make a Difference?", link: "/give" },
];

/* ── Helpers ───────────────────────────────────────────────────── */

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "0.6875rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "1.5rem",
  fontWeight: 700,
  letterSpacing: "-0.02em",
};

const subTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  fontSize: "0.875rem",
  fontWeight: 600,
};

const captionStyle: React.CSSProperties = { fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em" };
const monoStyle: React.CSSProperties = { fontFamily: "monospace", fontSize: "0.8125rem" };

function SectionHeader({ number, label, title }: { number: string; label: string; title: string }) {
  return (
    <div className="flex items-start gap-4 mb-8">
      <span
        className="shrink-0 w-9 h-9 rounded-lg bg-covenant-navy text-white flex items-center justify-center mt-0.5"
        style={{ fontFamily: "var(--font-heading)", fontSize: "0.8125rem", fontWeight: 700 }}
      >
        {number}
      </span>
      <div>
        <p className="text-harvest-gold mb-0.5" style={sectionLabelStyle}>{label}</p>
        <h2 className="text-covenant-navy" style={sectionTitleStyle}>{title}</h2>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-mist" />;
}

/* ── Component ─────────────────────────────────────────────────── */

export function AdminStyleGuide() {
  return (
    <div className="p-6 lg:p-10 xl:p-14 max-w-[1120px]">

      {/* ━━ PAGE HEADER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="mb-14">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-1 rounded-full bg-harvest-gold" />
          <span className="text-harvest-gold" style={sectionLabelStyle}>Internal Reference</span>
        </div>
        <h1
          className="text-covenant-navy"
          style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.15 }}
        >
          Design Style Guide
        </h1>
        <p className="text-slate-text mt-2 max-w-xl" style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
          Kapatid Ministry Refined Design System (2026) &mdash; Typography, color palette, component patterns, CTA banners, and cinematic scripture blocks.
        </p>
        <div className="flex items-center gap-2 mt-5">
          <span className="px-2.5 py-1 rounded-md bg-field-sand text-covenant-navy" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>v2.1</span>
          <span className="px-2.5 py-1 rounded-md bg-field-sand text-slate-text" style={{ fontSize: "0.6875rem" }}>Last updated Mar 2026</span>
        </div>
      </header>

      {/* ━━ 01 · COLOR SYSTEM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="mb-16">
        <SectionHeader number="01" label="Foundation" title="Color System" />

        {/* Swatches */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {colors.map((c) => (
            <div key={c.name} className="bg-white rounded-xl overflow-hidden border border-mist/60">
              <div className="h-20" style={{ backgroundColor: c.hex }} />
              <div className="px-4 py-3.5 space-y-0.5">
                <p className="text-covenant-navy" style={subTitleStyle}>{c.name}</p>
                <p className="text-slate-text" style={monoStyle}>{c.hex}</p>
                <p className="text-slate-text" style={{ ...monoStyle, fontSize: "0.6875rem" }}>var({c.variable})</p>
                <p className="text-slate-text mt-1.5" style={{ fontSize: "0.6875rem", lineHeight: 1.5 }}>{c.usage}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Gradient Overlays */}
        <div className="mt-8">
          <p className="text-slate-text mb-3" style={captionStyle}>Gradient Overlays</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-28 rounded-xl overflow-hidden relative bg-gray-300">
              <div className="absolute inset-0 bg-gradient-to-r from-mission-red/70 via-mission-red/30 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white" style={{ fontSize: "0.75rem", fontWeight: 500 }}>Red overlay &mdash; left to transparent</div>
            </div>
            <div className="h-28 rounded-xl overflow-hidden relative bg-gray-300">
              <div className="absolute inset-0 bg-gradient-to-t from-covenant-navy/80 via-covenant-navy/30 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white" style={{ fontSize: "0.75rem", fontWeight: 500 }}>Navy overlay &mdash; bottom to transparent</div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ━━ 02 · TYPOGRAPHY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="my-16">
        <SectionHeader number="02" label="Foundation" title="Typography" />

        {/* Scale Table */}
        <div className="bg-white rounded-xl border border-mist/60 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-field-sand/60">
                {["Element", "Font", "Size / Line Height", "Weight"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-covenant-navy" style={captionStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {typography.map((t, i) => (
                <tr key={t.name} className={`border-t border-mist/50 ${i % 2 === 0 ? "" : "bg-field-sand/20"}`}>
                  <td className="px-5 py-3 text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{t.name}</td>
                  <td className="px-5 py-3 text-slate-text" style={{ fontSize: "0.8125rem" }}>{t.family}</td>
                  <td className="px-5 py-3 text-slate-text" style={monoStyle}>{t.size}</td>
                  <td className="px-5 py-3 text-slate-text" style={{ fontSize: "0.8125rem" }}>{t.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Specimens */}
        <div className="mt-6 bg-white rounded-xl border border-mist/60 divide-y divide-mist/50">
          <div className="px-8 py-7">
            <span className="text-slate-text" style={{ fontSize: "0.6875rem", letterSpacing: "0.04em" }}>H1 &mdash; Inter ExtraBold</span>
            <h1 className="text-covenant-navy mt-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: "3.75rem", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.025em" }}>
              Field Stories
            </h1>
          </div>
          <div className="px-8 py-7">
            <span className="text-slate-text" style={{ fontSize: "0.6875rem", letterSpacing: "0.04em" }}>H2 &mdash; Inter Bold</span>
            <h2 className="text-covenant-navy mt-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: "2.75rem", fontWeight: 700, lineHeight: 1.18, letterSpacing: "-0.02em" }}>
              What God Is Doing
            </h2>
          </div>
          <div className="px-8 py-7">
            <span className="text-slate-text" style={{ fontSize: "0.6875rem", letterSpacing: "0.04em" }}>H3 &mdash; Inter SemiBold</span>
            <h3 className="text-covenant-navy mt-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: "1.875rem", fontWeight: 600, lineHeight: 1.26 }}>
              Local Churches
            </h3>
          </div>
          <div className="px-8 py-7">
            <span className="text-slate-text" style={{ fontSize: "0.6875rem", letterSpacing: "0.04em" }}>Body Large &mdash; DM Sans 18/28</span>
            <p className="text-ink mt-1.5 max-w-2xl" style={{ fontFamily: "var(--font-body)", fontSize: "1.125rem", lineHeight: "1.75rem" }}>
              Kapatid Ministry was born from a simple conviction: that the most effective way to serve communities in the Philippines is to walk alongside the local churches already rooted there.
            </p>
          </div>
          <div className="px-8 py-7">
            <span className="text-slate-text" style={{ fontSize: "0.6875rem", letterSpacing: "0.04em" }}>Quote / Scripture &mdash; Inter Light (300)</span>
            <p className="text-ink mt-2 max-w-2xl" style={{ fontFamily: "var(--font-serif)", fontSize: "1.375rem", lineHeight: 1.55, fontWeight: 300, letterSpacing: "-0.01em" }}>
              &ldquo;Come and see what God has done, his awesome deeds for mankind!&rdquo;
            </p>
            <p className="text-slate-text mt-3 flex items-center gap-2" style={{ fontSize: "0.6875rem" }}>
              <span className="inline-block w-4 h-[2px] bg-harvest-gold/40 rounded-full" />
              DM Serif Display removed &mdash; all quote text is now Inter Light via <code className="bg-field-sand px-1.5 py-0.5 rounded text-covenant-navy" style={{ fontSize: "0.65rem" }}>var(--font-serif)</code>
            </p>
          </div>
        </div>

        {/* Font Stack */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { var: "--font-heading", value: "Inter", note: "Headings, buttons, nav", weights: "600 – 800" },
            { var: "--font-body", value: "DM Sans", note: "Body text, captions", weights: "400" },
            { var: "--font-serif", value: "Inter Light", note: "Scripture & pull-quotes", weights: "300" },
          ].map((f) => (
            <div key={f.var} className="bg-field-sand/60 rounded-xl px-5 py-4 border border-mist/40">
              <p className="text-covenant-navy" style={subTitleStyle}>{f.value}</p>
              <p className="text-slate-text mt-0.5" style={{ ...monoStyle, fontSize: "0.6875rem" }}>var({f.var})</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-slate-text" style={{ fontSize: "0.6875rem" }}>{f.note}</span>
                <span className="text-covenant-navy bg-white px-2 py-0.5 rounded" style={{ fontSize: "0.625rem", fontWeight: 600 }}>{f.weights}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ━━ 03 · SPACING & LAYOUT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="my-16">
        <SectionHeader number="03" label="Foundation" title="Spacing & Layout" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {spacingRules.map((rule) => (
            <div key={rule.label} className="bg-white rounded-xl border border-mist/60 px-5 py-4">
              <p className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 700 }}>{rule.value}</p>
              <p className="text-slate-text mt-1" style={{ fontSize: "0.75rem" }}>{rule.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ━━ 04 · BUTTONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="my-16">
        <SectionHeader number="04" label="Components" title="Buttons" />

        <p className="text-slate-text -mt-4 mb-8 max-w-xl" style={{ fontSize: "0.875rem", lineHeight: 1.65 }}>
          All buttons use pill shape (rounded-full). Primary uses Harvest Gold. Secondary uses transparent with gold border. Minimal use of red.
        </p>

        {/* Primary Row */}
        <div className="bg-white rounded-xl border border-mist/60 p-6 mb-3">
          <p className="text-slate-text mb-4" style={captionStyle}>Primary Variants</p>
          <div className="flex flex-wrap gap-5 items-end">
            {(["lg", "md", "sm"] as const).map((size) => (
              <div key={size} className="space-y-2 text-center">
                <Button size={size}>Primary {size.toUpperCase()}</Button>
                <p className="text-slate-text" style={{ fontSize: "0.625rem", letterSpacing: "0.04em" }}>{size}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Row */}
        <div className="bg-white rounded-xl border border-mist/60 p-6 mb-3">
          <p className="text-slate-text mb-4" style={captionStyle}>Secondary &amp; Ghost</p>
          <div className="flex flex-wrap gap-5 items-end">
            <div className="space-y-2 text-center">
              <Button variant="secondary" size="lg">Secondary</Button>
              <p className="text-slate-text" style={{ fontSize: "0.625rem" }}>secondary</p>
            </div>
            <div className="space-y-2 text-center">
              <Button variant="outline" size="md">Outline</Button>
              <p className="text-slate-text" style={{ fontSize: "0.625rem" }}>outline</p>
            </div>
            <div className="space-y-2 text-center">
              <Button variant="ghost" size="md">Ghost</Button>
              <p className="text-slate-text" style={{ fontSize: "0.625rem" }}>ghost</p>
            </div>
          </div>
        </div>

        {/* Dark / Gold contexts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-covenant-navy rounded-xl p-6">
            <p className="text-white/40 mb-4" style={captionStyle}>On Dark Background</p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="md" className="!bg-white !text-mission-red hover:!bg-white/90">Give</Button>
              <Button variant="secondary" size="md" className="!border-white/50 !text-white hover:!bg-white/10">Secondary</Button>
            </div>
          </div>
          <div className="bg-harvest-gold rounded-xl p-6">
            <p className="text-white/50 mb-4" style={captionStyle}>CTA Banner Buttons</p>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                className="inline-flex items-center gap-2 bg-white text-harvest-gold rounded-full px-7 py-3.5 shadow-xl shadow-black/10"
                style={{ fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 700, letterSpacing: "-0.01em" }}
              >
                Give Today <ArrowRight size={16} strokeWidth={2.5} />
              </button>
              <button
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white rounded-full px-7 py-3"
                style={{ fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 600 }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ━━ 05 · SCRIPTURE BLOCKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="my-16">
        <SectionHeader number="05" label="Components" title="Scripture Blocks (6 Variants)" />

        <p className="text-slate-text -mt-4 mb-8 max-w-xl" style={{ fontSize: "0.875rem", lineHeight: 1.65 }}>
          All scripture text renders in Inter Light&nbsp;(300). Each variant serves a specific layout context.
        </p>

        <div className="space-y-4">
          {/* Hero */}
          <div className="bg-white rounded-xl border border-mist/60 overflow-hidden">
            <div className="px-6 py-3 border-b border-mist/50 flex items-center justify-between">
              <span className="text-covenant-navy" style={subTitleStyle}>Hero</span>
              <span className="text-slate-text" style={{ fontSize: "0.6875rem" }}>Over dark hero images</span>
            </div>
            <div className="bg-covenant-navy p-8">
              <ScriptureBlock text="The Lord is my shepherd; I shall not want." reference="Psalm 23:1" variant="hero" />
            </div>
          </div>

          {/* Navy */}
          <div className="bg-white rounded-xl border border-mist/60 overflow-hidden">
            <div className="px-6 py-3 border-b border-mist/50 flex items-center justify-between">
              <span className="text-covenant-navy" style={subTitleStyle}>Navy</span>
              <span className="text-slate-text" style={{ fontSize: "0.6875rem" }}>Standalone emphasis sections</span>
            </div>
            <div className="p-6">
              <ScriptureBlock text="Come and see what God has done, his awesome deeds for mankind!" reference="Psalm 66:5" variant="navy" />
            </div>
          </div>

          {/* Inline + Gold (side by side) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-mist/60 overflow-hidden">
              <div className="px-6 py-3 border-b border-mist/50 flex items-center justify-between">
                <span className="text-covenant-navy" style={subTitleStyle}>Inline</span>
                <span className="text-slate-text" style={{ fontSize: "0.6875rem" }}>Pull quotes in articles</span>
              </div>
              <div className="p-6">
                <ScriptureBlock text="Devote yourselves to prayer, being watchful and thankful." reference="Colossians 4:2" variant="inline" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-mist/60 overflow-hidden">
              <div className="px-6 py-3 border-b border-mist/50 flex items-center justify-between">
                <span className="text-covenant-navy" style={subTitleStyle}>Gold Accent</span>
                <span className="text-slate-text" style={{ fontSize: "0.6875rem" }}>Warm feature blocks</span>
              </div>
              <div className="p-6">
                <ScriptureBlock text="Two are better than one, because they have a good reward for their toil." reference="Ecclesiastes 4:9" variant="gold" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white rounded-xl border border-mist/60 overflow-hidden">
            <div className="px-6 py-3 border-b border-mist/50 flex items-center justify-between">
              <span className="text-covenant-navy" style={subTitleStyle}>Footer</span>
              <span className="text-slate-text" style={{ fontSize: "0.6875rem" }}>Bottom of every page in footer</span>
            </div>
            <div className="bg-covenant-navy p-8">
              <ScriptureBlock text="And let us not grow weary of doing good, for in due season we will reap." reference="Galatians 6:9" variant="footer" />
            </div>
          </div>

          {/* Cinematic */}
          <div className="bg-white rounded-xl border border-mist/60 overflow-hidden">
            <div className="px-6 py-3 border-b border-mist/50">
              <div className="flex items-center justify-between">
                <span className="text-covenant-navy" style={subTitleStyle}>Cinematic</span>
                <span className="text-slate-text" style={{ fontSize: "0.6875rem" }}>Full-bleed, all 9 pages</span>
              </div>
              <p className="text-slate-text mt-1.5 max-w-lg" style={{ fontSize: "0.75rem", lineHeight: 1.55 }}>
                Unique Unsplash background per page, dark gradient overlay, film grain texture, decorative open-quote, scroll-triggered Motion animations, gold accent line.
              </p>
            </div>
            <div className="rounded-b-xl overflow-hidden">
              <ScriptureBlock
                text="The Lord is my shepherd; I shall not want. He makes me lie down in green pastures."
                reference="Psalm 23:1-2"
                variant="cinematic"
                backgroundImage="https://images.unsplash.com/photo-1564425228960-f0f173a1e52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQaGlsaXBwaW5lcyUyMG9jZWFuJTIwc3Vuc2V0JTIwY2luZW1hdGljJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3MjQzMDQ5M3ww&ixlib=rb-4.1.0&q=80&w=1080"
              />
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ━━ 06 · CTA BANNER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="my-16">
        <SectionHeader number="06" label="Components" title="CTA Banner" />

        <p className="text-slate-text -mt-4 mb-8 max-w-xl" style={{ fontSize: "0.875rem", lineHeight: 1.65 }}>
          Reusable call-to-action on all 10 public pages. Appears after the cinematic scripture block, before the footer.
        </p>

        {/* Spec Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-mist/60 p-5">
            <p className="text-covenant-navy mb-3" style={subTitleStyle}>Visual Design</p>
            <ul className="text-slate-text space-y-1.5" style={{ fontSize: "0.75rem", lineHeight: 1.6 }}>
              <li className="flex gap-2"><Minus size={12} className="shrink-0 mt-0.5 text-harvest-gold" /><span><strong className="text-ink">Background:</strong> Harvest Gold (#D89B3C)</span></li>
              <li className="flex gap-2"><Minus size={12} className="shrink-0 mt-0.5 text-harvest-gold" /><span><strong className="text-ink">Gradients:</strong> Layered radial (top-left white, bottom-right dark)</span></li>
              <li className="flex gap-2"><Minus size={12} className="shrink-0 mt-0.5 text-harvest-gold" /><span><strong className="text-ink">Decoration:</strong> Floating circle outlines, center blur sphere</span></li>
              <li className="flex gap-2"><Minus size={12} className="shrink-0 mt-0.5 text-harvest-gold" /><span><strong className="text-ink">Edge lines:</strong> Subtle white gradient lines top &amp; bottom</span></li>
              <li className="flex gap-2"><Minus size={12} className="shrink-0 mt-0.5 text-harvest-gold" /><span><strong className="text-ink">Padding:</strong> py-28 / lg:py-36</span></li>
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-mist/60 p-5">
            <p className="text-covenant-navy mb-3" style={subTitleStyle}>Typography &amp; Interaction</p>
            <ul className="text-slate-text space-y-1.5" style={{ fontSize: "0.75rem", lineHeight: 1.6 }}>
              <li className="flex gap-2"><Minus size={12} className="shrink-0 mt-0.5 text-harvest-gold" /><span><strong className="text-ink">Headline:</strong> Inter 800, clamp(1.75rem, 4vw, 2.75rem), white</span></li>
              <li className="flex gap-2"><Minus size={12} className="shrink-0 mt-0.5 text-harvest-gold" /><span><strong className="text-ink">Body:</strong> clamp(1rem, 1.5vw, 1.125rem), white/75</span></li>
              <li className="flex gap-2"><Minus size={12} className="shrink-0 mt-0.5 text-harvest-gold" /><span><strong className="text-ink">Primary btn:</strong> White bg, gold text, pill, shadow-xl, arrow</span></li>
              <li className="flex gap-2"><Minus size={12} className="shrink-0 mt-0.5 text-harvest-gold" /><span><strong className="text-ink">Ghost btn:</strong> Transparent, white/40 border</span></li>
              <li className="flex gap-2"><Minus size={12} className="shrink-0 mt-0.5 text-harvest-gold" /><span><strong className="text-ink">Hover:</strong> scale(1.03) + y(-2) via Motion</span></li>
            </ul>
          </div>
        </div>

        {/* Page CTA Table */}
        <div className="bg-white rounded-xl border border-mist/60 overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-mist/50">
            <p className="text-covenant-navy" style={subTitleStyle}>Page-Specific CTA Content</p>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-field-sand/50">
                {["Page", "Headline", "Links To"].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-covenant-navy" style={captionStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ctaPages.map((row, i) => (
                <tr key={row.page} className={`border-t border-mist/40 ${i % 2 === 0 ? "" : "bg-field-sand/15"}`}>
                  <td className="px-5 py-2.5 text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{row.page}</td>
                  <td className="px-5 py-2.5 text-slate-text" style={{ fontSize: "0.8125rem" }}>{row.headline}</td>
                  <td className="px-5 py-2.5">
                    <code className="bg-field-sand px-2 py-0.5 rounded text-covenant-navy" style={{ fontSize: "0.6875rem" }}>{row.link}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Preview */}
        <p className="text-slate-text mb-3" style={captionStyle}>Live Preview</p>
        <div className="rounded-xl overflow-hidden border border-mist/60">
          <CTABanner
            headline="Be Part of What God Is Doing"
            description="Your generosity reaches Filipino communities through local churches already rooted in love and service."
            primaryLabel="Give Today"
            primaryTo="/give"
            secondaryLabel="Read Stories"
            secondaryTo="/stories"
          />
        </div>
      </section>

      <Divider />

      {/* ━━ 07 · SECTION STYLING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="my-16">
        <SectionHeader number="07" label="Patterns" title="Section Styling Rules" />

        <div className="space-y-2.5 mb-6">
          {[
            { bg: "bg-light-linen", label: "Light Linen", desc: "Cards & clean sections", hex: "#FAF8F4" },
            { bg: "bg-field-sand", label: "Field Sand", desc: "Alternate content backgrounds", hex: "#F1ECE3" },
            { bg: "bg-covenant-navy", label: "Covenant Navy", desc: "Emphasis, cinematic scripture, media", hex: "#103B53", light: true },
            { bg: "bg-harvest-gold", label: "Harvest Gold", desc: "CTA banners (page-bottom)", hex: "#D89B3C", light: true },
            { bg: "bg-mission-red", label: "Mission Red", desc: "Hero overlays, newsletter accents", hex: "#C84C3D", light: true },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-lg px-5 py-3.5 flex items-center gap-4`}>
              <span className={`${s.light ? "text-white" : "text-covenant-navy"} shrink-0`} style={subTitleStyle}>{s.label}</span>
              <span className={`${s.light ? "text-white/60" : "text-slate-text"} flex-1`} style={{ fontSize: "0.75rem" }}>{s.desc}</span>
              <span className={s.light ? "text-white/40" : "text-slate-text"} style={monoStyle}>{s.hex}</span>
            </div>
          ))}
        </div>

        {/* Page Composition Stack */}
        <div className="bg-white rounded-xl border border-mist/60 p-5">
          <p className="text-covenant-navy mb-4" style={subTitleStyle}>Standard Page Composition (bottom-of-page)</p>
          <div className="space-y-1.5">
            {[
              { label: "Main Content Sections", color: "bg-field-sand", text: "text-ink", icon: "1" },
              { label: "Cinematic Scripture Block", color: "bg-covenant-navy", text: "text-white", icon: "2", note: "Unique Unsplash bg" },
              { label: "CTA Banner", color: "bg-harvest-gold", text: "text-white", icon: "3", note: "Contextual headline" },
              { label: "Footer", color: "bg-covenant-navy", text: "text-white", icon: "4" },
            ].map((item) => (
              <div key={item.label} className={`${item.color} rounded-lg px-5 py-3 flex items-center gap-3`}>
                <span className={`${item.text} opacity-40 shrink-0`} style={{ fontFamily: "var(--font-heading)", fontSize: "0.6875rem", fontWeight: 700 }}>{item.icon}</span>
                <span className={item.text} style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{item.label}</span>
                {item.note && <span className={`${item.text} opacity-50 ml-auto`} style={{ fontSize: "0.6875rem" }}>{item.note}</span>}
              </div>
            ))}
          </div>
          <p className="text-mission-red mt-4 flex items-center gap-2" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
            <span className="w-1.5 h-1.5 rounded-full bg-mission-red shrink-0" />
            Avoid stacking too many dark sections consecutively.
          </p>
        </div>
      </section>

      <Divider />

      {/* ━━ 08 · ICONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="my-16">
        <SectionHeader number="08" label="Components" title="Icon Style" />

        <div className="bg-white rounded-xl border border-mist/60 p-6">
          <div className="flex flex-wrap gap-5 items-center mb-5">
            {([
              { name: "Heart", Icon: Heart },
              { name: "Users", Icon: Users },
              { name: "BookOpen", Icon: BookOpen },
              { name: "DollarSign", Icon: DollarSign },
              { name: "Film", Icon: Film },
              { name: "Palette", Icon: Palette },
            ]).map(({ name, Icon }) => (
              <div key={name} className="text-center w-16">
                <div className="w-12 h-12 rounded-xl bg-field-sand flex items-center justify-center mx-auto mb-1.5">
                  <Icon size={22} className="text-harvest-gold" strokeWidth={2} />
                </div>
                <span className="text-slate-text block" style={{ fontSize: "0.625rem", letterSpacing: "0.02em" }}>{name}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-mist/50 pt-4 flex flex-wrap gap-x-8 gap-y-2">
            {[
              { label: "Style", value: "Line icons" },
              { label: "Stroke", value: "#D89B3C (Gold)" },
              { label: "Weight", value: "2px" },
              { label: "Corners", value: "Rounded" },
            ].map((spec) => (
              <span key={spec.label} className="text-slate-text" style={{ fontSize: "0.75rem" }}>
                {spec.label}: <strong className="text-covenant-navy">{spec.value}</strong>
              </span>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ━━ 09 · DESIGN DIRECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="my-16">
        <SectionHeader number="09" label="Philosophy" title="Overall Design Direction" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-mist/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-mission-red" />
              <h3 className="text-mission-red" style={subTitleStyle}>This is NOT</h3>
            </div>
            <ul className="text-slate-text space-y-2" style={{ fontSize: "0.8125rem" }}>
              <li className="flex gap-2.5"><span className="text-mist">—</span> A marketing agency website</li>
              <li className="flex gap-2.5"><span className="text-mist">—</span> A corporate NGO website</li>
              <li className="flex gap-2.5"><span className="text-mist">—</span> A church template theme</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-mist/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-harvest-gold" />
              <h3 className="text-harvest-gold" style={subTitleStyle}>This IS</h3>
            </div>
            <ul className="text-slate-text space-y-2" style={{ fontSize: "0.8125rem" }}>
              <li className="flex gap-2.5"><span className="text-harvest-gold">—</span> A Christ-centered field report platform</li>
              <li className="flex gap-2.5"><span className="text-harvest-gold">—</span> A visual testimony archive</li>
              <li className="flex gap-2.5"><span className="text-harvest-gold">—</span> A collaborative mission story system</li>
              <li className="flex gap-2.5"><span className="text-harvest-gold">—</span> A transparent reporting tool</li>
            </ul>
          </div>
        </div>

        {/* Priority */}
        <div className="bg-covenant-navy rounded-xl p-6">
          <p className="text-harvest-gold mb-4" style={captionStyle}>Visual Priority Order</p>
          <div className="flex flex-wrap gap-2">
            {["Photography", "Scripture", "Stories", "Numbers", "CTA Banners", "Calls to Action"].map((item, i) => (
              <span key={item} className="bg-white/8 text-white px-4 py-2 rounded-full flex items-center gap-2" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                <span className="text-harvest-gold/60" style={{ fontSize: "0.625rem", fontWeight: 700 }}>{i + 1}</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
