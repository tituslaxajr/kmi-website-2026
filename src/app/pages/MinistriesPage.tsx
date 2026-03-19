"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Utensils, GraduationCap, HeartHandshake, Home, ArrowRight, Search, GitMerge, Sprout, Users, MapPin, Church, Heart, ChevronRight } from "lucide-react";
import { SectionHeader } from "../components/shared/SectionHeader";
import { ScriptureBlock } from "../components/shared/ScriptureBlock";
import { CTABanner } from "../components/shared/CTABanner";
import { scriptures } from "../data/mockData";
import { ministries as fallbackMinistries, MinistryProgram } from "../data/ministryData";
import { getMinistries } from "../lib/api";
import { useImages } from "../hooks/useSiteImages";

const iconMap: Record<string, React.ElementType> = {
  Utensils,
  GraduationCap,
  HeartHandshake,
  Home,
};

export function MinistriesPage() {
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

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-40 pb-28 px-6 lg:px-8 overflow-hidden">
        <img src={IMAGES.ministry_heroOverview} alt="Ministries" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-covenant-navy/85 via-covenant-navy/70 to-covenant-navy/90" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
              <span className="text-harvest-gold/60 uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                What We Do
              </span>
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
            </div>
            <h1 className="text-white">Our Ministries</h1>
            <p className="text-white/50 mt-5 max-w-xl mx-auto" style={{ fontSize: "1.0625rem", lineHeight: "1.7" }}>
              Where the Gospel meets real need — serving Filipino families, children, and communities through Christ-centered programs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gospel Intro — redesigned as 2-column with pull quote */}
      <section className="py-16 lg:py-20 px-6 lg:px-8 bg-field-sand">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="block w-7 h-[2px] bg-harvest-gold rounded-full" />
                <span className="text-harvest-gold uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                  Our Purpose
                </span>
              </div>
              <p className="text-ink" style={{ fontSize: "1rem", lineHeight: "1.75" }}>
                Every program we run is rooted in one purpose: to glorify God by transforming communities through the lived and preached Gospel. We don't just meet physical needs — we bring the hope of Jesus Christ to every family, child, and senior citizen we serve.
              </p>
              <p className="text-slate-text mt-4" style={{ fontSize: "0.9375rem", lineHeight: "1.75" }}>
                Through our network of partner churches across the Philippines, these four ministries form the heart of our mission.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="bg-covenant-navy rounded-2xl p-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-harvest-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <span className="text-harvest-gold/40 block mb-3" style={{ fontFamily: "Georgia, serif", fontSize: "3rem", lineHeight: 1 }}>"</span>
                  <p
                    className="text-white/80 -mt-4"
                    style={{ fontFamily: "Georgia, serif", fontSize: "1.0625rem", lineHeight: "1.65", fontStyle: "italic" }}
                  >
                    The Gospel is not just words we preach — it's the life we live alongside every family we serve.
                  </p>
                  <div className="mt-5 pt-4 border-t border-white/[0.08]">
                    <span className="text-white/40" style={{ fontSize: "0.75rem", fontWeight: 600 }}>Kapatid Ministry</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Stats Bar */}
      <section className="py-0 bg-light-linen">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-mist/30 rounded-2xl overflow-hidden border border-mist/30 -mt-8 relative z-10 shadow-sm shadow-covenant-navy/3"
          >
            {[
              { icon: Users, value: "500+", label: "Children Fed Weekly" },
              { icon: GraduationCap, value: "120+", label: "Students Sponsored" },
              { icon: Church, value: "15+", label: "Partner Churches" },
              { icon: MapPin, value: "8", label: "Provinces Reached" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white p-6 lg:p-7 text-center"
              >
                <stat.icon size={20} className="text-harvest-gold mx-auto mb-3" strokeWidth={1.8} />
                <div
                  className="text-covenant-navy"
                  style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}
                >
                  {stat.value}
                </div>
                <div className="text-slate-text mt-1.5" style={{ fontSize: "0.75rem", lineHeight: "1.4" }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Ministry Cards */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="Four Pillars of Ministry" subtitle="Each program begins with the Gospel and ends with lasting transformation." />
          <div className="space-y-6">
            {ministries.map((ministry, i) => {
              const Icon = iconMap[ministry.icon] || HeartHandshake;
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={ministry.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={`/ministries/${ministry.slug}`} className="block group">
                    <div className="bg-white rounded-2xl border border-mist/25 overflow-hidden hover:shadow-lg hover:shadow-covenant-navy/6 transition-all duration-500">
                      <div className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
                        {/* Image */}
                        <div className="lg:w-2/5 aspect-[3/4] lg:aspect-[3/4] overflow-hidden relative">
                          <img
                            src={ministry.cardImage}
                            alt={ministry.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:bg-none" />
                        </div>
                        {/* Content */}
                        <div className="lg:w-3/5 p-7 lg:p-9 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="inline-flex items-center justify-center w-11 h-11 rounded-xl"
                              style={{ backgroundColor: `${ministry.color}10` }}
                            >
                              <Icon size={20} style={{ color: ministry.color }} strokeWidth={1.8} />
                            </div>
                            <span
                              className="uppercase"
                              style={{
                                fontSize: "0.625rem",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                color: ministry.color,
                              }}
                            >
                              {ministry.title}
                            </span>
                          </div>
                          <h3
                            className="text-covenant-navy mb-3"
                            style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.01em" }}
                          >
                            {ministry.tagline}
                          </h3>
                          <p className="text-slate-text mb-5" style={{ fontSize: "0.875rem", lineHeight: "1.6" }}>
                            {ministry.goalText}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-5">
                            {ministry.subPrograms.map((sub) => (
                              <span
                                key={sub.title}
                                className="bg-field-sand text-covenant-navy rounded-full px-3.5 py-1"
                                style={{ fontSize: "0.75rem", fontWeight: 600 }}
                              >
                                {sub.title}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 text-harvest-gold group-hover:gap-2.5 transition-all duration-300" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                            Learn More <ArrowRight size={14} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Approach — Identify, Collaborate, Sustain */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-covenant-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,155,60,0.04),transparent_60%)]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader title="Our Approach" subtitle="Every ministry follows the same Christ-centered, church-rooted framework." light />
          <div className="relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 z-0">
              <div className="mx-16 h-full border-t border-dashed border-white/[0.08]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {[
                {
                  icon: Search,
                  title: "Identify",
                  desc: "We look for local churches who share our mission: planting churches and serving marginalized communities.",
                  step: "01",
                },
                {
                  icon: GitMerge,
                  title: "Collaborate",
                  desc: "We partner with the local church, supporting them in feeding programs, family ministry, and community outreach.",
                  step: "02",
                },
                {
                  icon: Sprout,
                  title: "Sustain",
                  desc: "When a church is established, we help disciple the next generation through sponsorship and ongoing support.",
                  step: "03",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white/[0.04] border border-white/[0.05] rounded-2xl p-7 hover:bg-white/[0.06] transition-colors duration-500 relative"
                >
                  {/* Step connector chevron */}
                  {i < 2 && (
                    <div className="hidden md:flex absolute -right-[18px] top-1/2 -translate-y-1/2 z-20 w-[30px] h-[30px] rounded-full bg-covenant-navy border border-white/[0.08] items-center justify-center">
                      <ChevronRight size={14} className="text-harvest-gold/60" strokeWidth={2.5} />
                    </div>
                  )}
                  <div className="absolute top-5 right-5 text-white/[0.06]" style={{ fontFamily: "var(--font-heading)", fontSize: "3rem", fontWeight: 800, lineHeight: 1 }}>
                    {item.step}
                  </div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-harvest-gold/10 mb-5">
                    <item.icon size={22} className="text-harvest-gold" strokeWidth={1.8} />
                  </div>
                  <h3
                    className="text-white mb-2.5"
                    style={{ fontFamily: "var(--font-heading)", fontSize: "1.0625rem", fontWeight: 700, letterSpacing: "-0.01em" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/45" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Get Involved */}
      <section className="py-16 lg:py-20 px-6 lg:px-8 bg-field-sand">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="How to Get Involved" subtitle="Three ways you can partner with us in this mission." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Contact Us First",
                desc: "Before donating, reach out so we can discuss the program, its goals, and how your support will make a difference.",
                link: "/contact",
                linkLabel: "Get in Touch",
              },
              {
                title: "Give Generously",
                desc: "Once you've connected with us, your gift — whether one-time or recurring — goes directly to the ministry you choose.",
                link: "/give",
                linkLabel: "Give Now",
              },
              {
                title: "Pray With Us",
                desc: "Every ministry rests on prayer. Join us in lifting up the communities, families, and children we serve to our faithful God.",
                link: "/contact",
                linkLabel: "Prayer Requests",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl p-7 border border-mist/25 hover:shadow-md hover:shadow-covenant-navy/4 transition-all duration-500 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-covenant-navy/20"
                    style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 800 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3
                  className="text-covenant-navy mb-2"
                  style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em" }}
                >
                  {item.title}
                </h3>
                <p className="text-slate-text mb-4" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
                  {item.desc}
                </p>
                <Link
                  href={item.link}
                  className="inline-flex items-center gap-1.5 text-harvest-gold hover:gap-2.5 transition-all duration-300"
                  style={{ fontSize: "0.8125rem", fontWeight: 700 }}
                >
                  {item.linkLabel} <ArrowRight size={13} strokeWidth={2.5} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture */}
      <ScriptureBlock
        text={scriptures.ministries.text}
        reference={scriptures.ministries.reference}
        variant="cinematic"
        backgroundImage={IMAGES.cinematicHands}
      />

      {/* CTA */}
      <CTABanner
        headline="Be Part of the Work"
        description="Whether through giving, praying, or volunteering — every act of faithfulness makes an eternal difference."
        primaryLabel="Give Today"
        primaryTo="/give"
        secondaryLabel="Contact Us"
        secondaryTo="/contact"
        variant="navy"
      />
    </div>
  );
}