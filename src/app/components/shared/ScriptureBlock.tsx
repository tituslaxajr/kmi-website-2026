import React from "react";
import { motion } from "motion/react";

interface ScriptureBlockProps {
  text: string;
  reference: string;
  variant?: "hero" | "navy" | "inline" | "gold" | "footer" | "cinematic";
  backgroundImage?: string;
}

export function ScriptureBlock({ text, reference, variant = "inline", backgroundImage }: ScriptureBlockProps) {
  if (variant === "cinematic") {
    return (
      <section className="relative w-full overflow-hidden" style={{ minHeight: "480px" }}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined }}
        />
        {/* Cinematic dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/70" />
        {/* Subtle film grain texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        {/* Top + bottom subtle line accents */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 lg:px-8 py-16" style={{ minHeight: "480px" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            {/* Decorative open-quote */}
            <div
              className="text-harvest-gold/20 mb-4 leading-none select-none"
              style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(3.5rem, 7vw, 6rem)", fontWeight: 300 }}
            >
              &ldquo;
            </div>

            <blockquote>
              <p
                className="text-white mb-6"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                  lineHeight: "1.6",
                  fontWeight: 300,
                  letterSpacing: "-0.01em",
                }}
              >
                {text}
              </p>
            </blockquote>

            {/* Gold accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="w-12 h-[2px] bg-harvest-gold mx-auto mb-4 rounded-full origin-center"
            />

            <cite
              className="not-italic text-harvest-gold block"
              style={{ fontSize: "0.9375rem", fontWeight: 600, letterSpacing: "0.04em" }}
            >
              {reference}
            </cite>
          </motion.div>
        </div>
      </section>
    );
  }

  if (variant === "hero") {
    return (
      <blockquote className="text-white/90 max-w-2xl">
        <p
          className="mb-3"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)",
            lineHeight: "1.5",
            fontWeight: 300,
          }}
        >
          &ldquo;{text}&rdquo;
        </p>
        <cite
          className="not-italic text-harvest-gold flex items-center gap-2"
          style={{ fontSize: "0.875rem", fontWeight: 500 }}
        >
          <span className="block w-5 h-[1.5px] bg-harvest-gold/60 rounded-full" />
          {reference}
        </cite>
      </blockquote>
    );
  }

  if (variant === "navy") {
    return (
      <div className="bg-covenant-navy rounded-2xl px-10 py-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-harvest-gold/40 to-transparent" />
        <blockquote>
          <p
            className="text-white mb-4"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.25rem",
              lineHeight: "1.875rem",
              fontWeight: 300,
            }}
          >
            &ldquo;{text}&rdquo;
          </p>
          <div className="w-10 h-[2px] bg-harvest-gold mx-auto mb-3 rounded-full" />
          <cite className="not-italic text-harvest-gold" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
            {reference}
          </cite>
        </blockquote>
      </div>
    );
  }

  if (variant === "gold") {
    return (
      <div className="bg-light-linen rounded-2xl px-8 py-8 relative border border-harvest-gold/10">
        <span
          className="absolute top-2 left-6 text-harvest-gold/15"
          style={{ fontSize: "5rem", fontFamily: "var(--font-serif)", fontWeight: 300, lineHeight: 1 }}
        >
          &ldquo;
        </span>
        <blockquote className="relative z-10 pl-4">
          <p
            className="text-ink mb-3"
            style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", lineHeight: "1.75rem", fontWeight: 300 }}
          >
            {text}
          </p>
          <cite className="not-italic text-slate-text flex items-center gap-2" style={{ fontSize: "0.8125rem" }}>
            <span className="block w-4 h-[1.5px] bg-harvest-gold/40 rounded-full" />
            {reference}
          </cite>
        </blockquote>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <blockquote className="text-center">
        <p className="text-white/40" style={{ fontFamily: "var(--font-serif)", fontSize: "0.9375rem", lineHeight: "1.5rem", fontWeight: 300 }}>
          &ldquo;{text}&rdquo;
        </p>
        <cite className="not-italic text-white/25 block mt-1.5" style={{ fontSize: "0.8125rem" }}>
          {reference}
        </cite>
      </blockquote>
    );
  }

  // inline (pull quote)
  return (
    <blockquote className="border-l-[3px] border-harvest-gold pl-6 py-2">
      <p
        className="text-ink mb-2"
        style={{ fontFamily: "var(--font-serif)", fontSize: "1.125rem", lineHeight: "1.75rem", fontWeight: 300 }}
      >
        &ldquo;{text}&rdquo;
      </p>
      <cite className="not-italic text-slate-text flex items-center gap-2" style={{ fontSize: "0.8125rem" }}>
        <span className="block w-4 h-[1.5px] bg-harvest-gold/40 rounded-full" />
        {reference}
      </cite>
    </blockquote>
  );
}