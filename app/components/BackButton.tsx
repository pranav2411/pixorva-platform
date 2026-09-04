"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallback?: string;
  className?: string;
  iconSize?: number;
  children?: React.ReactNode;
  ariaLabel?: string;
  onClick?: () => void;
}

export default function BackButton({
  fallback = "/",
  className,
  iconSize = 18,
  children,
  ariaLabel = "Go back",
  onClick,
}: BackButtonProps) {
  const router = useRouter();

  const handleNavigation = () => {
    if (onClick) {
      onClick();
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleNavigation}
      className={
        className ??
        "bg-black/50 text-white p-2 rounded-xl hover:bg-[#ffc700] hover:text-black transition border border-white/15 shadow-sm flex items-center justify-center shrink-0"
      }
      aria-label={ariaLabel}
    >
      {children || <ArrowLeft size={iconSize} />}
    </button>
  );
}
