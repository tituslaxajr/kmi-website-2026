"use client"
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Heart,
  Eye,
  ArrowRight,
  Check,
  Info,
  X,
  Copy,
  Smartphone,
  Landmark,
  Mail,
  CheckCircle,
  ExternalLink,
  PartyPopper,
  Upload,
  ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] ?? "";
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
import { scriptures } from "../data/mockData";
import { useImages } from "../hooks/useSiteImages";
import { ScriptureBlock } from "../components/shared/ScriptureBlock";
import { Button } from "../components/shared/Button";
import { CTABanner } from "../components/shared/CTABanner";

const presetAmounts = [500, 1000, 2500, 5000, 10000];
const fundCategories = [
  { id: "ofw", label: "OFW Families", desc: "Bible studies and support for Overseas Filipino Worker families", ministrySlug: "ofw-families" },
  { id: "youth", label: "Out of School Youth", desc: "Education and discipleship for at-risk young people", ministrySlug: null },
  { id: "child", label: "Child Sponsorship", desc: "Provide food, education, and care for underprivileged children", ministrySlug: "child-sponsorship" },
  { id: "livelihood", label: "Livelihood & Calamity", desc: "Emergency relief and sustainable livelihood programs", ministrySlug: "feeding-program" },
  { id: "church", label: "Church Planting", desc: "Support new church plants in marginalized communities", ministrySlug: null },
  { id: "general", label: "General Fund", desc: "Support wherever the need is greatest", ministrySlug: null },
];

type PaymentMethod = "gcash" | "maya" | "bank";

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}[] = [
  { id: "gcash", label: "GCash", color: "#007DFE", bgColor: "bg-[#007DFE]/5", borderColor: "border-[#007DFE]", icon: "G" },
  { id: "maya", label: "Maya", color: "#00B274", bgColor: "bg-[#00B274]/5", borderColor: "border-[#00B274]", icon: "M" },
  { id: "bank", label: "Bank Transfer", color: "#103B53", bgColor: "bg-covenant-navy/5", borderColor: "border-covenant-navy", icon: "B" },
];

const PAYMENT_DETAILS: Record<PaymentMethod, {
  accountName: string;
  accountNumber: string;
  instructions: string[];
  note: string;
}> = {
  gcash: {
    accountName: "Kapatid Ministry",
    accountNumber: "0999 516 1932",
    instructions: [
      "Open your GCash app and tap \"Send Money\"",
      "Enter the GCash number shown above",
      "Enter the exact amount and add the reference code in the message field",
      "Review and confirm the transaction",
      "Screenshot the confirmation and send to our email",
    ],
    note: "GCash has a daily send limit of ₱100,000. For larger gifts, you may split across multiple transactions or use bank transfer.",
  },
  maya: {
    accountName: "Kapatid Ministry",
    accountNumber: "0909 476 2692",
    instructions: [
      "Copy your reference code above — you'll need it for the message field",
      "Click \"Proceed to Maya\" below to open the secure Maya payment page",
      "Complete the payment on the Maya page",
      "Once done, come back to this tab — we'll show a confirmation",
      "Email your screenshot to our email for our records",
    ],
    note: "You'll be redirected to Maya's secure payment page (paymaya.me). The reference code helps us track your gift to the correct fund.",
  },
  bank: {
    accountName: "Kapatid Ministry Inc.",
    accountNumber: "Please contact us for bank details",
    instructions: [
      "Contact us at kapatidministry@gmail.com to request our bank account details",
      "Transfer the amount to the provided account",
      "Include the reference code in the transaction remarks",
      "Email a copy of the deposit slip or transfer confirmation to our email",
    ],
    note: "Bank transfers are recommended for amounts over ₱100,000 and international donors. Processing may take 1–3 business days.",
  },
};

const MAYA_PAYMENT_LINK = "https://paymaya.me/KAPATIDMINISTRY2";

function generateRef(fund: string): string {
  const prefix = "KM";
  const fundCode = fund.toUpperCase().slice(0, 4);
  const date = new Date();
  const ts = `${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${fundCode}-${ts}-${rand}`;
}

