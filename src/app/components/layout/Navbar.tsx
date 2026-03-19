"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, ChevronDown, Users, BarChart3, Film, Mail, BookOpen, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
const logoImg = "/logo.png";

interface DropdownItem {
  label: string;
  path: string;
  desc: string;
  icon: React.ElementType;
}

interface NavItem {
  label: string;
  path?: string;
  dropdown?: DropdownItem[];
}

const navItems: NavItem[] = [
  { label: "Ministries", path: "/ministries" },
  { label: "Stories", path: "/stories" },
  {
    label: "About",
    dropdown: [
      { label: "Our Story", path: "/about", desc: "Our mission, values & history", icon: BookOpen },
      { label: "Partners", path: "/partners", desc: "Local churches we walk alongside", icon: Users },
      { label: "Contact", path: "/contact", desc: "Get in touch with our team", icon: Mail },
    ],
  },
  {
    label: "Impact",
    dropdown: [
      { label: "By the Numbers", path: "/impact", desc: "See what God is doing", icon: BarChart3 },
      { label: "Media", path: "/media", desc: "Photos, videos & resources", icon: Film },
    ],
  },
];

// All links flattened for mobile
const mobileLinks = [
  { label: "Ministries", path: "/ministries", group: null },
  { label: "Stories", path: "/stories", group: null },
  { label: "Our Story", path: "/about", group: "About" },
  { label: "Partners", path: "/partners", group: "About" },
  { label: "Contact", path: "/contact", group: "About" },
  { label: "By the Numbers", path: "/impact", group: "Impact" },
  { label: "Media", path: "/media", group: "Impact" },
];

function DesktopDropdown({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 180);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Close on route change
  const pathname = usePathname();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className="relative flex items-center gap-1 px-4 py-2 text-white transition-all duration-300 group cursor-pointer"
        style={{
          fontSize: "0.8125rem",
          fontWeight: 500,
          letterSpacing: "0.01em",
          opacity: isActive ? 1 : 0.75,
        }}
        onClick={() => setOpen(!open)}
      >
        {item.label}
        <ChevronDown
          size={12}
          strokeWidth={2.5}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          style={{ opacity: 0.5 }}
        />
        {/* Gold underline indicator */}
        <span
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-harvest-gold rounded-full transition-all duration-300 ${
            isActive ? "w-5" : "w-0 group-hover:w-4"
          }`}
        />
      </button>

      <AnimatePresence>
        {open && item.dropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-2"
            style={{ minWidth: "240px" }}
          >
            <div className="bg-white rounded-2xl shadow-xl shadow-black/10 border border-black/[0.04] overflow-hidden">
              {/* Subtle top accent bar */}
              <div className="h-[2px] bg-gradient-to-r from-harvest-gold/0 via-harvest-gold/60 to-harvest-gold/0" />
              <div className="p-2">
                {item.dropdown.map((child) => {
                  const Icon = child.icon;
                  return (
                    <Link
                      key={child.path}
                      href={child.path}
                      className="flex items-start gap-3 px-3.5 py-3 rounded-xl hover:bg-field-sand/50 transition-colors duration-200 group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-field-sand/70 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-harvest-gold/10 transition-colors duration-200">
                        <Icon size={15} className="text-covenant-navy/50 group-hover/item:text-harvest-gold transition-colors duration-200" strokeWidth={2} />
                      </div>
                      <div>
                        <span
                          className="block text-covenant-navy group-hover/item:text-covenant-navy transition-colors"
                          style={{ fontSize: "0.8125rem", fontWeight: 650 }}
                        >
                          {child.label}
                        </span>
                        <span
                          className="block text-slate-text/70 mt-0.5"
                          style={{ fontSize: "0.6875rem", lineHeight: "1.3" }}
                        >
                          {child.desc}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navPathname = usePathname();
  const isHome = navPathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [navPathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const showSolid = scrolled || !isHome;

  // Check if any dropdown child is active
  const isItemActive = (item: NavItem) => {
    if (item.path) return navPathname.startsWith(item.path);
    if (item.dropdown) return item.dropdown.some((d) => navPathname.startsWith(d.path));
    return false;
  };

  // Group tracking for mobile section headers
  let lastGroup: string | null = null;

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          backgroundColor: showSolid
            ? "rgba(200, 76, 61, 0.97)"
            : "rgba(200, 76, 61, 0.0)",
          backdropFilter: showSolid ? "blur(20px)" : "blur(0px)",
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-500 ${
          showSolid ? "shadow-md shadow-black/8" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div
            className="flex items-center justify-between transition-all duration-300"
            style={{ height: scrolled ? "56px" : "64px" }}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center text-white group">
              <img
                src={logoImg}
                alt="Kapatid Ministry"
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => {
                const active = isItemActive(item);

                if (item.dropdown) {
                  return (
                    <DesktopDropdown
                      key={item.label}
                      item={item}
                      isActive={active}
                    />
                  );
                }

                return (
                  <Link
                    key={item.path}
                    href={item.path!}
                    className="relative px-4 py-2 text-white transition-all duration-300 group"
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      letterSpacing: "0.01em",
                      opacity: active ? 1 : 0.75,
                    }}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-harvest-gold rounded-full transition-all duration-300 ${
                        active ? "w-5" : "w-0 group-hover:w-4"
                      }`}
                    />
                  </Link>
                );
              })}
              <div className="ml-5">
                <Link
                  href="/give"
                  className="inline-flex items-center gap-1.5 border border-white/40 text-white px-5 py-2 rounded-full hover:bg-white hover:text-mission-red transition-all duration-300 hover:-translate-y-px"
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    letterSpacing: "0.01em",
                  }}
                >
                  Give
                  <ArrowRight
                    size={13}
                    strokeWidth={2.5}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden text-white cursor-pointer p-2.5 -mr-2 rounded-full hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Full-screen Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-covenant-navy lg:hidden flex flex-col"
          >
            {/* Spacer for navbar height */}
            <div style={{ height: "64px" }} className="shrink-0" />

            <div className="flex-1 flex flex-col items-center justify-center px-8">
              <div className="space-y-0 w-full max-w-sm">
                {mobileLinks.map((link, i) => {
                  const showGroupHeader = link.group && link.group !== lastGroup;
                  lastGroup = link.group;

                  return (
                    <React.Fragment key={link.path}>
                      {showGroupHeader && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            delay: i * 0.04 + 0.05,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="pt-5"
                        >
                          <span
                            className="text-white/25 uppercase"
                            style={{
                              fontSize: "0.5625rem",
                              fontWeight: 700,
                              letterSpacing: "0.14em",
                            }}
                          >
                            {link.group}
                          </span>
                        </motion.div>
                      )}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: i * 0.04,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <Link
                          href={link.path}
                          className={`flex items-center justify-between py-3.5 border-b border-white/6 text-white transition-colors ${
                            navPathname.startsWith(link.path)
                              ? "text-harvest-gold"
                              : "hover:text-harvest-gold"
                          } ${link.group ? "pl-3" : ""}`}
                          style={{
                            fontSize: link.group ? "1.125rem" : "1.375rem",
                            fontWeight: 600,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {link.label}
                          <ArrowRight size={14} className="opacity-20" />
                        </Link>
                      </motion.div>
                    </React.Fragment>
                  );
                })}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="pt-8"
                >
                  <Link
                    href="/give"
                    className="flex items-center justify-center gap-2 w-full bg-harvest-gold text-white py-4 rounded-2xl"
                    style={{ fontSize: "1.0625rem", fontWeight: 700 }}
                  >
                    Give Now
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
