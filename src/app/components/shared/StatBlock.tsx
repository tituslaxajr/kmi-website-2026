"use client"
import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";

interface StatBlockProps {
  number: string | number;
  label: string;
  delay?: number;
  light?: boolean;
}

function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

export function StatBlock({ number, label, delay = 0, light = false }: StatBlockProps) {
  const numericValue = typeof number === "number" ? number : parseInt(String(number).replace(/\D/g, ""), 10);
  const isNumeric = !isNaN(numericValue) && typeof number === "number";
  const suffix = typeof number === "string" ? number.replace(/[\d,]/g, "").trim() : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
    >
      <div
        className={light ? "text-harvest-gold" : "text-covenant-navy"}
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(3rem, 5vw, 4.5rem)",
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        {isNumeric ? (
          <>
            <AnimatedNumber value={numericValue} />
            {suffix}
          </>
        ) : (
          number
        )}
      </div>
      <div
        className={`mt-3 ${light ? "text-white/50" : "text-slate-text"}`}
        style={{ fontSize: "0.8125rem", fontWeight: 500, letterSpacing: "0.02em" }}
      >
        {label}
      </div>
    </motion.div>
  );
}
