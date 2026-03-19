"use client"
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  Tag,
  ArrowRight,
  Clock,
  Share2,
  Link2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useStories, usePartners } from "../hooks/useData";
import { StoryCard } from "../components/shared/StoryCard";
import { Button } from "../components/shared/Button";
import { CTABanner } from "../components/shared/CTABanner";
import { StoryRenderer, parseContent, blocksToPlainText } from "../components/shared/StoryRenderer";

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(3, Math.ceil(words / 200));
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export function StoryDetailPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const { stories } = useStories();
  const { partners } = usePartners();
  const story = stories.find((s) => s.slug === slug);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (!story) {
    return (
      <div className="pt-36 pb-24 text-center bg-light-linen min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-field-sand flex items-center justify-center mb-5">
          <BookOpen size={24} className="text-slate-text/40" />
        </div>
        <h2 className="text-covenant-navy mb-2">Story not found</h2>
        <p className="text-slate-text mb-6" style={{ fontSize: "0.9375rem" }}>
          This story may have been moved or is no longer available.
        </p>
        <Link href="/stories">
          <Button variant="outline">
            <ArrowLeft size={15} />
            Back to Stories
          </Button>
        </Link>
      </div>
    );
  }

  return <StoryDetailContent story={story} stories={stories} partners={partners} slug={slug || ""} />;
}

