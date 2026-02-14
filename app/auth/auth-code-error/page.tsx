"use client";

import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import { AlertTriangle } from "lucide-react";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function AuthErrorPage() {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-white text-black ${inter.className}`}>
      <div className="text-center max-w-md p-8">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
        </div>
        
        <h1 className={`text-4xl uppercase mb-4 ${oswald.className}`}>Login Failed</h1>
        <p className="text-gray-500 mb-8">
          The login link was invalid or has expired. Please try again with a fresh link.
        </p>

        <Link 
            href="/" 
            className="bg-black text-white px-8 py-3 rounded-xl font-bold uppercase hover:bg-yellow-400 hover:text-black transition-all"
        >
            Try Again
        </Link>
      </div>
    </div>
  );
}