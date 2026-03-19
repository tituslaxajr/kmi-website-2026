"use client"
import React from "react";
import { motion } from "motion/react";
import { Church, HandHeart, Users } from "lucide-react";
import { scriptures } from "../data/mockData";
import { usePartners } from "../hooks/useData";
import { useImages } from "../hooks/useSiteImages";
import { ScriptureBlock } from "../components/shared/ScriptureBlock";
import { PartnerCard } from "../components/shared/PartnerCard";
import { CTABanner } from "../components/shared/CTABanner";
import { SectionHeader } from "../components/shared/SectionHeader";
import { PartnerCardSkeleton } from "../components/shared/Skeleton";

export function PartnersPage() {
  const { partners, loading } = usePartners();
  const IMAGES = useImages();
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-40 pb-28 px-6 lg:px-8 overflow-hidden">
        <img src={IMAGES.worship} alt="Partners" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-covenant-navy/85 via-covenant-navy/70 to-covenant-navy/90" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
              <span className="text-harvest-gold/60 uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                Together in Christ
              </span>
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
            </div>
            <h1 className="text-white">Our Partners</h1>
            <p className="text-white/50 mt-5 max-w-xl mx-auto" style={{ fontSize: "1.0625rem", lineHeight: "1.7" }}>
              These local churches and their pastors are the heart of everything God is doing through Kapatid.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How We Partner — context intro */}
      <section className="py-12 lg:py-14 px-6 lg:px-8 bg-field-sand border-b border-mist/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Church,
                title: "Church-Led",
                desc: "Filipino pastors and churches lead the ministry. They know their communities best.",
              },
              {
                icon: HandHeart,
                title: "Holistic Support",
                desc: "We resource feeding programs, education, OFW family ministry, and senior citizen care.",
              },
              {
                icon: Users,
                title: "Long-Term Commitment",
                desc: "We don't leave after a project ends. We walk alongside until the church is self-sustaining.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-harvest-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon size={18} className="text-harvest-gold" strokeWidth={1.8} />
                </div>
                <div>
                  <h4
                    className="text-covenant-navy mb-1"
                    style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700 }}
                  >
                    {item.title}
                  </h4>
                  <p className="text-slate-text" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Meet Our Church Partners"
            subtitle="Each partnership is built on trust, prayer, and a shared commitment to transformation."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <PartnerCardSkeleton key={i} />)
              : partners.map((partner, i) => (
                  <PartnerCard key={partner.id} partner={partner} index={i} />
                ))}
          </div>
        </div>
      </section>

      {/* Cinematic Scripture */}
      <ScriptureBlock
        text={scriptures.partners.text}
        reference={scriptures.partners.reference}
        variant="cinematic"
        backgroundImage={IMAGES.cinematicCross}
      />

      {/* CTA */}
      <CTABanner
        headline="Support Our Partners"
        description="Your giving empowers local churches to continue their faithful work in their communities."
        primaryLabel="Give Now"
        primaryTo="/give"
        secondaryLabel="Read Field Stories"
        secondaryTo="/stories"
      />
    </div>
  );
}