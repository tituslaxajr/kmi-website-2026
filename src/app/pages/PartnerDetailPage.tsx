"use client"
import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, MapPin, ArrowRight, Heart } from "lucide-react";
import { usePartners, useStories } from "../hooks/useData";
import { Button } from "../components/shared/Button";
import { StoryCard } from "../components/shared/StoryCard";
import { CTABanner } from "../components/shared/CTABanner";

export function PartnerDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { partners } = usePartners();
  const { stories } = useStories();
  const partner = partners.find((p) => p.id === id);

  if (!partner) {
    return (
      <div className="pt-36 pb-24 text-center bg-light-linen min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-covenant-navy">Partner not found</h2>
        <Link href="/partners" className="text-harvest-gold mt-4 inline-flex items-center gap-1 hover:underline">
          <ArrowLeft size={16} /> Back to Partners
        </Link>
      </div>
    );
  }

  const partnerStories = stories.filter((s) => s.partner_id === partner.id);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px]">
        <img src={partner.image} alt={partner.church_name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-covenant-navy via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-14 z-10">
          <div className="max-w-3xl">
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-5 transition-colors group"
              style={{ fontSize: "0.8125rem" }}
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Partners
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <h1 className="text-white" style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}>
                {partner.church_name}
              </h1>
              <p className="text-white/55 mt-2" style={{ fontSize: "1rem" }}>{partner.pastor_name}</p>
              <div className="flex items-center gap-1.5 text-white/35 mt-1.5" style={{ fontSize: "0.8125rem" }}>
                <MapPin size={12} /> {partner.location}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 lg:py-20 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 lg:gap-14">
              <div>
                {/* Overview */}
                <div className="mb-10">
                  <h2 className="text-covenant-navy mb-4" style={{ fontSize: "clamp(1.375rem, 2vw, 1.75rem)" }}>Church Overview</h2>
                  <p className="text-ink max-w-[680px]" style={{ fontSize: "1rem", lineHeight: "1.75" }}>{partner.bio}</p>
                </div>

                {/* Mission */}
                <div className="mb-10">
                  <h3 className="text-covenant-navy mb-3" style={{ fontSize: "1.25rem" }}>Mission</h3>
                  <p className="text-slate-text max-w-[680px]" style={{ fontSize: "1rem", lineHeight: "1.75" }}>{partner.mission_statement}</p>
                </div>

                {/* Prayer Needs — distinct styling */}
                <div className="bg-field-sand/60 rounded-2xl p-7 border border-harvest-gold/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-harvest-gold/30 rounded-r-full" />
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-harvest-gold/10 flex items-center justify-center">
                      <Heart size={14} className="text-harvest-gold" />
                    </div>
                    <h3 className="text-covenant-navy" style={{ fontSize: "1rem", fontWeight: 700 }}>Prayer Needs</h3>
                  </div>
                  <ul className="space-y-3 text-ink pl-1" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
                    {[
                      "Pray for continued provision for the feeding program",
                      "Pray for the youth outreach and discipleship efforts",
                      "Pray for the pastor's family and their health",
                      "Pray for wisdom in expanding community development work",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="block w-1.5 h-1.5 bg-harvest-gold rounded-full mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <aside>
                <div className="bg-covenant-navy text-white rounded-2xl p-6 sticky top-24">
                  <h4 className="text-harvest-gold mb-3" style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700 }}>
                    Support This Partner
                  </h4>
                  <p className="text-white/40 mb-5" style={{ fontSize: "0.8125rem", lineHeight: "1.5" }}>
                    Your gift goes directly to supporting the ministry of {partner.church_name}.
                  </p>
                  <Link href="/give">
                    <Button className="w-full">
                      Give Now <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </aside>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partner Stories */}
      {partnerStories.length > 0 && (
        <section className="py-20 lg:py-24 px-6 lg:px-8 bg-field-sand">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-covenant-navy text-center mb-12">
              Stories from {partner.church_name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {partnerStories.map((s, i) => (
                <StoryCard key={s.id} story={s} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <CTABanner
        headline="Support This Church's Mission"
        description="Your generosity directly strengthens local churches and the communities they serve every day."
        primaryLabel="Give Now"
        primaryTo="/give"
        secondaryLabel="View All Partners"
        secondaryTo="/partners"
      />
    </div>
  );
}