"use client";
import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Calendar } from "lucide-react";
import type { Story } from "../../data/mockData";

function getReadingTime(story: Story): number {
  let text = "";
  if (typeof story.content === "string") {
    text = story.content;
  } else if (Array.isArray(story.content)) {
    text = story.content
      .map((block: any) => {
        if (block.type === "paragraph" || block.type === "heading" || block.type === "quote" || block.type === "callout") {
          return block.content || "";
        }
        if (block.type === "list") {
          return (block.items || []).join(" ");
        }
        return "";
      })
      .join(" ");
  }
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 230));
}

interface StoryCardProps {
  story: Story;
  index?: number;
  variant?: "default" | "featured" | "horizontal";
}

export function StoryCard({ story, index = 0, variant = "default" }: StoryCardProps) {
  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href={`/stories/${story.slug}`} className="group block">
          <div className="relative overflow-hidden rounded-2xl aspect-[16/8] md:aspect-[16/7] bg-field-sand hover:shadow-2xl hover:shadow-covenant-navy/10 transition-all duration-500">
            <img
              src={story.featured_image}
              alt={story.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Hover arrow */}
            <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <ArrowUpRight size={16} className="text-white" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-10 flex flex-col justify-end">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="inline-block bg-harvest-gold/90 text-white px-3 py-1 rounded-full"
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {story.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-white/40" style={{ fontSize: "0.75rem" }}>
                    <Calendar size={11} />
                    {new Date(story.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <h2
                  className="text-white group-hover:text-harvest-gold/90 transition-colors duration-300"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {story.title}
                </h2>
                <p
                  className="text-white/55 mt-3 line-clamp-2 max-w-lg"
                  style={{ fontSize: "0.9375rem", lineHeight: "1.55" }}
                >
                  {story.summary}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === "horizontal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href={`/stories/${story.slug}`} className="group block">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] overflow-hidden rounded-2xl bg-white border border-transparent hover:border-harvest-gold/10 hover:shadow-xl hover:shadow-covenant-navy/6 transition-all duration-500 hover:-translate-y-0.5">
            <div className="aspect-[4/3] md:aspect-auto overflow-hidden relative">
              <img
                src={story.featured_image}
                alt={story.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-white/10" />
            </div>
            <div className="p-5 lg:p-7 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2.5">
                <span
                  className="inline-block bg-field-sand text-covenant-navy px-2.5 py-0.5 rounded-full"
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {story.category}
                </span>
                <span className="flex items-center gap-1 text-slate-text" style={{ fontSize: "0.6875rem" }}>
                  <Calendar size={10} />
                  {new Date(story.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <h3
                className="text-covenant-navy group-hover:text-harvest-gold transition-colors duration-300"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  lineHeight: "1.35",
                  letterSpacing: "-0.01em",
                }}
              >
                {story.title}
              </h3>
              <p
                className="text-slate-text line-clamp-2 mt-2"
                style={{ fontSize: "0.875rem", lineHeight: "1.5" }}
              >
                {story.summary}
              </p>
              <span
                className="inline-flex items-center gap-1 text-harvest-gold mt-4 group-hover:gap-2 transition-all duration-300"
                style={{ fontSize: "0.8125rem", fontWeight: 600 }}
              >
                Read Story <ArrowUpRight size={13} />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default card — Editorial White-Body
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/stories/${story.slug}`} className="group block h-full">
        <div className="h-full flex flex-col overflow-hidden rounded-2xl bg-white border border-mist/50 hover:border-harvest-gold/20 hover:shadow-xl hover:shadow-covenant-navy/6 transition-all duration-500 hover:-translate-y-1">
          {/* Image */}
          <div className="relative overflow-hidden aspect-[4/3]">
            <img
              src={story.featured_image}
              alt={story.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
            {/* Subtle gradient at bottom edge for smooth transition */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/20 to-transparent" />
            {/* Category badge overlapping the image bottom */}
            <div className="absolute top-4 left-4">
              <span
                className="inline-block bg-white/95 backdrop-blur-sm text-covenant-navy px-3 py-1 rounded-full shadow-sm"
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                }}
              >
                {story.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-5 lg:p-6">
            {/* Date */}
            <div className="flex items-center gap-1.5 text-slate-text mb-3">
              <Calendar size={11} className="text-slate-text/60" />
              <span style={{ fontSize: "0.6875rem", fontWeight: 500 }}>
                {new Date(story.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-mist mx-1">·</span>
              <span style={{ fontSize: "0.6875rem", fontWeight: 500 }}>
                {getReadingTime(story)} min read
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-covenant-navy group-hover:text-harvest-gold transition-colors duration-300"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.125rem",
                fontWeight: 700,
                lineHeight: "1.35",
                letterSpacing: "-0.01em",
              }}
            >
              {story.title}
            </h3>

            {/* Summary */}
            <p
              className="text-slate-text line-clamp-2 mt-2 flex-1"
              style={{ fontSize: "0.875rem", lineHeight: "1.6" }}
            >
              {story.summary}
            </p>

            {/* Read link */}
            <div className="mt-4 pt-4 border-t border-mist/40">
              <span
                className="inline-flex items-center gap-1.5 text-harvest-gold group-hover:gap-2.5 transition-all duration-300"
                style={{ fontSize: "0.8125rem", fontWeight: 600 }}
              >
                Read Story <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}