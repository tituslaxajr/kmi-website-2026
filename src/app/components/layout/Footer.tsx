"use client";
import React from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube, ArrowUpRight } from "lucide-react";
const logoImg = "/logo.png";
import { NewsletterSubscribe } from "../shared/NewsletterSubscribe";

export function Footer() {
  return (
    <footer className="bg-covenant-navy text-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <img src={logoImg} alt="Kapatid Ministry" className="h-8 w-auto" />
            </div>
            <p className="text-white/35 max-w-[280px]" style={{ fontSize: "0.8125rem", lineHeight: "1.6" }}>
              Founded in 2003 by Titus and Beth Laxa, partnering with local churches to transform communities through the Gospel across the Philippines.
            </p>
            <div className="flex items-center gap-2.5 mt-5">
              {[
                { Icon: Facebook, href: "https://www.facebook.com/kapatidministry", label: "Facebook" },
                { Icon: Instagram, href: "https://www.instagram.com/kapatidministry", label: "Instagram" },
                { Icon: Youtube, href: "https://www.youtube.com/@kapatidministry", label: "YouTube" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Kapatid Ministry on ${label}`}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-harvest-gold/15 hover:text-harvest-gold transition-all duration-300"
                >
                  <Icon size={14} strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-white/25 mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Explore
            </h4>
            <div className="space-y-2">
              {["Ministries", "Stories", "Partners", "Impact", "Media", "About", "Give"].map((label) => (
                <Link
                  key={label}
                  href={`/${label.toLowerCase()}`}
                  className="group flex items-center gap-1 text-white/40 hover:text-white transition-colors duration-300"
                  style={{ fontSize: "0.8125rem" }}
                >
                  {label}
                  <ArrowUpRight
                    size={10}
                    className="opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Get Involved */}
          <div>
            <h4
              className="text-white/25 mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Get Involved
            </h4>
            <div className="space-y-2">
              {[
                { label: "Give", to: "/give" },
                { label: "Volunteer", to: "/contact?subject=volunteer" },
                { label: "Pray With Us", to: "/contact?subject=prayer" },
                { label: "Partner With Us", to: "/partners" },
                { label: "Contact Us", to: "/contact" },
              ].map(({ label, to }) => (
                <Link
                  key={label}
                  href={to}
                  className="group flex items-center gap-1 text-white/40 hover:text-white transition-colors duration-300"
                  style={{ fontSize: "0.8125rem" }}
                >
                  {label}
                  <ArrowUpRight
                    size={10}
                    className="opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-white/25 mb-4"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Contact
            </h4>
            <div className="space-y-3.5">
              {[
                { icon: MapPin, text: "4 Acacia St., Silanganan Subd. Llano, Caloocan City, Philippines" },
                { icon: Mail, text: "inquiries@kapatidministry.org" },
                { icon: Phone, text: "+63 999 516 1932" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-white/40" style={{ fontSize: "0.8125rem" }}>
                  <div className="w-7 h-7 rounded-lg bg-white/4 flex items-center justify-center shrink-0">
                    <Icon size={12} className="text-harvest-gold/60" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Newsletter Subscribe */}
            <div className="mt-6">
              <NewsletterSubscribe variant="inline" />
            </div>
          </div>
        </div>

        <div
          className="border-t border-white/5 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/20"
          style={{ fontSize: "0.75rem" }}
        >
          <p>&copy; 2026 Kapatid Ministry. All glory to God.</p>
          <p>
            Built with faith &middot; Powered by community
          </p>
        </div>
      </div>
    </footer>
  );
}