export function GivePage() {
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedFund, setSelectedFund] = useState("general");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("gcash");
  const [showModal, setShowModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const activeAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
  const IMAGES = useImages();

  const fundLabel = fundCategories.find((f) => f.id === selectedFund)?.label || "General Fund";
  const refCode = generateRef(selectedFund);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleGive = () => {
    if (!activeAmount || activeAmount <= 0) return;
    setShowModal(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-40 pb-28 px-6 lg:px-8 overflow-hidden">
        <img src={IMAGES.sunrise} alt="Give" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-covenant-navy/85 via-covenant-navy/70 to-covenant-navy/90" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
              <span className="text-harvest-gold/60 uppercase" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.12em" }}>
                Stewardship
              </span>
              <span className="block w-7 h-[2px] bg-harvest-gold/40 rounded-full" />
            </div>
            <h1 className="text-white">Give</h1>
            <p className="text-white/50 mt-5 max-w-xl mx-auto" style={{ fontSize: "1.0625rem", lineHeight: "1.7" }}>
              Every gift — large or small — is stewarded with faithfulness and transparency through our local church partners.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16 lg:py-20 px-6 lg:px-8 bg-light-linen">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl shadow-lg shadow-covenant-navy/4 p-7 lg:p-10 border border-mist/25"
          >
            {/* Frequency Toggle */}
            <div className="flex justify-center mb-9">
              <div className="bg-field-sand/70 rounded-full p-1 flex">
                {(["one-time", "monthly"] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setFrequency(freq)}
                    className={`px-6 py-2 rounded-full transition-all duration-300 cursor-pointer ${
                      frequency === freq
                        ? "bg-covenant-navy text-white shadow-sm"
                        : "text-covenant-navy/70 hover:text-covenant-navy"
                    }`}
                    style={{ fontSize: "0.8125rem", fontWeight: 600 }}
                  >
                    {freq === "one-time" ? "One-time" : "Monthly"}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-3.5">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                  className={`py-3 rounded-xl transition-all duration-300 cursor-pointer border-[1.5px] ${
                    selectedAmount === amount && !customAmount
                      ? "bg-covenant-navy text-white border-covenant-navy shadow-sm"
                      : "bg-field-sand/30 text-covenant-navy border-transparent hover:border-covenant-navy/10"
                  }`}
                  style={{ fontSize: "1rem", fontWeight: 700 }}
                >
                  ₱{amount.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="relative mb-3.5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-text" style={{ fontSize: "1rem", fontWeight: 500 }}>
                ₱
              </span>
              <input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-field-sand/30 text-covenant-navy placeholder:text-slate-text/40 focus:outline-none focus:ring-2 focus:ring-harvest-gold/40 border border-transparent focus:border-harvest-gold/25 transition-all"
                style={{ fontSize: "1rem" }}
              />
            </div>

            {/* Currency Note */}
            <div className="flex items-start gap-2 mb-9 px-3.5 py-2.5 rounded-lg bg-field-sand/40 border border-mist/30">
              <Info size={13} className="text-harvest-gold mt-0.5 shrink-0" />
              <p className="text-slate-text" style={{ fontSize: "0.6875rem", lineHeight: "1.35rem" }}>
                All amounts are in <span className="font-semibold text-covenant-navy">Philippine Peso (₱ PHP)</span>.
                For reference: ₱1,000 ≈ $17.50 USD ≈ RM 78 MYR.
                International donors can give via bank transfer — <a href="/contact" className="text-harvest-gold hover:underline font-medium">contact us</a> for details.
              </p>
            </div>

            {/* Fund Selection */}
            <h3
              className="text-covenant-navy mb-3.5"
              style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700 }}
            >
              Direct Your Gift
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-9">
              {fundCategories.map((fund) => (
                <button
                  key={fund.id}
                  onClick={() => setSelectedFund(fund.id)}
                  className={`text-left p-4 rounded-xl transition-all duration-300 cursor-pointer border-[1.5px] relative ${
                    selectedFund === fund.id
                      ? "border-harvest-gold bg-harvest-gold/4"
                      : "border-mist/50 hover:border-covenant-navy/10"
                  }`}
                >
                  {selectedFund === fund.id && (
                    <div className="absolute top-3 right-3 w-4.5 h-4.5 rounded-full bg-harvest-gold flex items-center justify-center" style={{ width: "1.125rem", height: "1.125rem" }}>
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                  <span className="block text-covenant-navy" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                    {fund.label}
                  </span>
                  <span className="block text-slate-text mt-0.5" style={{ fontSize: "0.75rem", lineHeight: "1.25rem" }}>
                    {fund.desc}
                  </span>
                  {fund.ministrySlug && (
                    <Link
                      href={`/ministries/${fund.ministrySlug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 mt-2 text-harvest-gold hover:underline"
                      style={{ fontSize: "0.6875rem", fontWeight: 600 }}
                    >
                      Learn about this ministry <ArrowRight size={10} strokeWidth={2.5} />
                    </Link>
                  )}
                </button>
              ))}
            </div>

            {/* Payment Method */}
            <h3
              className="text-covenant-navy mb-3.5"
              style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: 700 }}
            >
              Payment Method
            </h3>
            <div className="grid grid-cols-3 gap-2.5 mb-9">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`relative p-4 rounded-xl transition-all duration-300 cursor-pointer border-[1.5px] flex flex-col items-center gap-2 ${
                    selectedMethod === method.id
                      ? `${method.borderColor} ${method.bgColor}`
                      : "border-mist/50 hover:border-covenant-navy/10"
                  }`}
                >
                  {selectedMethod === method.id && (
                    <div
                      className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: method.color }}
                    >
                      <Check size={9} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${method.color}15` }}
                  >
                    {method.id === "bank" ? (
                      <Landmark size={18} style={{ color: method.color }} />
                    ) : (
                      <span style={{ color: method.color, fontSize: "1.125rem", fontWeight: 800 }}>{method.icon}</span>
                    )}
                  </div>
                  <span
                    className="text-covenant-navy text-center"
                    style={{ fontSize: "0.8125rem", fontWeight: 700 }}
                  >
                    {method.label}
                  </span>
                  {method.id === "maya" && (
                    <span className="flex items-center gap-1 text-[#00B274]/70" style={{ fontSize: "0.5625rem", fontWeight: 600 }}>
                      <ExternalLink size={8} />
                      Secure payment link
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Submit */}
            <Button
              size="lg"
              className="w-full !py-3.5"
              onClick={handleGive}
              disabled={!activeAmount || activeAmount <= 0}
            >
              {selectedMethod === "maya"
                ? `Pay ${activeAmount ? `₱${activeAmount.toLocaleString()}` : ""} via Maya`
                : `${frequency === "monthly" ? "Give Monthly" : "Give"} ${activeAmount ? `₱${activeAmount.toLocaleString()}` : ""} via ${PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}`}
              {selectedMethod === "maya" ? <ExternalLink size={15} /> : <ArrowRight size={16} />}
            </Button>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-7 border-t border-mist/30">
              {[
                { icon: Shield, label: "Secure & Encrypted" },
                { icon: Eye, label: "100% Transparent" },
                { icon: Heart, label: "Tax Deductible" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-slate-text" style={{ fontSize: "0.75rem" }}>
                  <Icon size={13} className="text-harvest-gold/70" strokeWidth={2} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Payment Instructions Modal */}
      <AnimatePresence>
        {showModal && (
          <PaymentModal
            method={selectedMethod}
            amount={activeAmount || 0}
            frequency={frequency}
            fund={fundLabel}
            refCode={refCode}
            onCopy={handleCopy}
            copiedField={copiedField}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Impact Tiers */}
      <section className="py-20 lg:py-24 px-6 lg:px-8 bg-field-sand">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-covenant-navy mb-10">Your Gift Makes a Difference</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { amount: "₱500", impact: "Feeds a family for one week" },
              { amount: "₱1,000", impact: "Provides school supplies for 5 children" },
              { amount: "₱2,500", impact: "Supports a pastor's monthly needs" },
            ].map((item, i) => (
              <motion.div
                key={item.amount}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl p-6 border border-mist/30 hover:shadow-md hover:shadow-covenant-navy/4 transition-all duration-500 hover:-translate-y-0.5"
              >
                <div
                  className="text-harvest-gold mb-2"
                  style={{ fontFamily: "var(--font-heading)", fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}
                >
                  {item.amount}
                </div>
                <p className="text-slate-text" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>{item.impact}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Scripture */}
      <ScriptureBlock
        text={scriptures.give.text}
        reference={scriptures.give.reference}
        variant="cinematic"
        backgroundImage={IMAGES.cinematicBible}
      />

      {/* CTA */}
      <CTABanner
        headline="See Where Your Gift Goes"
        description="Read real stories from the field and see the impact of faithful giving in Filipino communities."
        primaryLabel="Read Field Stories"
        primaryTo="/stories"
        secondaryLabel="View Our Impact"
        secondaryTo="/impact"
      />
    </div>
  );
}

// ─── Payment Instructions Modal ──────────────────────────────────────────────

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-bf6aba98`;

