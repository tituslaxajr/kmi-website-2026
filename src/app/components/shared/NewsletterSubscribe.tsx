"use client"
import { useState } from "react";
import { Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { subscribe } from "../../lib/api";

interface NewsletterSubscribeProps {
  variant?: "inline" | "card";
}

export function NewsletterSubscribe({ variant = "inline" }: NewsletterSubscribeProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setStatus("loading");
    try {
      const result = await subscribe(email.trim());
      setStatus("success");
      setMessage(result.message || "Thank you for subscribing!");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  if (variant === "card") {
    return (
      <div className="bg-white rounded-2xl border border-mist/30 p-6 lg:p-8">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-harvest-gold/8 flex items-center justify-center">
            <Mail size={15} className="text-harvest-gold" />
          </div>
          <h3
            className="text-covenant-navy"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            Stay Updated
          </h3>
        </div>
        <p
          className="text-slate-text mb-4"
          style={{ fontSize: "0.8125rem", lineHeight: "1.55" }}
        >
          Receive field stories and ministry updates directly in your inbox.
        </p>

        {status === "success" ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-4 py-3">
            <CheckCircle2 size={16} />
            <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
              {message}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-field-sand/50 text-ink focus:outline-none focus:ring-2 focus:ring-harvest-gold/40 border border-transparent focus:border-harvest-gold/20 transition-all"
              style={{ fontSize: "0.875rem" }}
            />
            <button
              type="submit"
              disabled={status === "loading" || !email.trim()}
              className="w-full bg-harvest-gold text-white px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-harvest-gold/20 transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ fontSize: "0.8125rem", fontWeight: 700 }}
            >
              {status === "loading" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Mail size={16} />
              )}
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
            {status === "error" && (
              <p className="text-mission-red" style={{ fontSize: "0.75rem" }}>
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    );
  }

  // Inline variant (for footer)
  return (
    <div>
      <h4
        className="text-white/25 mb-3"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "0.625rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Newsletter
      </h4>
      <p
        className="text-white/35 mb-3"
        style={{ fontSize: "0.8125rem", lineHeight: "1.5" }}
      >
        Get field stories delivered to your inbox.
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-harvest-gold">
          <CheckCircle2 size={14} />
          <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
            {message}
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="your@email.com"
            required
            className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-harvest-gold/40 border border-white/8 focus:border-harvest-gold/30 transition-all"
            style={{ fontSize: "0.8125rem" }}
          />
          <button
            type="submit"
            disabled={status === "loading" || !email.trim()}
            className="px-4 py-2.5 rounded-lg bg-harvest-gold text-white hover:bg-harvest-gold/90 transition-all duration-300 cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shrink-0"
            style={{ fontSize: "0.75rem", fontWeight: 700 }}
          >
            {status === "loading" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <ArrowRight size={13} />
            )}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="text-mission-red/80 mt-1.5" style={{ fontSize: "0.6875rem" }}>
          {message}
        </p>
      )}
    </div>
  );
}
