"use client"
import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/shared/Button";

export function NotFoundPage() {
  return (
    <div className="pt-32 pb-24 px-6 min-h-[80vh] flex flex-col items-center justify-center bg-light-linen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,155,60,0.04),transparent_50%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center relative z-10"
      >
        <div
          className="text-covenant-navy/8"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(8rem, 20vw, 14rem)",
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
          }}
        >
          404
        </div>
        <h2 className="text-covenant-navy -mt-6 mb-3">Page Not Found</h2>
        <p className="text-slate-text max-w-md mx-auto mb-8" style={{ fontSize: "1.0625rem", lineHeight: "1.625rem" }}>
          This page doesn't exist. Here are some places to explore:
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { label: "Ministries", href: "/ministries" },
            { label: "Stories", href: "/stories" },
            { label: "Partners", href: "/partners" },
            { label: "Give", href: "/give" },
            { label: "Contact", href: "/contact" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 rounded-xl border border-mist/40 text-slate-text hover:border-harvest-gold/40 hover:text-covenant-navy transition-all duration-200"
              style={{ fontSize: "0.875rem", fontWeight: 500 }}
            >
              {label}
            </Link>
          ))}
        </div>
        <Link href="/">
          <Button>
            Return Home <ArrowRight size={16} />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
