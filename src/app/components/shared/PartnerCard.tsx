"use client";
import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { MapPin, ArrowUpRight } from "lucide-react";
import type { Partner } from "../../data/mockData";

interface PartnerCardProps {
  partner: Partner;
  index?: number;
}

export function PartnerCard({ partner, index = 0 }: PartnerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/partners/${partner.id}`} className="group block">
        <div className="bg-white rounded-2xl overflow-hidden border border-transparent hover:border-harvest-gold/15 hover:shadow-lg hover:shadow-covenant-navy/5 transition-all duration-500 hover:-translate-y-1">
          <div className="aspect-[3/4] overflow-hidden relative">
            <img
              src={partner.image}
              alt={partner.church_name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
              <ArrowUpRight size={13} className="text-covenant-navy" />
            </div>
          </div>
          <div className="p-5">
            <h3
              className="text-covenant-navy mb-0.5"
              style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em" }}
            >
              {partner.church_name}
            </h3>
            <p className="text-slate-text" style={{ fontSize: "0.8125rem" }}>
              {partner.pastor_name}
            </p>
            <div className="inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-full bg-field-sand/80" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              <MapPin size={10} className="text-harvest-gold" />
              <span className="text-slate-text">{partner.location}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}