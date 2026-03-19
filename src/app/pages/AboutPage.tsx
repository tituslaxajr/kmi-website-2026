"use client"
import Link from "next/link";
import { ScriptureBlock } from "../components/shared/ScriptureBlock";
import { SectionHeader } from "../components/shared/SectionHeader";
import { CTABanner } from "../components/shared/CTABanner";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Heart, Users, BookOpen, Handshake, Search, GitMerge, Sprout, Shield, Cross, FileText, ArrowRight } from "lucide-react";
import { scriptures } from "../data/mockData";
import { useImages } from "../hooks/useSiteImages";
import { getTeamMembers } from "../lib/api";

export function AboutPage() {
  const IMAGES = useImages();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Hardcoded fallback data if no team members in API
  const FALLBACK_FOUNDERS = [
    {
      id: "fallback-titus",
      name: "Titus Laxa",
      role: "Founder & Visionary",
      image: "https://images.unsplash.com/photo-1768478563694-b9b38533f2f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxGaWxpcGlubyUyMGVsZGVyJTIwbWFuJTIwcGFzdG9yJTIwd2FybSUyMHBvcnRyYWl0JTIwZGlnbmlmaWVkfGVufDF8fHx8MTc3MjQ0OTY1NHww&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Founded Kapatid Ministry in 2003 after returning from Malaysia with Beth, carrying a God-given vision to transform Filipino communities through the Gospel. His legacy lives on.",
      type: "memorial",
      badge: "Founder \u00b7 In Memoriam",
      death_year: "2021",
      order: 0,
    },
    {
      id: "fallback-beth",
      name: "Elizabeth Laxa",
      role: "General Secretary",
      image: "https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxGaWxpcGluYSUyMHdvbWFuJTIwbm9ucHJvZml0JTIwbGVhZGVyJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNDQ5NTIzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      bio: "Beth continues to steward the ministry she and Titus built together, overseeing operations and nurturing the relationships with partner churches across the Philippines.",
      type: "founder",
      badge: "Co-Founder",
      order: 1,
    },
  ];

  const FALLBACK_LEADERSHIP = [
    { id: "fallback-1", name: "Titus Jr Laxa", role: "Chief Executive Officer", image: "https://images.unsplash.com/photo-1668701061265-94160b3c225b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxGaWxpcGlubyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0JTIwbWluaXN0cnklMjBsZWFkZXJ8ZW58MXx8fHwxNzcyNDQ5NTE2fDA&ixlib=rb-4.1.0&q=80&w=1080", type: "leadership", order: 10 },
    { id: "fallback-2", name: "Amy Calansanan", role: "Partnership Coordinator", image: "https://images.unsplash.com/photo-1568623421216-cf2db9a325c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxGaWxpcGluYSUyMHdvbWFuJTIwc21pbGluZyUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc3MjQ0OTUxN3ww&ixlib=rb-4.1.0&q=80&w=1080", type: "leadership", order: 11 },
    { id: "fallback-3", name: "Rhodora Anonuevo", role: "Communications Officer", image: "https://images.unsplash.com/photo-1689795539623-c4b7682b51ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBc2lhbiUyMHdvbWFuJTIwY29tbXVuaXR5JTIwd29ya2VyJTIwcG9ydHJhaXQlMjB3YXJtfGVufDF8fHx8MTc3MjQ0OTUxOHww&ixlib=rb-4.1.0&q=80&w=1080", type: "leadership", order: 12 },
    { id: "fallback-4", name: "Hazel Longos", role: "Finance-Admin Officer", image: "https://images.unsplash.com/photo-1616221462194-4d82757ec3b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMEZpbGlwaW5hJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXQlMjBmcmllbmRseXxlbnwxfHx8fDE3NzI0NDk1MTh8MA&ixlib=rb-4.1.0&q=80&w=1080", type: "leadership", order: 13 },
  ];

  useEffect(() => {
    getTeamMembers()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTeamMembers(data);
        } else {
          setTeamMembers([...FALLBACK_FOUNDERS, ...FALLBACK_LEADERSHIP]);
        }
      })
      .catch(() => {
        setTeamMembers([...FALLBACK_FOUNDERS, ...FALLBACK_LEADERSHIP]);
      });
  }, []);

  const memorialMembers = teamMembers.filter((m: any) => m.type === "memorial");
  const founderMembers = teamMembers.filter((m: any) => m.type === "founder");
  const leadershipMembers = teamMembers.filter((m: any) => m.type === "leadership");
  const founderPairs = [...memorialMembers, ...founderMembers];

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-40 pb-28 px-6 lg:px-8 overflow-hidden">
        <img src={IMAGES.family} alt="About" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-covenant-navy/85 via-covenant-navy/70 to-covenant-navy/90" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
              <span className="text-harvest-gold/60 uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                Our Story
              </span>
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
            </div>
            <h1 className="text-white">About Kapatid</h1>
            <p className="text-white/50 mt-5 max-w-xl mx-auto" style={{ fontSize: "1.0625rem", lineHeight: "1.7" }}>
              Transforming Communities One Family at a Time
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-20 px-6 lg:px-8 bg-field-sand">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl p-7 lg:p-9 border border-mist/25"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="block w-7 h-[2px] bg-mission-red rounded-full" />
                <span className="text-mission-red uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                  Our Mission
                </span>
              </div>
              <p className="text-ink" style={{ fontSize: "1rem", lineHeight: "1.75" }}>
                We partner with Christian churches, organizations, and individuals in the Philippines to encourage, equip, and enhance their growth by church planting and community transformation through programs in:
              </p>
              <div className="mt-5 space-y-2.5">
                {[
                  "OFW Families",
                  "Out of School Youth",
                  "Underprivileged Children",
                  "Livelihood & Calamity",
                ].map((program) => (
                  <div key={program} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-harvest-gold shrink-0" />
                    <span className="text-covenant-navy" style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                      {program}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-covenant-navy rounded-2xl p-7 lg:p-9 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-harvest-gold/4 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="block w-7 h-[2px] bg-harvest-gold rounded-full" />
                  <span className="text-harvest-gold uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                    Our Vision
                  </span>
                </div>
                <h2
                  className="text-white"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                  }}
                >
                  Transforming Communities One Family at a Time.
                </h2>
                <div className="w-12 h-[2px] bg-harvest-gold/25 rounded-full mt-7" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="block w-7 h-[2px] bg-harvest-gold rounded-full" />
                <span className="text-harvest-gold uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                  Our Story
                </span>
              </div>
              <h2 className="text-covenant-navy">
                &ldquo;Kapatid&rdquo; means sibling
              </h2>
              <div className="mt-6 space-y-5 text-ink max-w-lg" style={{ fontSize: "1rem", lineHeight: "1.75" }}>
                <p>
                  Kapatid Ministry was founded in 2003 by Titus and Beth Laxa, who returned from working overseas in Malaysia to the Philippines with a mission to minister to the families of Overseas Filipino Workers (OFWs).
                </p>
                <p>
                  Established to spread the Gospel among communities that had not heard it, Kapatid Ministry has since expanded its outreach, focusing on holistic transformation through spiritual guidance, addressing the needs of OFWs, out-of-school youth, and underprivileged children in marginalized communities across the Philippines.
                </p>
                <p>
                  The ministry operates with a theological goal, aiming to glorify God by transforming communities through the lived and preached Gospel. Kapatid Ministry partners with local churches to implement various programs, including Bible studies for OFW families, feeding programs for children, educational scholarships, and ministry to senior citizens.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl shadow-covenant-navy/8">
                <img src={IMAGES.children} alt="Community" className="w-full h-full object-cover" />
              </div>
              {/* Floating year badge */}
              <div className="absolute -bottom-4 -left-4 bg-harvest-gold text-white rounded-xl px-5 py-3 shadow-lg shadow-harvest-gold/15 hidden lg:block">
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}>
                  2003
                </div>
                <div className="text-white/65 mt-0.5" style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Founded
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Do — Identify, Collaborate, Sustain */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-covenant-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,155,60,0.04),transparent_60%)]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader title="What We Do" subtitle="A three-step approach rooted in partnership and sustainability." light />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: "Identify",
                desc: "We look for local churches who have the same mission as us: planting churches in marginalized communities.",
                step: "01",
              },
              {
                icon: GitMerge,
                title: "Collaborate",
                desc: "We partner with the local church by supporting them in their feeding program, senior citizen program, and OFW family program.",
                step: "02",
              },
              {
                icon: Sprout,
                title: "Sustain",
                desc: "When a church has been established, we help the church disciple the younger generation through the Child Sponsorship Program.",
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
                <div className="absolute top-5 right-5 text-white/[0.06]" style={{ fontFamily: "var(--font-heading)", fontSize: "3rem", fontWeight: 800, lineHeight: 1 }}>
                  {item.step}
                </div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-harvest-gold/10 mb-5">
                  <item.icon size={22} className="text-harvest-gold" strokeWidth={1.8} />
                </div>
                <h3
                  className="text-white mb-2.5"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.0625rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.title}
                </h3>
                <p className="text-white/45" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mt-10"
          >
            <Link
              href="/ministries"
              className="inline-flex items-center gap-2 text-white border border-white/20 rounded-full px-7 py-3 hover:bg-white/10 hover:border-white/40 transition-all duration-300 hover:-translate-y-0.5"
              style={{ fontSize: "0.875rem", fontWeight: 600 }}
            >
              Explore Our Ministries <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-field-sand">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="Our Core Values" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Cross,
                title: "Faith in Christ",
                desc: "Our work is founded on the belief in Jesus Christ as our Savior and the ultimate source of transformation.",
              },
              {
                icon: Heart,
                title: "Faithful through Christ",
                desc: "We strive to be faithful stewards of the resources and relationships entrusted to us, empowered by His grace.",
              },
              {
                icon: Sprout,
                title: "Fruitful for Christ",
                desc: "Our goal is to produce lasting, spiritual fruit that brings glory to God and changes lives for eternity.",
              },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl p-7 border border-mist/25 hover:shadow-md hover:shadow-covenant-navy/4 transition-all duration-500 hover:-translate-y-0.5"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-harvest-gold/10 mb-4">
                  <value.icon size={20} className="text-harvest-gold" strokeWidth={1.8} />
                </div>
                <h3
                  className="text-covenant-navy mb-2"
                  style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em" }}
                >
                  {value.title}
                </h3>
                <p className="text-slate-text" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="Our Commitment" subtitle="Accountability in every dimension of our ministry." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: FileText,
                title: "Financial Responsibility",
                desc: "Supporting organizations, churches, and individuals have the right to request information pertaining to ministerial doctrine, practices, and finances. We publish an annual report of activities and finances.",
              },
              {
                icon: BookOpen,
                title: "Spiritual Responsibility",
                desc: "Though we operate in partnership with various local churches belonging to a variety of denominations, we have ensured that our leaders and staff are under the authority and shepherding of a local church.",
              },
              {
                icon: Shield,
                title: "Legal Responsibility",
                desc: "As a non-profit organization, Kapatid Ministry has a board of trustees to help direct and monitor our activities, ensuring policies and procedures comply with local laws and regulations.",
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
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-harvest-gold/10 mb-4">
                  <item.icon size={20} className="text-harvest-gold" strokeWidth={1.8} />
                </div>
                <h3
                  className="text-covenant-navy mb-2"
                  style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em" }}
                >
                  {item.title}
                </h3>
                <p className="text-slate-text" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-field-sand">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="Meet Our Team" subtitle="Dedicated servants passionate about God's work in the Philippines." />

          {/* Founders — Memorial & Co-Founder (dynamic) */}
          {founderPairs.length > 0 && (
            <div className={`grid grid-cols-1 ${founderPairs.length >= 2 ? "md:grid-cols-2" : ""} gap-6 mb-6`}>
              {founderPairs.map((member: any, idx: number) =>
                member.type === "memorial" ? (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-covenant-navy rounded-2xl overflow-hidden group relative"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,155,60,0.06),transparent_60%)]" />
                    <div className="flex flex-col sm:flex-row relative z-10">
                      <div className="sm:w-2/5 aspect-[3/4] sm:aspect-auto overflow-hidden relative">
                        {member.image && (
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover opacity-80" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-covenant-navy/40 hidden sm:block" />
                      </div>
                      <div className="sm:w-3/5 p-6 lg:p-7 flex flex-col justify-center">
                        {member.badge && (
                          <span
                            className="inline-block w-fit text-harvest-gold/80 border border-harvest-gold/20 bg-harvest-gold/5 rounded-full px-3 py-1 mb-3"
                            style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.04em" }}
                          >
                            {member.badge}
                          </span>
                        )}
                        <h3
                          className="text-white mb-0.5"
                          style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.01em" }}
                        >
                          {member.name}
                        </h3>
                        <p className="text-harvest-gold/60 mb-3" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                          {member.role}{member.death_year ? ` \u00b7 d. ${member.death_year}` : ""}
                        </p>
                        {member.bio && (
                          <p className="text-white/50" style={{ fontSize: "0.875rem", lineHeight: "1.6" }}>
                            {member.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white rounded-2xl border border-mist/25 overflow-hidden group hover:shadow-lg hover:shadow-covenant-navy/6 transition-all duration-500"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-2/5 aspect-[3/4] sm:aspect-auto overflow-hidden">
                        {member.image && (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="sm:w-3/5 p-6 lg:p-7 flex flex-col justify-center">
                        {member.badge && (
                          <span
                            className="inline-block w-fit text-harvest-gold bg-harvest-gold/8 rounded-full px-3 py-1 mb-3"
                            style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.04em" }}
                          >
                            {member.badge}
                          </span>
                        )}
                        <h3
                          className="text-covenant-navy mb-0.5"
                          style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.01em" }}
                        >
                          {member.name}
                        </h3>
                        <p className="text-mission-red mb-3" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                          {member.role}
                        </p>
                        {member.bio && (
                          <p className="text-slate-text" style={{ fontSize: "0.875rem", lineHeight: "1.6" }}>
                            {member.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          )}

          {/* Current Leadership */}
          {leadershipMembers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {leadershipMembers.map((member: any, i: number) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white rounded-2xl border border-mist/25 overflow-hidden group text-center hover:shadow-md hover:shadow-covenant-navy/5 transition-all duration-500 hover:-translate-y-0.5"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-field-sand/60 flex items-center justify-center">
                        <Users size={32} className="text-slate-text/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h4
                      className="text-covenant-navy"
                      style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "-0.01em" }}
                    >
                      {member.name}
                    </h4>
                    <p className="text-slate-text mt-0.5" style={{ fontSize: "0.8125rem" }}>
                      {member.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cinematic Scripture */}
      <ScriptureBlock
        text={scriptures.about.text}
        reference={scriptures.about.reference}
        variant="cinematic"
        backgroundImage={IMAGES.cinematicMountain}
      />

      {/* CTA */}
      <CTABanner
        headline="Walk Alongside Us"
        description="Whether through giving, praying, or volunteering — there's a place for you in this mission."
        primaryLabel="Give Today"
        primaryTo="/give"
        secondaryLabel="Contact Us"
        secondaryTo="/contact"
      />
    </div>
  );
}