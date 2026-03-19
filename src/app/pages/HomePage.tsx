"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { Church, Users, HandHeart, Play, ArrowRight, Utensils, GraduationCap, HeartHandshake, Home } from "lucide-react";
import { scriptures } from "../data/mockData";
import { useStories, usePartners, useImpactStats } from "../hooks/useData";
import { useImages } from "../hooks/useSiteImages";
import { ScriptureBlock } from "../components/shared/ScriptureBlock";
import { CTABanner } from "../components/shared/CTABanner";
import { Button } from "../components/shared/Button";
import { StatBlock } from "../components/shared/StatBlock";
import { StoryCard } from "../components/shared/StoryCard";
import { SectionHeader } from "../components/shared/SectionHeader";
import { ministries as fallbackMinistries, MinistryProgram } from "../data/ministryData";
import { getSiteSettings, getMinistries } from "../lib/api";

const ministryIconMap: Record<string, React.ElementType> = {
  Utensils,
  GraduationCap,
  HeartHandshake,
  Home,
};

export function HomePage() {
  const { stories } = useStories();
  const { partners } = usePartners();
  const { stats: impactStats } = useImpactStats();
  const featuredStories = stories.slice(0, 3);
  const featuredPartner = partners[0];
  const IMAGES = useImages();

  const [siteSettings, setSiteSettings] = useState<Record<string, any>>({});
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [ministries, setMinistries] = useState<MinistryProgram[]>(fallbackMinistries);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  useEffect(() => {
    getSiteSettings().then(setSiteSettings).catch(() => {});
    getMinistries()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          setMinistries(data.filter((m: any) => m != null));
        }
      })
      .catch((err: any) => {
        console.error("Failed to load ministries from API, using fallback:", err);
      });
  }, []);

  const videoId = extractYouTubeId(siteSettings.homepage_video_url || "");

  return (
    <div className="relative">
      {/* Hero — Full viewport immersive */}
      <section className="relative h-screen min-h-[640px] flex items-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img
            src={IMAGES.hero}
            alt="Philippine countryside"
            className="w-full h-[115%] object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-br from-covenant-navy/80 via-covenant-navy/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "2.5rem" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-[2px] bg-harvest-gold rounded-full mb-7"
            />

            <h1
              className="text-white mb-5"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.08,
              }}
            >
              Transforming Communities One Family at a Time
            </h1>
            <p
              className="text-white/55 max-w-md"
              style={{ fontSize: "1.0625rem", lineHeight: "1.7" }}
            >
              Partnering with Christian churches, organizations, and individuals in the Philippines to encourage, equip, and enhance their growth through church planting and community transformation.
            </p>

            <div className="flex flex-wrap gap-3 mt-9">
              <Link href="/stories">
                <Button size="lg">
                  Read Field Stories
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/give">
                <Button
                  variant="secondary"
                  size="lg"
                  className="!border-white/25 !text-white hover:!bg-white/10"
                >
                  Support the Work
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/25" style={{ fontSize: "0.625rem", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-px h-7 bg-gradient-to-b from-white/30 to-transparent rounded-full"
          />
        </motion.div>
      </section>

      {/* Latest Field Stories */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Latest Field Stories"
            subtitle="See what God is doing in communities across the Philippines."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {featuredStories.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
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

      {/* Impact Stats */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-field-sand relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-harvest-gold/4 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader
            title="What God Is Doing"
            subtitle="By His grace, through the faithfulness of local churches and generous partners."
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <StatBlock number={impactStats.childrenSupported} label="Children Supported" delay={0} />
            <StatBlock number={impactStats.churchesPartnered} label="Churches Partnered" delay={0.1} />
            <StatBlock number={impactStats.communitiesReached} label="Communities Reached" delay={0.2} />
            <StatBlock number={impactStats.yearsOfMinistry} label="Years of Ministry" delay={0.3} />
          </div>
        </div>
      </section>

      {/* Our Ministries — Compact 4-card preview */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Our Ministries"
            subtitle="Four Christ-centered programs serving Filipino families, children, and communities."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ministries.map((ministry, i) => {
              const Icon = ministryIconMap[ministry.icon] || HeartHandshake;
              return (
                <motion.div
                  key={ministry.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={`/ministries/${ministry.slug}`} className="block group">
                    <div className="bg-white rounded-2xl border border-mist/25 overflow-hidden hover:shadow-lg hover:shadow-covenant-navy/5 transition-all duration-500 hover:-translate-y-1">
                      <div className="aspect-[3/4] overflow-hidden relative">
                        <img
                          src={ministry.cardImage}
                          alt={ministry.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <div
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg backdrop-blur-sm"
                            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
                          >
                            <Icon size={16} className="text-white" strokeWidth={1.8} />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4
                          className="text-covenant-navy mb-1"
                          style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "-0.01em" }}
                        >
                          {ministry.title}
                        </h4>
                        <p className="text-slate-text line-clamp-2" style={{ fontSize: "0.8125rem", lineHeight: "1.45" }}>
                          {ministry.tagline}
                        </p>
                        <div
                          className="flex items-center gap-1 mt-2.5 text-harvest-gold group-hover:gap-2 transition-all duration-300"
                          style={{ fontSize: "0.75rem", fontWeight: 700 }}
                        >
                          Learn More <ArrowRight size={12} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link href="/ministries">
              <Button variant="outline">
                View All Ministries
                <ArrowRight size={15} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Local Partner */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-field-sand">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl shadow-covenant-navy/8">
                <img
                  src={featuredPartner.image}
                  alt={featuredPartner.pastor_name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating accent card */}
              <div className="absolute -bottom-5 -right-5 bg-white rounded-xl p-4 shadow-lg shadow-black/6 hidden lg:block">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-harvest-gold/10 flex items-center justify-center">
                    <Church size={16} className="text-harvest-gold" />
                  </div>
                  <div>
                    <div className="text-covenant-navy" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                      Local Partner
                    </div>
                    <div className="text-slate-text" style={{ fontSize: "0.6875rem" }}>
                      Church-led ministry
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="block w-7 h-[2px] bg-harvest-gold rounded-full" />
                <span
                  className="text-harvest-gold uppercase"
                  style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}
                >
                  Featured Partner
                </span>
              </div>
              <h2 className="text-covenant-navy" style={{ fontFamily: "var(--font-heading)" }}>
                {featuredPartner.church_name}
              </h2>
              <p className="text-slate-text mt-2" style={{ fontSize: "0.9375rem" }}>
                {featuredPartner.pastor_name} &middot; {featuredPartner.location}
              </p>
              <p className="text-ink mt-5 max-w-lg" style={{ fontSize: "1rem", lineHeight: "1.75" }}>
                {featuredPartner.bio}
              </p>
              <div className="mt-7">
                <Link href={`/partners/${featuredPartner.id}`}>
                  <Button variant="outline">
                    Read Their Story
                    <ArrowRight size={15} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How We Collaborate */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-covenant-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,155,60,0.04),transparent_60%)]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <SectionHeader
            title="How We Collaborate"
            subtitle="Kapatid means 'sibling.' We walk alongside — never above — those we serve."
            light
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Church,
                title: "Local Churches",
                desc: "We partner with Filipino pastors and churches already rooted in their communities. They lead. We support.",
              },
              {
                icon: HandHeart,
                title: "Sponsors & Donors",
                desc: "Your generosity provides resources — food, education, relief — delivered through trusted local leaders.",
              },
              {
                icon: Users,
                title: "Volunteers",
                desc: "From short mission trips to medical missions, volunteers serve alongside community members.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white/[0.04] border border-white/[0.05] rounded-2xl p-7 hover:bg-white/[0.06] transition-colors duration-500"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-harvest-gold/10 mb-5">
                  <item.icon size={22} className="text-harvest-gold" strokeWidth={1.8} />
                </div>
                <h3
                  className="text-white mb-2.5"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.125rem",
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
        </div>
      </section>

      {/* Media Highlight */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-covenant-navy/95 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <SectionHeader
            title={siteSettings.homepage_video_title || "From the Field"}
            subtitle={siteSettings.homepage_video_subtitle || "Watch stories of God's faithfulness from the communities we serve."}
            light
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-video rounded-2xl overflow-hidden group shadow-2xl shadow-black/25"
          >
            {videoPlaying && videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="From the Field video"
              />
            ) : (
              <div
                className="w-full h-full cursor-pointer"
                onClick={() => {
                  if (videoId) {
                    setVideoPlaying(true);
                  }
                }}
              >
                {/* Use YouTube thumbnail if a video ID exists, otherwise fallback to gathering image */}
                <img
                  src={videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : IMAGES.gathering}
                  alt="Documentary preview"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-covenant-navy/60 via-black/10 to-transparent flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-harvest-gold/90 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-xl shadow-harvest-gold/25">
                    <Play size={24} className="text-white ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Cinematic Scripture */}
      <ScriptureBlock
        text={scriptures.hero.text}
        reference={scriptures.hero.reference}
        variant="cinematic"
        backgroundImage={IMAGES.cinematicOcean}
      />

      {/* CTA */}
      <CTABanner
        headline="Partner with Us"
        description="Every gift — large or small — is stewarded with faithfulness and transparency through our local church partners."
        primaryLabel="Support the Work"
        primaryTo="/give"
        secondaryLabel="Meet Our Partners"
        secondaryTo="/partners"
      />
    </div>
  );
}

function extractYouTubeId(url: string): string {
  if (!url) return "";
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return "";
}