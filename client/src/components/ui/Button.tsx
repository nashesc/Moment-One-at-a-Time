import React from "react";
import { cn } from "@/lib/utils"; // Assuming a standard tailwind-merge utility

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
}

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-all duration-200 ease-in-out active:scale-95";
  
  const variants = {
    primary: "bg-nature-green text-white shadow-sm hover:bg-forest-green",
    secondary: "bg-white text-nature-green border border-nature-green hover:bg-pale-green/30",
    tertiary: "bg-transparent text-nature-green hover:underline decoration-soft-green underline-offset-4",
    destructive: "bg-red-50 text-red-700 hover:bg-red-100",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)} 
      {...props}
    >
      {children}
    </button>
  );
}