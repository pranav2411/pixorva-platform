"use client";

import React, { useEffect, useState } from "react";
import { Oswald, Inter } from "next/font/google";
import { Loader2, CheckCircle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function TrialPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  // Simulate the "Activation" process
  useEffect(() => {
    const timers = [
        setTimeout(() => setStep(1), 1000), // Connecting...
        setTimeout(() => setStep(2), 2500), // Provisioning Agents...
        setTimeout(() => setStep(3), 4000), // Unlocking Free Tier...
        setTimeout(() => setStep(4), 5500), // Done!
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className={`min-h-screen bg-yellow-400 flex flex-col items-center justify-center text-center p-6 ${inter.className}`}>
      
      <div className="bg-white border-4 border-black p-8 md:p-12 rounded-3xl shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full">
          
          {step < 4 ? (
              <>
                <div className="mb-6 flex justify-center">
                    <Loader2 size={64} className="animate-spin text-black" />
                </div>
                <h1 className={`text-4xl uppercase mb-4 ${oswald.className}`}>Activating Trial...</h1>
                
                <div className="space-y-4 text-left font-bold text-gray-500 bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                    <div className={`flex items-center gap-3 transition ${step >= 1 ? 'text-black' : 'opacity-30'}`}>
                        {step >= 1 ? <CheckCircle size={20} className="text-green-500"/> : <div className="w-5 h-5 rounded-full border-2 border-gray-300"/>}
                        Connecting to Pixorva Mainframe
                    </div>
                    <div className={`flex items-center gap-3 transition ${step >= 2 ? 'text-black' : 'opacity-30'}`}>
                        {step >= 2 ? <CheckCircle size={20} className="text-green-500"/> : <div className="w-5 h-5 rounded-full border-2 border-gray-300"/>}
                        Provisioning AI Workforce
                    </div>
                    <div className={`flex items-center gap-3 transition ${step >= 3 ? 'text-black' : 'opacity-30'}`}>
                        {step >= 3 ? <CheckCircle size={20} className="text-green-500"/> : <div className="w-5 h-5 rounded-full border-2 border-gray-300"/>}
                        Applying &quot;7-Day Free Pass&quot;
                    </div>
                </div>
              </>
          ) : (
              <div className="animate-in zoom-in duration-300">
                  <div className="mb-6 flex justify-center">
                    <div className="bg-green-500 text-white p-4 rounded-full border-4 border-black">
                        <Zap size={48} fill="white" />
                    </div>
                  </div>
                  <h1 className={`text-4xl uppercase mb-2 ${oswald.className}`}>You are Live!</h1>
                  <p className="text-gray-600 font-bold mb-8">Your team is ready and waiting for orders.</p>
                  
                  <Link href="/">
                    <button className="w-full bg-black text-white text-xl py-4 rounded-xl font-bold uppercase hover:bg-yellow-400 hover:text-black hover:border-black border-4 border-transparent hover:border-black transition shadow-lg">
                        Enter Dashboard
                    </button>
                  </Link>
                  <p className="mt-4 text-xs font-bold text-gray-400 uppercase">Trial expires in 7 days</p>
              </div>
          )}

      </div>

    </div>
  );
}