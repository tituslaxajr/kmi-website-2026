"use client"
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, X } from "lucide-react";
import { scriptures } from "../data/mockData";
import { useMediaItems } from "../hooks/useData";
import { useImages } from "../hooks/useSiteImages";
import { FilterPill } from "../components/shared/FilterPill";
import { ScriptureBlock } from "../components/shared/ScriptureBlock";
import { CTABanner } from "../components/shared/CTABanner";

const categories = ["All", "Documentary", "Field Report", "Worship"];

export function MediaPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const { items: mediaItems } = useMediaItems();
  const IMAGES = useImages();

  const filteredMedia = activeFilter === "All" ? mediaItems : mediaItems.filter((m) => m.category === activeFilter);
  const galleryImages = [IMAGES.children, IMAGES.school, IMAGES.family, IMAGES.gathering, IMAGES.elder, IMAGES.sunrise, IMAGES.volunteers, IMAGES.worship];

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-40 pb-28 px-6 lg:px-8 bg-covenant-navy overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,155,60,0.04),transparent_50%)]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
              <span className="text-harvest-gold/60 uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                Watch & Listen
              </span>
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
            </div>
            <h1 className="text-white">Media</h1>
            <p className="text-white/50 mt-4 max-w-xl mx-auto" style={{ fontSize: "1.0625rem", lineHeight: "1.7" }}>
              Documentaries, field reports, and worship from the communities we serve.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Video — dominant */}
      <section className="bg-covenant-navy px-6 lg:px-8 pb-14">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer shadow-2xl shadow-black/25"
          >
            <img src={IMAGES.hero} alt="Featured documentary" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors duration-500 flex items-center justify-center">
              <div className="w-18 h-18 rounded-full bg-harvest-gold/90 flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-xl shadow-harvest-gold/25" style={{ width: "4.5rem", height: "4.5rem" }}>
                <Play size={26} className="text-white ml-0.5" fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="block w-4 h-[2px] bg-harvest-gold rounded-full" />
                <span className="text-harvest-gold" style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Featured
                </span>
              </div>
              <h3
                className="text-white"
                style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.01em" }}
              >
                Walking with the Faithful: A Kapatid Documentary
              </h3>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Media Grid */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-covenant-navy">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((cat) => (
              <FilterPill key={cat} label={cat} active={activeFilter === cat} onClick={() => setActiveFilter(cat)} variant="dark" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMedia.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  />
                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <Play size={16} className="text-covenant-navy ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-harvest-gold/70" style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {item.category}
                  </span>
                  <h4 className="text-white mt-0.5 group-hover:text-harvest-gold/80 transition-colors" style={{ fontFamily: "var(--font-heading)", fontSize: "0.9375rem", fontWeight: 700, lineHeight: "1.35" }}>
                    {item.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-covenant-navy text-center mb-10">Photo Gallery</h2>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3.5">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="mb-3.5 break-inside-avoid cursor-pointer group"
                onClick={() => setLightboxImage(img)}
              >
                <img
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  className="w-full rounded-xl group-hover:shadow-lg group-hover:shadow-covenant-navy/8 transition-all duration-500 group-hover:-translate-y-0.5 object-cover"
                  style={{ aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "4/3" : "1/1" }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer">
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              src={lightboxImage}
              alt="Gallery view"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Scripture */}
      <ScriptureBlock
        text={scriptures.media.text}
        reference={scriptures.media.reference}
        variant="cinematic"
        backgroundImage={IMAGES.cinematicPalms}
      />

      {/* CTA */}
      <CTABanner
        headline="See the Stories Behind the Footage"
        description="Every video and photo represents a real community transformed by God's love and your faithfulness."
        primaryLabel="Read Field Stories"
        primaryTo="/stories"
        secondaryLabel="Support the Work"
        secondaryTo="/give"
        variant="navy"
      />
    </div>
  );
}