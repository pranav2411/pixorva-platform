"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("pixorva_cookie_consent");
    if (!consent) {
      // Delay showing banner by 1 second for beautiful entry
      const timer = setTimeout(() => {
        setShow(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("pixorva_cookie_consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("pixorva_cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999] max-w-sm w-[90%] bg-white border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 p-1.5 rounded-lg border-2 border-black text-black">
            <Cookie size={18} />
          </div>
          <span className="font-black text-sm uppercase tracking-wider text-black">Cookie Consent</span>
        </div>
        <button 
          onClick={handleDecline} 
          className="text-gray-400 hover:text-black transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs font-semibold text-gray-600 leading-relaxed mb-4">
        We use cookies to maintain your login session, track usage telemetry, and compile traffic metrics. Read our{" "}
        <Link href="/privacy" className="underline font-bold text-black hover:text-yellow-600">
          Privacy Policy
        </Link>{" "}
        to learn more.
      </p>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="flex-1 bg-black text-white hover:bg-yellow-400 hover:text-black py-2.5 rounded-xl border-2 border-black font-black uppercase text-[10px] tracking-wider transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5"
        >
          Accept Cookies
        </button>
        <button
          onClick={handleDecline}
          className="bg-white text-gray-500 hover:text-black hover:bg-gray-50 px-4 py-2.5 rounded-xl border-2 border-black font-black uppercase text-[10px] tracking-wider transition"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
