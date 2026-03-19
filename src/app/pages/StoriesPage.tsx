"use client"
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Grid3x3, List } from "lucide-react";
import { scriptures } from "../data/mockData";
import { useStories } from "../hooks/useData";
import { useImages } from "../hooks/useSiteImages";
import { ScriptureBlock } from "../components/shared/ScriptureBlock";
import { StoryCard } from "../components/shared/StoryCard";
import { FilterPill } from "../components/shared/FilterPill";
import { CTABanner } from "../components/shared/CTABanner";
import { StoryCardSkeleton } from "../components/shared/Skeleton";

const categories = ["All", "Community", "Education", "Relief", "Church", "Testimony"];

export function StoriesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { stories, loading } = useStories();
  const IMAGES = useImages();
  const filtered = activeFilter === "All" ? stories : stories.filter((s) => s.category === activeFilter);
  const featuredStory = filtered[0];
  const remainingStories = filtered.slice(1);

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-40 pb-28 px-6 lg:px-8 overflow-hidden">
        <img src={IMAGES.children} alt="Stories" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-covenant-navy/85 via-covenant-navy/70 to-covenant-navy/90" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
              <span className="text-harvest-gold/60 uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                From the Field
              </span>
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
            </div>
            <h1 className="text-white">Field Stories</h1>
            <p className="text-white/50 mt-5 max-w-xl mx-auto" style={{ fontSize: "1.0625rem", lineHeight: "1.7" }}>
              Real stories of God's faithfulness from the communities, churches, and families we walk alongside.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar & View Toggle */}
      <section className="py-5 px-6 lg:px-8 bg-light-linen border-b border-mist/40 sticky top-14 z-30 backdrop-blur-xl bg-light-linen/95">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {categories.map((cat) => (
              <FilterPill key={cat} label={cat} active={activeFilter === cat} onClick={() => setActiveFilter(cat)} />
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-1.5"
          >
            <span className="text-slate-text mr-2 hidden sm:inline" style={{ fontSize: "0.75rem" }}>
              {filtered.length} {filtered.length === 1 ? "story" : "stories"}
            </span>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-covenant-navy text-white"
                  : "text-slate-text hover:bg-field-sand"
              }`}
            >
              <Grid3x3 size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === "list"
                  ? "bg-covenant-navy text-white"
                  : "text-slate-text hover:bg-field-sand"
              }`}
            >
              <List size={15} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stories Content */}
      <section className="py-14 lg:py-20 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="text-center py-24"
              >
                <div className="w-16 h-16 rounded-2xl bg-field-sand flex items-center justify-center mx-auto mb-5">
                  <BookOpen size={24} className="text-slate-text" />
                </div>
                <p className="text-slate-text" style={{ fontSize: "1rem" }}>
                  No stories found in this category yet.
                </p>
                <button
                  onClick={() => setActiveFilter("All")}
                  className="mt-4 text-harvest-gold hover:underline cursor-pointer"
                  style={{ fontSize: "0.875rem", fontWeight: 600 }}
                >
                  View all stories
                </button>
              </motion.div>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {Array.from({ length: 6 }).map((_, i) => <StoryCardSkeleton key={i} />)}
              </div>
            ) : viewMode === "grid" ? (
              <motion.div
                key={`grid-${activeFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Featured Story — Hero */}
                {featuredStory && (
                  <div className="mb-10">
                    <StoryCard story={featuredStory} variant="featured" index={0} />
                  </div>
                )}

                {/* Remaining Stories — Masonry-like Grid */}
                {remainingStories.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {remainingStories.map((story, i) => (
                      <StoryCard key={story.id} story={story} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`list-${activeFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 max-w-4xl mx-auto"
              >
                {filtered.map((story, i) => (
                  <StoryCard key={story.id} story={story} variant="horizontal" index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Cinematic Scripture */}
      <ScriptureBlock
        text={scriptures.stories.text}
        reference={scriptures.stories.reference}
        variant="cinematic"
        backgroundImage={IMAGES.cinematicTerraces}
      />

      {/* CTA */}
      <CTABanner
        headline="Inspired by These Stories?"
        description="Your generosity makes stories like these possible. Support the communities, churches, and children we serve."
        primaryLabel="Give Today"
        primaryTo="/give"
        secondaryLabel="Meet Our Partners"
        secondaryTo="/partners"
      />
    </div>
  );
}