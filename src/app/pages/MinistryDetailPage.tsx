"use client"
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Utensils,
  GraduationCap,
  HeartHandshake,
  Home,
  MessageCircle,
  Heart,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { ScriptureBlock } from "../components/shared/ScriptureBlock";
import { SectionHeader } from "../components/shared/SectionHeader";
import { CTABanner } from "../components/shared/CTABanner";
import { ministries as fallbackMinistries, MinistryProgram } from "../data/ministryData";
import { getMinistries } from "../lib/api";
import { useImages } from "../hooks/useSiteImages";

const iconMap: Record<string, React.ElementType> = {
  Utensils,
  GraduationCap,
  HeartHandshake,
  Home,
};

export function MinistryDetailPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const IMAGES = useImages();
  const [ministries, setMinistries] = useState<MinistryProgram[]>(fallbackMinistries);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMinistries()
      .then((data: any) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setMinistries(data.filter((m: any) => m != null));
        }
      })
      .catch((err: any) => {
        console.error("Failed to load ministries from API, using fallback:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const ministry = ministries.find((m) => m.slug === slug);
  const currentIndex = ministries.findIndex((m) => m.slug === slug);
  const prevMinistry = currentIndex > 0 ? ministries[currentIndex - 1] : null;
  const nextMinistry = currentIndex < ministries.length - 1 ? ministries[currentIndex + 1] : null;
  const otherMinistries = ministries.filter((m) => m.slug !== slug);

  if (!ministry && loading) {
    return (
      <div className="pt-36 pb-24 text-center bg-light-linen min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 size={28} className="animate-spin text-harvest-gold" />
      </div>
    );
  }

  if (!ministry) {
    return (
      <div className="pt-36 pb-24 text-center bg-light-linen min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-covenant-navy">Ministry not found</h2>
        <Link href="/ministries" className="text-harvest-gold mt-4 inline-flex items-center gap-1 hover:underline">
          <ArrowLeft size={16} /> Back to Ministries
        </Link>
      </div>
    );
  }

  const Icon = iconMap[ministry.icon] || HeartHandshake;

  return (
    <div>
      {/* Immersive Hero */}
      <section className="relative h-[65vh] min-h-[420px]">
        <img src={ministry.heroImage} alt={ministry.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-covenant-navy via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-14 z-10">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/ministries"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-5 transition-colors group"
              style={{ fontSize: "0.8125rem" }}
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Ministries
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl backdrop-blur-sm"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                >
                  <Icon size={20} className="text-white" strokeWidth={1.8} />
                </div>
                <span
                  className="text-harvest-gold/70 uppercase"
                  style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em" }}
                >
                  Ministry Program
                </span>
              </div>
              <h1 className="text-white" style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}>
                {ministry.title}
              </h1>
              <p className="text-white/50 mt-3 max-w-2xl" style={{ fontSize: "1.0625rem", lineHeight: "1.7" }}>
                {ministry.tagline}
              </p>
            </motion.div>
          </div>
        </div>
        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown size={18} className="text-white/25" />
          </motion.div>
        </motion.div>
      </section>

      {/* Goal & Description */}
      <section className="py-16 lg:py-20 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-16">
            {/* Main Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {/* Goal block */}
                <div className="bg-field-sand rounded-2xl p-7 lg:p-8 border border-mist/20 mb-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="block w-7 h-[2px] bg-harvest-gold rounded-full" />
                    <span className="text-harvest-gold uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                      Our Goal
                    </span>
                  </div>
                  <p
                    className="text-covenant-navy"
                    style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", lineHeight: "1.7", fontWeight: 300 }}
                  >
                    {ministry.goalText}
                  </p>
                </div>

                {/* Description */}
                <p className="text-ink mb-10" style={{ fontSize: "1rem", lineHeight: "1.75" }}>
                  {ministry.description}
                </p>

                {/* Sub-programs — with ministry-color accent */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="block w-7 h-[2px] bg-harvest-gold rounded-full" />
                  <span className="text-harvest-gold uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                    What This Looks Like
                  </span>
                </div>
                <div className="space-y-5">
                  {ministry.subPrograms.map((sub, i) => (
                    <motion.div
                      key={sub.title}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-white rounded-2xl border border-mist/25 overflow-hidden"
                    >
                      <div className="flex">
                        {/* Ministry-color accent bar */}
                        <div
                          className="w-1 shrink-0 rounded-l-2xl"
                          style={{ backgroundColor: ministry.color }}
                        />
                        <div className="p-7 flex items-start gap-4">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: `${ministry.color}10` }}
                          >
                            <span style={{ color: ministry.color, fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 800 }}>
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          </div>
                          <div>
                            <h3
                              className="text-covenant-navy mb-2"
                              style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em" }}
                            >
                              {sub.title}
                            </h3>
                            <p className="text-slate-text" style={{ fontSize: "0.875rem", lineHeight: "1.6" }}>
                              {sub.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar — sticky on desktop */}
            <aside className="lg:sticky lg:top-28 lg:self-start space-y-5">
              {/* Sponsorship Tiers */}
              {ministry.sponsorshipTiers && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-2xl p-5 border border-mist/40"
                >
                  <h4
                    className="text-covenant-navy/40 mb-3"
                    style={{ fontFamily: "var(--font-heading)", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}
                  >
                    Sponsorship Tiers
                  </h4>
                  <div className="space-y-2">
                    {ministry.sponsorshipTiers.map((tier) => (
                      <div key={tier.frequency} className="flex justify-between items-center py-2 border-b border-mist/20 last:border-0">
                        <span className="text-slate-text" style={{ fontSize: "0.8125rem" }}>{tier.frequency}</span>
                        <span className="text-covenant-navy" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                          &#8369;{tier.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Support CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="bg-covenant-navy rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-harvest-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h4
                    className="text-harvest-gold mb-2"
                    style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 700 }}
                  >
                    Support This Ministry
                  </h4>
                  <p className="text-white/40 mb-5" style={{ fontSize: "0.8125rem", lineHeight: "1.5" }}>
                    Your faithfulness makes this work possible. Start by reaching out to us.
                  </p>
                  <div className="space-y-2.5">
                    <Link
                      href="/contact"
                      className="flex items-center justify-center gap-2 w-full bg-harvest-gold text-white py-3 rounded-xl hover:bg-[#c88e30] transition-colors duration-300"
                      style={{ fontSize: "0.875rem", fontWeight: 700 }}
                    >
                      <MessageCircle size={15} /> Contact Us First
                    </Link>
                    <Link
                      href="/give"
                      className="flex items-center justify-center gap-2 w-full border border-white/20 text-white py-3 rounded-xl hover:bg-white/5 transition-colors duration-300"
                      style={{ fontSize: "0.875rem", fontWeight: 600 }}
                    >
                      <Heart size={15} /> Give Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>
        </div>
      </section>

      {/* How to Support — with vertical timeline */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-field-sand">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <span className="block w-7 h-[2px] bg-harvest-gold rounded-full" />
                <span className="block w-1.5 h-[2px] bg-harvest-gold/40 rounded-full" />
              </div>
              <h2 className="text-covenant-navy">How to Support</h2>
              <p className="mt-4 text-slate-text mx-auto max-w-xl" style={{ fontSize: "1rem", lineHeight: "1.7" }}>
                {ministry.howToSupport.intro}
              </p>
            </motion.div>

            {/* Steps — with vertical timeline connector */}
            <div className="relative mb-8">
              {/* Vertical connector line */}
              <div className="absolute left-[1.125rem] top-6 bottom-6 w-px bg-gradient-to-b from-harvest-gold/25 via-harvest-gold/15 to-transparent hidden sm:block" />
              <div className="space-y-4">
                {ministry.howToSupport.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white rounded-2xl p-6 border border-mist/25 flex items-start gap-4 relative"
                  >
                    <div
                      className="w-9 h-9 rounded-xl bg-harvest-gold/10 flex items-center justify-center shrink-0 relative z-10"
                    >
                      <span className="text-harvest-gold" style={{ fontFamily: "var(--font-heading)", fontSize: "0.8125rem", fontWeight: 800 }}>
                        {i + 1}
                      </span>
                    </div>
                    <p className="text-ink pt-1.5" style={{ fontSize: "0.9375rem", lineHeight: "1.6" }}>
                      {step}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Important Note */}
            {ministry.howToSupport.note && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-harvest-gold/5 border border-harvest-gold/15 rounded-xl px-6 py-4 flex items-start gap-3"
              >
                <BookOpen size={16} className="text-harvest-gold shrink-0 mt-0.5" />
                <p className="text-slate-text" style={{ fontSize: "0.8125rem", lineHeight: "1.6" }}>
                  {ministry.howToSupport.note}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Prev / Next Ministry Navigation */}
      <section className="py-0 bg-light-linen">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 border-t border-b border-mist/30">
            {/* Previous */}
            <div className={`${prevMinistry ? "" : "opacity-0 pointer-events-none"}`}>
              {prevMinistry ? (
                <Link
                  href={`/ministries/${prevMinistry.slug}`}
                  className="group flex items-center gap-4 py-7 pr-6 hover:bg-field-sand/50 transition-colors duration-300"
                >
                  <ChevronLeft size={18} className="text-slate-text/40 group-hover:text-harvest-gold transition-colors shrink-0" />
                  <div>
                    <span className="text-slate-text/50 block" style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Previous
                    </span>
                    <span
                      className="text-covenant-navy group-hover:text-harvest-gold transition-colors"
                      style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 700 }}
                    >
                      {prevMinistry.title}
                    </span>
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>
            {/* Next */}
            <div className={`border-l border-mist/30 ${nextMinistry ? "" : "opacity-0 pointer-events-none"}`}>
              {nextMinistry ? (
                <Link
                  href={`/ministries/${nextMinistry.slug}`}
                  className="group flex items-center justify-end gap-4 py-7 pl-6 hover:bg-field-sand/50 transition-colors duration-300"
                >
                  <div className="text-right">
                    <span className="text-slate-text/50 block" style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Next
                    </span>
                    <span
                      className="text-covenant-navy group-hover:text-harvest-gold transition-colors"
                      style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 700 }}
                    >
                      {nextMinistry.title}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-slate-text/40 group-hover:text-harvest-gold transition-colors shrink-0" />
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Other Ministries */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="Explore Other Ministries" subtitle="See how God is working through each of our four programs." />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {otherMinistries.map((m, i) => {
              const MIcon = iconMap[m.icon] || HeartHandshake;
              return (
                <motion.div
                  key={m.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={`/ministries/${m.slug}`} className="block group">
                    <div className="bg-white rounded-2xl border border-mist/25 overflow-hidden hover:shadow-md hover:shadow-covenant-navy/5 transition-all duration-500 hover:-translate-y-0.5">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={m.cardImage}
                          alt={m.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <MIcon size={16} style={{ color: m.color }} strokeWidth={1.8} />
                          <h4
                            className="text-covenant-navy"
                            style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "-0.01em" }}
                          >
                            {m.title}
                          </h4>
                        </div>
                        <p className="text-slate-text" style={{ fontSize: "0.8125rem", lineHeight: "1.5" }}>
                          {m.tagline}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scripture */}
      <ScriptureBlock
        text={ministry.scripture.text}
        reference={ministry.scripture.reference}
        variant="cinematic"
        backgroundImage={IMAGES.cinematicBible}
      />

      {/* CTA */}
      <CTABanner
        headline="Walk Alongside Us"
        description="Whether through giving, praying, or connecting an OFW family — there's a place for you in this mission."
        primaryLabel="Give Today"
        primaryTo="/give"
        secondaryLabel="Contact Us"
        secondaryTo="/contact"
        variant="navy"
      />
    </div>
  );
}
