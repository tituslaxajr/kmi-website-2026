import React from "react";

interface FilterPillProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  variant?: "light" | "dark";
}

export function FilterPill({ label, active = false, onClick, variant = "light" }: FilterPillProps) {
  const lightStyles = active
    ? "bg-covenant-navy text-white border-covenant-navy shadow-sm"
    : "bg-white/80 backdrop-blur-sm text-covenant-navy border-covenant-navy/8 hover:border-covenant-navy/25 hover:bg-white";

  const darkStyles = active
    ? "bg-white text-covenant-navy border-white shadow-sm"
    : "bg-white/8 backdrop-blur-sm text-white/70 border-white/10 hover:border-white/25 hover:bg-white/12 hover:text-white";

  return (
    <button
      onClick={onClick}
      className={`px-4.5 py-2 rounded-full transition-all duration-300 cursor-pointer border ${
        variant === "dark" ? darkStyles : lightStyles
      }`}
      style={{ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.01em", padding: "0.5rem 1.125rem" }}
    >
      {label}
    </button>
  );
}
