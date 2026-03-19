"use client";
import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface CTABannerProps {
  headline: string;
  description: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

export function CTABanner({
  headline,
  description,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
}: CTABannerProps) {
  return (
    <section className="relative py-24 lg:py-32 px-6 lg:px-8 bg-harvest-gold overflow-hidden">
      {/* Soft radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.1),transparent_55%)]" />

      {/* Top + bottom subtle lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="text-white"
            style={{
              fontSize: "clamp(1.625rem, 3.5vw, 2.5rem)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            {headline}
          </h2>

          <p
            className="text-white/70 mt-4 max-w-lg mx-auto"
            style={{ fontSize: "1rem", lineHeight: "1.7" }}
          >
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-9">
            <Link href={primaryTo}>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 bg-white text-harvest-gold rounded-full px-7 py-3.5 cursor-pointer shadow-lg shadow-black/8 hover:shadow-xl transition-shadow duration-300"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                {primaryLabel}
                <ArrowRight size={16} strokeWidth={2.5} />
              </motion.button>
            </Link>

            {secondaryLabel && secondaryTo && (
              <Link href={secondaryTo}>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-transparent border-[1.5px] border-white/35 text-white rounded-full px-7 py-3.5 cursor-pointer hover:bg-white/10 hover:border-white/55 transition-all duration-300"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {secondaryLabel}
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}