interface PaymentModalProps {
  method: PaymentMethod;
  amount: number;
  frequency: string;
  fund: string;
  refCode: string;
  onCopy: (text: string, field: string) => void;
  copiedField: string | null;
  onClose: () => void;
}

type ModalStep = "donor-info" | "instructions" | "thank-you";

function PaymentModal({ method, amount, frequency, fund, refCode, onCopy, copiedField, onClose }: PaymentModalProps) {
  const details = PAYMENT_DETAILS[method];
  const methodInfo = PAYMENT_METHODS.find((m) => m.id === method)!;

  // Step management
  const [step, setStep] = useState<ModalStep>("donor-info");

  // Donor info
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [donorErrors, setDonorErrors] = useState<{ name?: string; email?: string }>({});

  // Payment step
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [mayaOpened, setMayaOpened] = useState(false);
  const [returnedFromMaya, setReturnedFromMaya] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mayaWindowRef = useRef<Window | null>(null);

  // Screenshot upload
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect when user returns from Maya tab
  useEffect(() => {
    if (method !== "maya" || !mayaOpened) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && mayaOpened && !returnedFromMaya) {
        setReturnedFromMaya(true);
        toast.success("Welcome back! We hope your Maya payment went smoothly.", {
          description: `Reference: ${refCode} · ₱${amount.toLocaleString()} for ${fund}`,
          duration: 8000,
          icon: <Heart size={16} className="text-mission-red" />,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [method, mayaOpened, returnedFromMaya, refCode, amount, fund]);

  const handleProceedToMaya = () => {
    setMayaOpened(true);
    mayaWindowRef.current = window.open(MAYA_PAYMENT_LINK, "_blank", "noopener,noreferrer");
  };

  const handleScreenshotSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select an image file (JPG, PNG, WebP, GIF).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB.");
      return;
    }

    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));

    // Upload immediately
    setUploadingScreenshot(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("refCode", refCode);

      const res = await fetch(`${API_BASE}/donations/upload-screenshot`, {
        method: "POST",
        headers: { Authorization: `Bearer ${publicAnonKey}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Screenshot upload error:", errData);
        toast.error("Failed to upload screenshot.", { description: errData.error || "Please try again." });
        setUploadingScreenshot(false);
        return;
      }

      const data = await res.json();
      setScreenshotUrl(data.public_url);
      toast.success("Screenshot uploaded successfully!");
    } catch (err: any) {
      console.error("Screenshot upload network error:", err);
      toast.error("Network error uploading screenshot.");
    }
    setUploadingScreenshot(false);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setScreenshotUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateDonorInfo = (): boolean => {
    const errors: { name?: string; email?: string } = {};
    if (!donorName.trim()) errors.name = "Please enter your name";
    if (!donorEmail.trim()) {
      errors.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())) {
      errors.email = "Please enter a valid email address";
    }
    setDonorErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToInstructions = () => {
    if (validateDonorInfo()) {
      setStep("instructions");
    }
  };

  const handleFinalConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/donations/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim().toLowerCase(),
          amount,
          fund,
          frequency,
          method,
          refCode,
          message: donorMessage.trim(),
          screenshotUrl: screenshotUrl || "",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Donation submit error:", errData);
        toast.error("Something went wrong submitting your donation info.", {
          description: errData.error || "Please try again or email us directly.",
        });
        setSubmitting(false);
        return;
      }

      setStep("thank-you");
      toast.success("Salamat! Your generosity blesses many lives.", {
        description: `A receipt has been sent to ${donorEmail.trim()}`,
        duration: 6000,
      });
    } catch (err: any) {
      console.error("Donation submit network error:", err);
      toast.error("Network error — please check your connection.", {
        description: "Your donation info was not submitted. You can email us directly at kapatidministry@gmail.com.",
      });
    }
    setSubmitting(false);
  };

  const summaryItems = [
    { label: "Amount", value: `₱${amount.toLocaleString()}` },
    { label: "Frequency", value: frequency === "monthly" ? "Monthly" : "One-time" },
    { label: "Fund", value: fund },
    { label: "Reference", value: refCode },
  ];

  const isMaya = method === "maya";

  // Header text based on step
  const headerTitle =
    step === "donor-info"
      ? "Your Information"
      : step === "thank-you"
        ? "Salamat — God Bless You!"
        : returnedFromMaya
          ? "Payment Complete?"
          : `Send via ${methodInfo.label}`;

  const headerSubtitle =
    step === "donor-info"
      ? "So we can send you a receipt and track your gift"
      : step === "thank-you"
        ? "Your donation has been recorded and a receipt emailed to you"
        : returnedFromMaya
          ? "If your Maya payment was successful, please confirm below"
          : "Follow the steps below to complete your gift";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-covenant-navy/40 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div className="relative w-full h-full overflow-y-auto flex items-start justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 border border-mist/20 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-5 border-b border-mist/20">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor:
                    step === "thank-you" ? "#22C55E12" : `${methodInfo.color}12`,
                }}
              >
                {step === "thank-you" ? (
                  <Heart size={20} className="text-green-600" />
                ) : method === "bank" ? (
                  <Landmark size={20} style={{ color: methodInfo.color }} />
                ) : (
                  <span style={{ color: methodInfo.color, fontSize: "1.25rem", fontWeight: 800 }}>{methodInfo.icon}</span>
                )}
              </div>
              <div>
                <h3
                  className="text-covenant-navy"
                  style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 700 }}
                >
                  {headerTitle}
                </h3>
                <p className="text-slate-text" style={{ fontSize: "0.75rem" }}>
                  {headerSubtitle}
                </p>
              </div>
            </div>

            {/* Step indicator */}
            {step !== "thank-you" && (
              <div className="flex items-center gap-1.5 mt-4">
                {(["donor-info", "instructions"] as const).map((s, i) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white transition-all"
                      style={{
                        fontSize: "0.625rem",
                        fontWeight: 700,
                        backgroundColor:
                          step === s
                            ? methodInfo.color
                            : (step === "instructions" && s === "donor-info")
                              ? "#22C55E"
                              : "#CBD5E1",
                      }}
                    >
                      {step === "instructions" && s === "donor-info" ? (
                        <Check size={11} strokeWidth={3} />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className="hidden sm:block"
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: step === s ? methodInfo.color : "#94A3B8",
                      }}
                    >
                      {s === "donor-info" ? "Your Info" : "Payment"}
                    </span>
                    {i === 0 && (
                      <div className="w-6 h-[1.5px] rounded-full bg-mist/40 mx-1" />
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-field-sand/60 text-slate-text/60 hover:text-covenant-navy transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* ═══════════════ STEP 1: Donor Info ═══════════════ */}
          {step === "donor-info" && (
            <div className="px-6 py-5 space-y-5">
              {/* Summary Card */}
              <div className="bg-field-sand/40 rounded-xl p-4 border border-mist/25">
                <div className="grid grid-cols-2 gap-3">
                  {summaryItems.map((item) => (
                    <div key={item.label}>
                      <span className="block text-slate-text/60" style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {item.label}
                      </span>
                      <span className="block text-covenant-navy mt-0.5" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-covenant-navy mb-1.5" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                  Full Name <span className="text-mission-red">*</span>
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => { setDonorName(e.target.value); setDonorErrors((p) => ({ ...p, name: undefined })); }}
                  placeholder="Juan dela Cruz"
                  className={`w-full px-4 py-3 rounded-xl bg-field-sand/30 text-covenant-navy placeholder:text-slate-text/40 focus:outline-none focus:ring-2 transition-all border ${
                    donorErrors.name
                      ? "border-mission-red/40 focus:ring-mission-red/30"
                      : "border-transparent focus:ring-harvest-gold/40 focus:border-harvest-gold/25"
                  }`}
                  style={{ fontSize: "0.9375rem" }}
                />
                {donorErrors.name && (
                  <p className="text-mission-red mt-1" style={{ fontSize: "0.6875rem" }}>{donorErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-covenant-navy mb-1.5" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                  Email Address <span className="text-mission-red">*</span>
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => { setDonorEmail(e.target.value); setDonorErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="juan@email.com"
                  className={`w-full px-4 py-3 rounded-xl bg-field-sand/30 text-covenant-navy placeholder:text-slate-text/40 focus:outline-none focus:ring-2 transition-all border ${
                    donorErrors.email
                      ? "border-mission-red/40 focus:ring-mission-red/30"
                      : "border-transparent focus:ring-harvest-gold/40 focus:border-harvest-gold/25"
                  }`}
                  style={{ fontSize: "0.9375rem" }}
                />
                {donorErrors.email && (
                  <p className="text-mission-red mt-1" style={{ fontSize: "0.6875rem" }}>{donorErrors.email}</p>
                )}
                <p className="text-slate-text/50 mt-1.5" style={{ fontSize: "0.6875rem" }}>
                  We'll send your donation receipt here. We never share your email.
                </p>
              </div>

              {/* Optional Message */}
              <div>
                <label className="block text-covenant-navy mb-1.5" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                  Message <span className="text-slate-text/40 font-normal">(optional)</span>
                </label>
                <textarea
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  placeholder="A prayer request, encouragement, or note for the team..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-field-sand/30 text-covenant-navy placeholder:text-slate-text/40 focus:outline-none focus:ring-2 focus:ring-harvest-gold/40 border border-transparent focus:border-harvest-gold/25 transition-all resize-none"
                  style={{ fontSize: "0.9375rem" }}
                />
              </div>

              {/* Privacy note */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-field-sand/50 border border-mist/25">
                <Shield size={12} className="text-harvest-gold mt-0.5 shrink-0" />
                <p className="text-slate-text/60" style={{ fontSize: "0.6875rem", lineHeight: "1.35rem" }}>
                  Your information is kept private and only used for donation tracking and receipts. We will never share your data with third parties.
                </p>
              </div>

              {/* Continue button */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-mist/40 text-slate-text hover:bg-field-sand/50 transition-all cursor-pointer"
                  style={{ fontSize: "0.875rem", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinueToInstructions}
                  className="flex-[2] py-3 rounded-xl text-white transition-all cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ backgroundColor: methodInfo.color, fontSize: "0.875rem", fontWeight: 700 }}
                >
                  Continue to Payment
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 2: Payment Instructions ═══════════════ */}
          {step === "instructions" && (
            <div className="px-6 py-5 space-y-5">
              {/* Returned from Maya — Success Banner */}
              {returnedFromMaya && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-4 border border-green-200 bg-green-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-green-800" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                        Welcome back from Maya!
                      </p>
                      <p className="text-green-700/70 mt-0.5" style={{ fontSize: "0.75rem", lineHeight: "1.35" }}>
                        If you completed the payment, tick the checkbox below and confirm. If you need to try again, click "Pay Again via Maya".
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Summary Card with donor name */}
              <div className="bg-field-sand/40 rounded-xl p-4 border border-mist/25">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Donor", value: donorName },
                    { label: "Email", value: donorEmail },
                    ...summaryItems,
                  ].map((item) => (
                    <div key={item.label}>
                      <span className="block text-slate-text/60" style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {item.label}
                      </span>
                      <span className="block text-covenant-navy mt-0.5 truncate" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Details — only for GCash */}
              {method === "gcash" && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between bg-white rounded-xl p-3.5 border border-mist/30">
                    <div>
                      <span className="block text-slate-text/50" style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Account Name
                      </span>
                      <span className="block text-covenant-navy mt-0.5" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>
                        {details.accountName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white rounded-xl p-3.5 border border-mist/30">
                    <div>
                      <span className="block text-slate-text/50" style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {methodInfo.label} Number
                      </span>
                      <span className="block text-covenant-navy mt-0.5" style={{ fontSize: "1.125rem", fontWeight: 800, letterSpacing: "0.04em", fontFamily: "monospace" }}>
                        {details.accountNumber}
                      </span>
                    </div>
                    <button
                      onClick={() => onCopy(details.accountNumber.replace(/\s/g, ""), "number")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white transition-all cursor-pointer shrink-0"
                      style={{ backgroundColor: copiedField === "number" ? "#22C55E" : methodInfo.color, fontSize: "0.6875rem", fontWeight: 700 }}
                    >
                      {copiedField === "number" ? (
                        <span className="flex items-center gap-1"><CheckCircle size={12} /> Copied</span>
                      ) : (
                        <span className="flex items-center gap-1"><Copy size={12} /> Copy</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Reference Code — copyable (shown for all except bank) */}
              {method !== "bank" && (
                <div className="flex items-center justify-between bg-white rounded-xl p-3.5 border border-mist/30">
                  <div>
                    <span className="block text-slate-text/50" style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Reference Code {isMaya ? "(include in Maya message)" : "(paste in message)"}
                    </span>
                    <span className="block text-harvest-gold mt-0.5" style={{ fontSize: "0.9375rem", fontWeight: 800, letterSpacing: "0.03em", fontFamily: "monospace" }}>
                      {refCode}
                    </span>
                  </div>
                  <button
                    onClick={() => onCopy(refCode, "ref")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-harvest-gold text-white transition-all cursor-pointer shrink-0 hover:bg-[#c88e30]"
                    style={{ backgroundColor: copiedField === "ref" ? "#22C55E" : undefined, fontSize: "0.6875rem", fontWeight: 700 }}
                  >
                    {copiedField === "ref" ? (
                      <span className="flex items-center gap-1"><CheckCircle size={12} /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-1"><Copy size={12} /> Copy</span>
                    )}
                  </button>
                </div>
              )}

              {/* Step-by-step Instructions */}
              <div>
                <h4
                  className="text-covenant-navy mb-3"
                  style={{ fontSize: "0.8125rem", fontWeight: 700 }}
                >
                  {isMaya ? "How to Pay via Maya" : "How to Send"}
                </h4>
                <ol className="space-y-2">
                  {details.instructions.map((instrStep, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                        style={{ backgroundColor: `${methodInfo.color}15`, color: methodInfo.color, fontSize: "0.625rem", fontWeight: 800 }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-slate-text" style={{ fontSize: "0.8125rem", lineHeight: "1.4" }}>
                        {instrStep}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Maya: Proceed Button */}
              {isMaya && (
                <button
                  onClick={handleProceedToMaya}
                  className="w-full py-3.5 rounded-xl text-white transition-all cursor-pointer flex items-center justify-center gap-2.5 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    backgroundColor: "#00B274",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                  }}
                >
                  {returnedFromMaya ? (
                    <span className="flex items-center gap-2">
                      <ExternalLink size={16} />
                      Pay Again via Maya
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ExternalLink size={16} />
                      Proceed to Maya
                    </span>
                  )}
                </button>
              )}

              {/* Note */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-field-sand/50 border border-mist/25">
                <Info size={12} className="text-slate-text/40 mt-0.5 shrink-0" />
                <p className="text-slate-text/60" style={{ fontSize: "0.6875rem", lineHeight: "1.35rem" }}>
                  {details.note}
                </p>
              </div>

              {/* Confirmation Toggle */}
              <button
                onClick={() => setConfirmationSent(!confirmationSent)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer"
                style={{
                  borderColor: confirmationSent ? "#22C55E40" : "#E8E4DF",
                  backgroundColor: confirmationSent ? "#22C55E08" : "transparent",
                }}
              >
                <div
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                  style={{
                    borderColor: confirmationSent ? "#22C55E" : "#CBD5E1",
                    backgroundColor: confirmationSent ? "#22C55E" : "transparent",
                  }}
                >
                  {confirmationSent && <Check size={11} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                  I have completed the {isMaya ? "Maya payment" : "transfer"}
                </span>
              </button>

              {/* Screenshot Upload — appears after ticking confirmation */}
              {confirmationSent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="rounded-xl border border-mist/30 overflow-hidden">
                    <div className="px-4 py-3 bg-field-sand/30 border-b border-mist/20">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={14} className="text-harvest-gold" />
                        <span className="text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                          Upload Payment Proof
                        </span>
                        <span className="text-slate-text/50" style={{ fontSize: "0.6875rem" }}>(recommended)</span>
                      </div>
                    </div>

                    {!screenshotPreview ? (
                      <label className="flex flex-col items-center gap-3 p-6 cursor-pointer hover:bg-field-sand/20 transition-colors">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${methodInfo.color}10` }}
                        >
                          <Upload size={20} style={{ color: methodInfo.color }} />
                        </div>
                        <div className="text-center">
                          <p className="text-covenant-navy" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                            Tap to upload screenshot
                          </p>
                          <p className="text-slate-text/50 mt-0.5" style={{ fontSize: "0.6875rem" }}>
                            JPG, PNG, WebP — max 10 MB
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
                          onChange={handleScreenshotSelect}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="p-3">
                        <div className="relative rounded-lg overflow-hidden border border-mist/30">
                          <img
                            src={screenshotPreview}
                            alt="Payment proof"
                            className="w-full max-h-48 object-contain bg-field-sand/20"
                          />
                          {uploadingScreenshot && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                              <div className="flex items-center gap-2 text-covenant-navy">
                                <span className="w-5 h-5 border-2 border-covenant-navy/30 border-t-covenant-navy rounded-full animate-spin" />
                                <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Uploading...</span>
                              </div>
                            </div>
                          )}
                          {screenshotUrl && !uploadingScreenshot && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-green-500 text-white" style={{ fontSize: "0.625rem", fontWeight: 700 }}>
                              <CheckCircle size={10} /> Uploaded
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-slate-text/60 truncate max-w-[200px]" style={{ fontSize: "0.6875rem" }}>
                            {screenshotFile?.name}
                          </span>
                          <button
                            onClick={handleRemoveScreenshot}
                            className="flex items-center gap-1 text-mission-red/70 hover:text-mission-red cursor-pointer transition-colors"
                            style={{ fontSize: "0.6875rem", fontWeight: 600 }}
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Footer */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep("donor-info")}
                  className="py-3 px-5 rounded-xl border border-mist/40 text-slate-text hover:bg-field-sand/50 transition-all cursor-pointer"
                  style={{ fontSize: "0.875rem", fontWeight: 600 }}
                >
                  Back
                </button>
                {confirmationSent && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1"
                  >
                    <button
                      onClick={handleFinalConfirm}
                      disabled={submitting || uploadingScreenshot}
                      className="w-full py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ fontSize: "0.875rem", fontWeight: 700 }}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CheckCircle size={16} />
                          Confirm & Send Receipt
                        </span>
                      )}
                    </button>
                  </motion.div>
                )}
                {!confirmationSent && (
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-mist/40 text-slate-text hover:bg-field-sand/50 transition-all cursor-pointer"
                    style={{ fontSize: "0.875rem", fontWeight: 600 }}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ STEP 3: Thank You ═══════════════ */}
          {step === "thank-you" && (
            <div className="px-6 py-8 space-y-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto"
              >
                <CheckCircle size={32} className="text-green-600" />
              </motion.div>

              <div>
                <h3
                  className="text-covenant-navy"
                  style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 800 }}
                >
                  Salamat, {donorName.split(" ")[0]}!
                </h3>
                <p className="text-slate-text mt-2 max-w-sm mx-auto" style={{ fontSize: "0.875rem", lineHeight: "1.6" }}>
                  Your gift of <span className="font-bold text-covenant-navy">₱{amount.toLocaleString()}</span> to {fund} has been recorded. A donation receipt has been sent to <span className="font-semibold text-covenant-navy">{donorEmail}</span>.
                </p>
              </div>

              {/* Receipt summary */}
              <div className="bg-field-sand/40 rounded-xl p-4 border border-mist/25 text-left">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Reference", value: refCode },
                    { label: "Method", value: methodInfo.label },
                    { label: "Amount", value: `₱${amount.toLocaleString()}` },
                    { label: "Fund", value: fund },
                  ].map((item) => (
                    <div key={item.label}>
                      <span className="block text-slate-text/60" style={{ fontSize: "0.625rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {item.label}
                      </span>
                      <span className="block text-covenant-navy mt-0.5" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-slate-text/60" style={{ fontSize: "0.75rem", fontStyle: "italic", lineHeight: "1.5" }}>
                "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
                <span className="block mt-1 not-italic font-semibold text-slate-text/50">— 2 Corinthians 9:7</span>
              </p>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-covenant-navy text-white hover:bg-covenant-navy/90 transition-all cursor-pointer"
                style={{ fontSize: "0.875rem", fontWeight: 700 }}
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}