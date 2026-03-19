"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus, Loader2, Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, Heart, BookOpen, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";
const logoDarkImg = "/logo.png";

export function AdminLoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) { setError("Name is required."); setSubmitting(false); return; }
        const result = await signup(name, email, password);
        if (result.success) {
          router.push("/admin");
        } else {
          setError(result.error || "Signup failed. Please try again.");
        }
      } else {
        const result = await login(email, password);
        if (result.success) {
          router.push("/admin");
        } else {
          setError(result.error || "Invalid email or password.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { icon: Heart, label: "500+ children fed" },
    { icon: BookOpen, label: "120+ students" },
    { icon: Globe, label: "8 provinces" },
  ];

  return (
    <div className="min-h-screen flex bg-light-linen">
      {/* Left Panel — Covenant-navy branded panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden bg-covenant-navy">
        {/* Layered background elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-harvest-gold/[0.03] rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-[350px] h-[350px] bg-mission-red/[0.04] rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-white/[0.02] rounded-full blur-3xl rotate-12" />
        </div>

        {/* Decorative cross pattern — subtle watermark */}
        <div className="absolute inset-0 opacity-[0.025]">
          <svg className="absolute top-16 right-16 w-64 h-64" viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" rx="4" fill="white" />
            <rect x="20" y="75" width="160" height="30" rx="4" fill="white" />
          </svg>
          <svg className="absolute bottom-20 left-12 w-32 h-32" viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" rx="4" fill="white" />
            <rect x="20" y="75" width="160" height="30" rx="4" fill="white" />
          </svg>
        </div>

        {/* Subtle grain texture */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

        {/* Top accent stripe — mission-red */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mission-red via-mission-red/80 to-transparent" />
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top — Back link */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors group" style={{ fontSize: "0.8125rem" }}>
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to site
            </Link>
          </div>

          {/* Center — Scripture quote + decorative elements */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Decorative open quote */}
              <div
                className="text-harvest-gold/15 mb-2 leading-none select-none"
                style={{ fontFamily: "var(--font-serif)", fontSize: "5rem", fontWeight: 300 }}
              >
                &ldquo;
              </div>
              <blockquote className="max-w-md">
                <p
                  className="text-white/80 mb-6"
                  style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.375rem, 2vw, 1.75rem)", lineHeight: "1.55", fontWeight: 300, letterSpacing: "-0.01em" }}
                >
                  Whoever is generous to the poor lends to the Lord, and he will repay him for his deed.
                </p>
                <div className="w-10 h-[2px] bg-harvest-gold/50 rounded-full mb-4" />
                <cite className="not-italic text-harvest-gold block" style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.02em" }}>
                  Proverbs 19:17
                </cite>
              </blockquote>
            </motion.div>

            {/* Floating stat pills */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 flex flex-wrap gap-3"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.06] rounded-full px-4 py-2"
                >
                  <stat.icon size={13} className="text-harvest-gold/60" />
                  <span className="text-white/45" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom — Admin portal badge with red accent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-mission-red/15 border border-mission-red/10 flex items-center justify-center">
              <ShieldCheck size={16} className="text-mission-red/70" />
            </div>
            <div>
              <p className="text-white/60" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Admin Portal</p>
              <p className="text-white/25" style={{ fontSize: "0.6875rem" }}>Manage content, stories &amp; impact data</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-harvest-gold/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-covenant-navy/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px] relative z-10"
        >
          {/* Mobile back link */}
          <div className="lg:hidden mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-text/50 hover:text-covenant-navy transition-colors group" style={{ fontSize: "0.8125rem" }}>
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to site
            </Link>
          </div>

          {/* Logo & Header */}
          <div className="mb-8">
            <div className="inline-flex items-center mb-4">
              <img src={logoDarkImg} alt="Kapatid Ministry" className="h-12 w-auto" />
            </div>
            <h1
              className="text-covenant-navy mb-1.5"
              style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-slate-text" style={{ fontSize: "0.9375rem" }}>
              {mode === "login" ? "Sign in to manage your ministry content" : "Set up a new admin account"}
            </p>
          </div>

          {/* Mode Toggle — pill */}
          <div className="flex bg-field-sand rounded-xl p-1 mb-8 border border-mist/30">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-300 cursor-pointer ${
                mode === "login"
                  ? "bg-white text-covenant-navy shadow-sm shadow-covenant-navy/5"
                  : "text-slate-text hover:text-covenant-navy"
              }`}
              style={{ fontSize: "0.8125rem", fontWeight: 600 }}
            >
              <LogIn size={14} /> Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-300 cursor-pointer ${
                mode === "signup"
                  ? "bg-white text-covenant-navy shadow-sm shadow-covenant-navy/5"
                  : "text-slate-text hover:text-covenant-navy"
              }`}
              style={{ fontSize: "0.8125rem", fontWeight: 600 }}
            >
              <UserPlus size={14} /> Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-1">
                    <label className="block text-covenant-navy mb-2" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-text/30 pointer-events-none" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-ink placeholder:text-slate-text/35 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30 border border-mist/40 focus:border-harvest-gold/30 transition-all"
                        placeholder="Your name"
                        required
                        disabled={submitting}
                        style={{ fontSize: "0.9375rem" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-covenant-navy mb-2" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-text/30 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-ink placeholder:text-slate-text/35 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30 border border-mist/40 focus:border-harvest-gold/30 transition-all"
                  placeholder="admin@kapatid.org"
                  required
                  disabled={submitting}
                  style={{ fontSize: "0.9375rem" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-covenant-navy mb-2" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-text/30 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white text-ink placeholder:text-slate-text/35 focus:outline-none focus:ring-2 focus:ring-harvest-gold/30 border border-mist/40 focus:border-harvest-gold/30 transition-all"
                  placeholder={mode === "signup" ? "Min 6 characters" : "Enter password"}
                  required
                  minLength={6}
                  disabled={submitting}
                  style={{ fontSize: "0.9375rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-text/30 hover:text-slate-text/60 transition-colors cursor-pointer p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-mission-red/5 border border-mission-red/15 rounded-xl px-4 py-3">
                    <p className="text-mission-red text-center" style={{ fontSize: "0.8125rem" }}>{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-harvest-gold text-white py-3.5 rounded-xl hover:bg-[#c88e30] hover:shadow-lg hover:shadow-harvest-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
              style={{ fontSize: "0.9375rem", fontWeight: 700 }}
            >
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-mist/40" />
            <span className="text-slate-text/30" style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              or
            </span>
            <div className="flex-1 h-px bg-mist/40" />
          </div>

          {/* Switch prompt */}
          <p className="text-center text-slate-text" style={{ fontSize: "0.8125rem" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              className="text-mission-red hover:text-mission-red/80 font-semibold transition-colors cursor-pointer"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>

          {/* Bottom hint */}
          <div className="mt-8 pt-6 border-t border-mist/20 text-center">
            <p className="text-slate-text/40" style={{ fontSize: "0.75rem" }}>
              Press{" "}
              <kbd className="bg-white border border-mist/40 px-1.5 py-0.5 rounded text-covenant-navy/60 shadow-sm" style={{ fontFamily: "monospace", fontSize: "0.625rem" }}>
                Ctrl+Shift+A
              </kbd>{" "}
              from any page to access this portal
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}