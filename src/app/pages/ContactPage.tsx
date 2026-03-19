"use client"
import { Button } from "../components/shared/Button";
import { ScriptureBlock } from "../components/shared/ScriptureBlock";
import { CTABanner } from "../components/shared/CTABanner";
import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, Loader2, Clock, ArrowRight } from "lucide-react";
import { scriptures } from "../data/mockData";
import { useImages } from "../hooks/useSiteImages";
import { submitContact } from "../lib/api";

export function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const IMAGES = useImages();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContact(formData);
      setSubmitted(true);
    } catch (err) {
      console.error("Contact form error:", err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-40 pb-28 px-6 lg:px-8 overflow-hidden">
        <img src={IMAGES.prayer} alt="Contact" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-covenant-navy/85 via-covenant-navy/70 to-covenant-navy/90" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
              <span className="text-harvest-gold/60 uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                Connect
              </span>
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
            </div>
            <h1 className="text-white">Get In Touch</h1>
            <p className="text-white/50 mt-4 max-w-lg mx-auto" style={{ fontSize: "1.0625rem", lineHeight: "1.7" }}>
              We'd love to hear from you — whether you want to partner, volunteer, or simply pray with us.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-16 lg:py-20 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 lg:gap-14">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-10 text-center border border-mist/25"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-harvest-gold/10 mb-5">
                    <Send size={24} className="text-harvest-gold" />
                  </div>
                  <h3 className="text-covenant-navy mb-2.5" style={{ fontFamily: "var(--font-heading)", fontSize: "1.375rem", fontWeight: 700 }}>
                    Message Sent
                  </h3>
                  <p className="text-slate-text max-w-sm mx-auto" style={{ fontSize: "0.9375rem", lineHeight: "1.6" }}>
                    Thank you for reaching out. We'll get back to you within 2-3 business days.
                  </p>
                </motion.div>
              ) : (
                <div className="bg-white rounded-2xl p-7 lg:p-9 border border-mist/25">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-covenant-navy mb-1.5" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                          Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-field-sand/40 text-ink placeholder:text-slate-text/40 focus:outline-none focus:ring-2 focus:ring-harvest-gold/35 border border-transparent focus:border-harvest-gold/20 transition-all"
                          placeholder="Your name"
                          style={{ fontSize: "0.9375rem" }}
                        />
                      </div>
                      <div>
                        <label className="block text-covenant-navy mb-1.5" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-field-sand/40 text-ink placeholder:text-slate-text/40 focus:outline-none focus:ring-2 focus:ring-harvest-gold/35 border border-transparent focus:border-harvest-gold/20 transition-all"
                          placeholder="your@email.com"
                          style={{ fontSize: "0.9375rem" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-covenant-navy mb-1.5" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-field-sand/40 text-ink placeholder:text-slate-text/40 focus:outline-none focus:ring-2 focus:ring-harvest-gold/35 border border-transparent focus:border-harvest-gold/20 transition-all"
                        placeholder="How can we help?"
                        style={{ fontSize: "0.9375rem" }}
                      />
                    </div>
                    <div>
                      <label className="block text-covenant-navy mb-1.5" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-field-sand/40 text-ink placeholder:text-slate-text/40 focus:outline-none focus:ring-2 focus:ring-harvest-gold/35 border border-transparent focus:border-harvest-gold/20 resize-none transition-all"
                        placeholder="Tell us more..."
                        style={{ fontSize: "0.9375rem" }}
                      />
                    </div>
                    <Button type="submit" size="lg" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          Send Message <ArrowRight size={15} />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <div className="bg-covenant-navy text-white rounded-2xl p-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-harvest-gold/4 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-harvest-gold mb-5" style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700 }}>
                  Contact Information
                </h3>
                <div className="space-y-4 relative z-10">
                  {[
                    { icon: Mail, label: "Email", value: "inquiries@kapatidministry.org" },
                    { icon: Mail, label: "Alt Email", value: "kapatidministry@gmail.com" },
                    { icon: Phone, label: "Phone", value: "+63 999 516 1932" },
                    { icon: Phone, label: "Alt Phone", value: "+63 909 476 2692" },
                    { icon: MapPin, label: "Office", value: "4 Acacia St., Silanganan Subd. Llano, Caloocan City, Philippines" },
                    { icon: Clock, label: "Hours", value: "Mon-Fri, 9am-5pm PHT" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-harvest-gold/70" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-white/35" style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {label}
                        </p>
                        <p className="text-white/90" style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-mist/25">
                <h3 className="text-covenant-navy mb-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700 }}>
                  Visit Us
                </h3>
                <p className="text-slate-text" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
                  Our office is at 4 Acacia St., Silanganan Subd. Llano, Caloocan City, Philippines. We welcome visitors by appointment — reach out to schedule a visit.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-mist/25">
                <h3 className="text-covenant-navy mb-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700 }}>
                  Volunteer With Us
                </h3>
                <p className="text-slate-text" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
                  From short mission trips to medical missions, volunteers serve alongside community members. Send us a message to get involved.
                </p>
              </div>

              <div className="bg-field-sand/60 rounded-xl p-6 border border-harvest-gold/10">
                <h3 className="text-covenant-navy mb-1.5" style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700 }}>
                  International Giving
                </h3>
                <p className="text-slate-text" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
                  For bank transfer inquiries or international partnerships, use this form or email us directly.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cinematic Scripture */}
      <ScriptureBlock
        text={scriptures.contact.text}
        reference={scriptures.contact.reference}
        variant="cinematic"
        backgroundImage={IMAGES.cinematicMountain}
      />

      {/* CTA */}
      <CTABanner
        headline="Ready to Make a Difference?"
        description="Your support goes directly to local churches and the communities they serve across the Philippines."
        primaryLabel="Give Now"
        primaryTo="/give"
        secondaryLabel="See Our Impact"
        secondaryTo="/impact"
      />
    </div>
  );
}