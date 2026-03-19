import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({ variant = "primary", size = "md", children, className = "", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full transition-all duration-300 cursor-pointer font-semibold tracking-wide relative overflow-hidden";

  const variants = {
    primary:
      "bg-harvest-gold text-white hover:bg-[#c88e30] hover:shadow-lg hover:shadow-harvest-gold/20 hover:-translate-y-0.5 active:translate-y-0",
    secondary:
      "bg-transparent border-[1.5px] border-harvest-gold/50 text-harvest-gold hover:border-harvest-gold hover:bg-harvest-gold/5 hover:-translate-y-0.5",
    outline:
      "bg-transparent border-[1.5px] border-covenant-navy/15 text-covenant-navy hover:border-covenant-navy hover:bg-covenant-navy hover:text-white hover:-translate-y-0.5",
    ghost: "text-covenant-navy hover:bg-field-sand/70",
  };

  const sizes = {
    sm: "px-5 py-2 text-[0.8125rem]",
    md: "px-7 py-3 text-[0.875rem]",
    lg: "px-8 py-3.5 text-[0.9375rem]",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
