import React from "react";
import { motion } from "motion/react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
  accent?: boolean;
}

export function SectionHeader({ title, subtitle, align = "center", light = false, accent = true }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-14 lg:mb-16 ${align === "center" ? "text-center" : "text-left"}`}
    >
      {accent && (
        <div className={`mb-4 ${align === "center" ? "flex justify-center" : ""}`}>
          <div className={`flex items-center gap-1.5 ${light ? "opacity-50" : ""}`}>
            <span className="block w-7 h-[2px] bg-harvest-gold rounded-full" />
            <span className="block w-1.5 h-[2px] bg-harvest-gold/40 rounded-full" />
          </div>
        </div>
      )}
      <h2
        className={light ? "text-white" : "text-covenant-navy"}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 max-w-xl ${align === "center" ? "mx-auto" : ""} ${
            light ? "text-white/50" : "text-slate-text"
          }`}
          style={{ fontSize: "1rem", lineHeight: "1.7" }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}