function StoryDetailContent({ story, stories, partners, slug }: { story: any; stories: any[]; partners: any[]; slug: string }) {
  const [linkCopied, setLinkCopied] = useState(false);

  // Reading progress
  const { scrollYProgress } = useScroll();

  // Parallax on hero
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScrollProgress, [0, 1], [0, 100]);

  const partner = partners.find((p) => p.id === story.partner_id);
  const storyIdx = stories.findIndex((s) => s.id === story.id);
  const prevStory = storyIdx > 0 ? stories[storyIdx - 1] : null;
  const nextStory = storyIdx < stories.length - 1 ? stories[storyIdx + 1] : null;
  const related = stories
    .filter((s) => s.id !== story.id && s.category === story.category)
    .slice(0, 3);
  const moreStories =
    related.length >= 2
      ? related
      : stories.filter((s) => s.id !== story.id).slice(0, 3);

  const fullText = (() => {
    const blocks = parseContent(story.content);
    if (blocks) {
      return `${story.summary} ${blocksToPlainText(blocks)}`;
    }
    return `${story.summary} ${typeof story.content === "string" ? story.content : ""}`;
  })();
  const readTime = estimateReadTime(fullText);

  // Parse structured content
  const contentBlocks = parseContent(story.content);

  // Legacy: split content into paragraphs
  const contentParagraphs = !contentBlocks && typeof story.content === "string"
    ? story.content
        .split(/\n\n|\.\.\.|\u2026/)
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 20)
    : [];

  const handleShare = () => {
    copyToClipboard(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  return (
    <div className="relative">
      {/* Reading progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-harvest-gold z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative h-[70vh] min-h-[480px] max-h-[720px] overflow-hidden"
      >
        {/* Parallax image */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 -bottom-24">
          <img
            src={story.featured_image}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Lighter overlay — keeps image visible while ensuring text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/5" />
        {/* Subtle vignette on the sides only */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

        {/* Back link — top left */}
        <div className="absolute top-0 left-0 right-0 z-10 pt-24 px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300 group"
                style={{ fontSize: "0.8125rem", fontWeight: 500 }}
              >
                <ArrowLeft
                  size={14}
                  className="group-hover:-translate-x-1 transition-transform duration-300"
                />
                All Stories
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Title area — bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 lg:px-8 pb-10 lg:pb-14">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className="inline-block bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-full"
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {story.category}
                </span>
                <span
                  className="flex items-center gap-1.5 text-white/50"
                  style={{ fontSize: "0.75rem" }}
                >
                  <Calendar size={11} strokeWidth={2} />
                  {formatDate(story.created_at)}
                </span>
                <span
                  className="flex items-center gap-1.5 text-white/50"
                  style={{ fontSize: "0.75rem" }}
                >
                  <Clock size={11} strokeWidth={2} />
                  {readTime} min read
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-white"
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.875rem)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  fontWeight: 800,
                }}
              >
                {story.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Article Body ──────────────────────────────────────── */}
      <section className="bg-light-linen">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          {/* Author / Partner bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-between mb-10 pb-8 border-b border-mist/40"
          >
            <div className="flex items-center gap-3">
              {partner && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-field-sand bg-field-sand">
                    <img
                      src={partner.image}
                      alt={partner.pastor_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <Link
                      href={`/partners/${partner.id}`}
                      className="text-covenant-navy hover:text-harvest-gold transition-colors duration-300"
                      style={{ fontSize: "0.875rem", fontWeight: 700 }}
                    >
                      {partner.church_name}
                    </Link>
                    <p
                      className="text-slate-text/60"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {partner.location}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-mist/40 text-slate-text/60 hover:border-harvest-gold/30 hover:text-harvest-gold transition-all duration-300 cursor-pointer"
              style={{ fontSize: "0.75rem", fontWeight: 600 }}
            >
              {linkCopied ? (
                <span className="inline-flex items-center gap-2">
                  <Link2 size={13} className="text-harvest-gold" />
                  <span className="text-harvest-gold">Copied!</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Share2 size={13} />
                  Share
                </span>
              )}
            </button>
          </motion.div>

          {/* Article content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Lead / Summary with drop cap */}
            <p
              className="text-ink mb-8 first-letter:float-left first-letter:text-[3.25rem] first-letter:leading-[0.85] first-letter:mr-3 first-letter:mt-1.5 first-letter:font-bold first-letter:text-covenant-navy"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.1875rem",
                lineHeight: "1.8",
                fontWeight: 400,
              }}
            >
              {story.summary}
            </p>

            {/* Gold accent divider */}
            <div className="flex items-center gap-2 mb-10">
              <div className="h-[2px] w-8 bg-harvest-gold/50 rounded-full" />
              <div className="h-[2px] w-2 bg-harvest-gold/20 rounded-full" />
            </div>

            {/* Structured JSON content */}
            {contentBlocks ? (
              <StoryRenderer blocks={contentBlocks} />
            ) : (
              /* Legacy plain text content */
              <div className="space-y-6">
                {contentParagraphs.length > 0 ? (
                  contentParagraphs.map((para: string, i: number) => (
                    <div key={i}>
                      <p
                        className="text-ink/80"
                        style={{
                          fontSize: "1.0625rem",
                          lineHeight: "1.9",
                        }}
                      >
                        {para}
                      </p>

                      {/* Pull quote after first paragraph */}
                      {i === 0 && (
                        <blockquote className="relative my-10 py-1 pl-6 border-l-[3px] border-harvest-gold/60">
                          <p
                            className="text-covenant-navy/70"
                            style={{
                              fontFamily: "var(--font-heading)",
                              fontSize: "1.125rem",
                              lineHeight: "1.65",
                              fontWeight: 600,
                              fontStyle: "italic",
                              letterSpacing: "-0.01em",
                            }}
                          >
                            &ldquo;We have seen God move in ways we never
                            expected. This is His work — we are just His
                            instruments.&rdquo;
                          </p>
                        </blockquote>
                      )}

                      {/* Full-width image break after second paragraph */}
                      {i === 1 && contentParagraphs.length > 2 && (
                        <figure className="my-10 -mx-2 sm:-mx-4 lg:-mx-10">
                          <div className="aspect-[2/1] rounded-2xl overflow-hidden">
                            <img
                              src={story.featured_image}
                              alt={story.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <figcaption
                            className="text-center text-slate-text/40 mt-3 px-4"
                            style={{
                              fontSize: "0.75rem",
                              fontStyle: "italic",
                            }}
                          >
                            Life in the community —{" "}
                            {story.category.toLowerCase()} ministry in action
                          </figcaption>
                        </figure>
                      )}
                    </div>
                  ))
                ) : (
                  <p
                    className="text-ink/80"
                    style={{ fontSize: "1.0625rem", lineHeight: "1.9" }}
                  >
                    {typeof story.content === "string" ? story.content : ""}
                  </p>
                )}

                {/* Closing paragraphs (only for legacy content) */}
                <p
                  className="text-ink/80"
                  style={{ fontSize: "1.0625rem", lineHeight: "1.9" }}
                >
                  The impact of this work extends beyond what we can measure.
                  Changed lives, restored hope, and communities coming together in
                  faith — this is what God continues to do through His people.
                </p>
                <p
                  className="text-ink/80"
                  style={{ fontSize: "1.0625rem", lineHeight: "1.9" }}
                >
                  As we look ahead, we remain committed to walking alongside these
                  communities, trusting God for provision and wisdom in every step.
                </p>
              </div>
            )}

            {/* Bottom tag + share bar */}
            <div className="mt-14 pt-8 border-t border-mist/40 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Tag size={13} className="text-slate-text/30" />
                <span
                  className="bg-field-sand text-covenant-navy/70 px-3 py-1 rounded-full"
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {story.category}
                </span>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-mist/40 text-slate-text/60 hover:border-harvest-gold/30 hover:text-harvest-gold transition-all duration-300 cursor-pointer"
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                {linkCopied ? (
                  <span className="inline-flex items-center gap-2">
                    <Link2 size={13} className="text-harvest-gold" />
                    Link Copied!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Share2 size={13} />
                    Share This Story
                  </span>
                )}
              </button>
            </div>
          </motion.article>
        </div>
      </section>

      {/* ── Related Stories ────────────────────────────────────── */}
      {moreStories.length > 0 && (
        <section className="py-20 lg:py-24 px-6 lg:px-8 bg-field-sand">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="block w-7 h-[2px] bg-harvest-gold/30 rounded-full" />
                  <span
                    className="text-harvest-gold/60 uppercase"
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                    }}
                  >
                    Keep Reading
                  </span>
                  <span className="block w-7 h-[2px] bg-harvest-gold/30 rounded-full" />
                </div>
                <h2
                  className="text-covenant-navy"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  More Stories of Faith
                </h2>
              </motion.div>

              {/* Prev / Next arrows */}
              {(prevStory || nextStory) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center gap-2"
                >
                  {prevStory ? (
                    <Link
                      href={`/stories/${prevStory.slug}`}
                      className="group flex items-center gap-2 px-3 py-2 rounded-full border border-mist/40 hover:border-harvest-gold/30 hover:bg-harvest-gold/5 transition-all duration-300"
                      title={prevStory.title}
                    >
                      <ChevronLeft
                        size={14}
                        className="text-slate-text group-hover:text-harvest-gold transition-colors"
                      />
                      <span
                        className="hidden sm:inline text-slate-text group-hover:text-harvest-gold transition-colors max-w-[120px] truncate"
                        style={{ fontSize: "0.75rem", fontWeight: 600 }}
                      >
                        Previous
                      </span>
                    </Link>
                  ) : (
                    <div className="px-3 py-2 rounded-full border border-mist/20 opacity-30 cursor-default">
                      <ChevronLeft size={14} className="text-slate-text" />
                    </div>
                  )}
                  {nextStory ? (
                    <Link
                      href={`/stories/${nextStory.slug}`}
                      className="group flex items-center gap-2 px-3 py-2 rounded-full border border-mist/40 hover:border-harvest-gold/30 hover:bg-harvest-gold/5 transition-all duration-300"
                      title={nextStory.title}
                    >
                      <span
                        className="hidden sm:inline text-slate-text group-hover:text-harvest-gold transition-colors max-w-[120px] truncate"
                        style={{ fontSize: "0.75rem", fontWeight: 600 }}
                      >
                        Next
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-slate-text group-hover:text-harvest-gold transition-colors"
                      />
                    </Link>
                  ) : (
                    <div className="px-3 py-2 rounded-full border border-mist/20 opacity-30 cursor-default">
                      <ChevronRight size={14} className="text-slate-text" />
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {moreStories.map((s, i) => (
                <StoryCard key={s.id} story={s} index={i} />
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-10"
            >
              <Link href="/stories">
                <Button variant="outline">
                  View All Stories
                  <ArrowRight size={15} />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <CTABanner
        headline="Support Stories Like This"
        description="Your faithful giving helps make these stories possible. Walk alongside the communities and churches we serve."
        primaryLabel="Give Today"
        primaryTo="/give"
        secondaryLabel="View All Stories"
        secondaryTo="/stories"
      />
    </div>
  );
}