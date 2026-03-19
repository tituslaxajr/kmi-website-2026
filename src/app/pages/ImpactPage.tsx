"use client"
import React, { useState } from "react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Shield, FileText, Handshake } from "lucide-react";
import { scriptures, fundingAllocation, annualData } from "../data/mockData";
import { useImpactStats } from "../hooks/useData";
import { useImages } from "../hooks/useSiteImages";
import { ScriptureBlock } from "../components/shared/ScriptureBlock";
import { StatBlock } from "../components/shared/StatBlock";
import { SectionHeader } from "../components/shared/SectionHeader";
import { CTABanner } from "../components/shared/CTABanner";

export function ImpactPage() {
  const [activeMetric, setActiveMetric] = useState<"children" | "churches" | "communities">("children");
  const { stats: impactStats } = useImpactStats();
  const IMAGES = useImages();

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-40 pb-28 px-6 lg:px-8 overflow-hidden">
        <img src={IMAGES.sunrise} alt="Impact" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-covenant-navy/85 via-covenant-navy/70 to-covenant-navy/90" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
              <span className="text-harvest-gold/60 uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                By His Grace
              </span>
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
            </div>
            <h1 className="text-white">Our Impact</h1>
            <p className="text-white/50 mt-5 max-w-xl mx-auto" style={{ fontSize: "1.0625rem", lineHeight: "1.7" }}>
              By His grace, through the faithfulness of local churches and generous partners since 2003.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="2025 Year in Review" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <StatBlock number={impactStats.childrenSupported} label="Children Supported" delay={0} />
            <StatBlock number={impactStats.churchesPartnered} label="Churches Partnered" delay={0.1} />
            <StatBlock number={impactStats.communitiesReached} label="Communities Reached" delay={0.2} />
            <StatBlock number={impactStats.yearsOfMinistry} label="Years of Ministry" delay={0.3} />
          </div>
        </div>
      </section>

      {/* Growth Chart */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-field-sand">
        <div className="max-w-4xl mx-auto">
          <SectionHeader title="Growth Over the Years" subtitle="God's faithfulness reflected in steady, organic growth." />
          <div className="flex justify-center gap-2 mb-8">
            {(["children", "churches", "communities"] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`px-5 py-2 rounded-full transition-all duration-300 cursor-pointer border ${
                  activeMetric === metric
                    ? "bg-covenant-navy text-white border-covenant-navy shadow-sm"
                    : "bg-white text-covenant-navy border-covenant-navy/10 hover:border-covenant-navy/25"
                }`}
                style={{ fontSize: "0.8125rem", fontWeight: 600 }}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-5 lg:p-7 border border-mist/30">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={annualData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD6" vertical={false} />
                <XAxis dataKey="year" stroke="#5F6368" style={{ fontSize: "0.75rem" }} axisLine={false} tickLine={false} />
                <YAxis stroke="#5F6368" style={{ fontSize: "0.75rem" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#103B53",
                    border: "none",
                    borderRadius: "10px",
                    color: "#FAF8F4",
                    fontSize: "0.8125rem",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  }}
                />
                <Bar dataKey={activeMetric} fill="#103B53" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Funding Allocation */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-4xl mx-auto">
          <SectionHeader title="Where Your Giving Goes" subtitle="Transparency in how every peso is stewarded." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="flex justify-center">
              <ResponsiveContainer width={280} height={280}>
                <PieChart>
                  <Pie data={fundingAllocation} cx="50%" cy="50%" innerRadius={70} outerRadius={120} dataKey="value" stroke="none" cornerRadius={3}>
                    {fundingAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#103B53",
                      border: "none",
                      borderRadius: "10px",
                      color: "#FAF8F4",
                      fontSize: "0.8125rem",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    }}
                    formatter={(value: number) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {fundingAllocation.map((item) => (
                <div key={item.name} className="flex items-center gap-3.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-ink" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{item.name}</span>
                      <span className="text-covenant-navy" style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "-0.02em" }}>{item.value}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-mist/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="relative py-28 lg:py-36 px-6 lg:px-8 overflow-hidden">
        <img src={IMAGES.elder} alt="Testimony" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-covenant-navy/90" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}>
            <div className="text-harvest-gold/15 mb-3" style={{ fontFamily: "var(--font-serif)", fontSize: "4rem", fontWeight: 300, lineHeight: 0.8 }}>&ldquo;</div>
            <blockquote>
              <p className="text-white" style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.125rem, 2.2vw, 1.5rem)", lineHeight: "1.65", fontWeight: 300 }}>
                Before Kapatid came alongside our church, we struggled to feed the children in our community. Now,
                through God's provision and the generosity of partners, no child in our village goes hungry.
              </p>
              <div className="w-8 h-[2px] bg-harvest-gold mx-auto mt-7 mb-3 rounded-full" />
              <cite className="block text-harvest-gold not-italic" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>Pastor Rodel Mendoza</cite>
              <span className="text-white/30" style={{ fontSize: "0.8125rem" }}>Grace Community Church, Palawan</span>
            </blockquote>
          </motion.div>
        </div>
      </section>

      {/* Transparency */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-field-sand">
        <div className="max-w-3xl mx-auto">
          <SectionHeader title="Our Commitment to Transparency" subtitle="Accountability honors God and builds trust with our partners." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: FileText, label: "Financial Responsibility", desc: "Supporters have the right to request information on doctrine, practices, and finances. We publish an annual report of activities and finances." },
              { icon: Handshake, label: "Spiritual Responsibility", desc: "Our leaders and staff are under the authority and shepherding of a local church, across denominational partnerships." },
              { icon: Shield, label: "Legal Responsibility", desc: "A board of trustees directs and monitors our activities, ensuring compliance with local laws and regulations." },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl p-6 border border-mist/30 hover:shadow-md hover:shadow-covenant-navy/4 transition-shadow duration-500"
              >
                <div className="w-10 h-10 rounded-xl bg-covenant-navy/4 flex items-center justify-center mb-4">
                  <item.icon size={18} className="text-harvest-gold" strokeWidth={1.8} />
                </div>
                <h4 className="text-covenant-navy mb-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700 }}>
                  {item.label}
                </h4>
                <p className="text-slate-text" style={{ fontSize: "0.8125rem", lineHeight: "1.5" }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Scripture */}
      <ScriptureBlock
        text={scriptures.impact.text}
        reference={scriptures.impact.reference}
        variant="cinematic"
        backgroundImage={IMAGES.cinematicHands}
      />

      {/* CTA */}
      <CTABanner
        headline="Be Part of the Impact"
        description="Join hundreds of faithful partners making a difference in Filipino communities through local churches."
        primaryLabel="Give Today"
        primaryTo="/give"
        secondaryLabel="Read Stories"
        secondaryTo="/stories"
        variant="linen"
      />
    </div>
  );
}