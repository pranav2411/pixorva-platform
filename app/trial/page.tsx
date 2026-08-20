"use client";

import React, { useEffect, useState } from "react";
import { Oswald, Inter } from "next/font/google";
import { Loader2, CheckCircle, Zap, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../utils/supabase/client";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function TrialPage() {
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  // Handle the trial activation
  useEffect(() => {
    const activateTrial = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/trial");
        return;
      }

      // Check if they've already used the trial
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_used_trial')
        .eq('id', user.id)
        .single();

      if (profile?.has_used_trial) {
        setErrorMsg("You have already used your free trial. Only one free trial is allowed per account.");
        return;
      }

      // Start the UI steps animation
      setTimeout(() => setStep(1), 1000); // Connecting...
      setTimeout(() => setStep(2), 2500); // Provisioning...
      setTimeout(() => setStep(3), 4000); // Unlocking...

      // Perform DB Activation
      const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({
          trial_started_at: new Date().toISOString(),
          trial_ends_at: trialEndsAt,
          has_used_trial: true
        })
        .eq('id', user.id);

      if (error) {
        console.error("Trial activation error:", error.message);
        setErrorMsg("Failed to activate free trial. Please try again later.");
        return;
      }

      setTimeout(() => setStep(4), 5500); // Done!
    };

    activateTrial();
  }, [router]);

  return (
    <div className={`min-h-screen bg-yellow-400 flex flex-col items-center justify-center text-center p-6 ${inter.className}`}>
      
      <div className="bg-white border-4 border-black p-8 md:p-12 rounded-3xl shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full">
          
          {errorMsg ? (
              <div className="animate-in zoom-in duration-300">
                  <div className="mb-6 flex justify-center">
                    <div className="bg-red-500 text-white p-4 rounded-full border-4 border-black">
                        <X size={48} />
                    </div>
                  </div>
                  <h1 className={`text-4xl uppercase mb-2 ${oswald.className}`}>Cannot Activate Trial</h1>
                  <p className="text-gray-600 font-bold mb-8">{errorMsg}</p>
                  
                  <Link href="/">
                    <button className="w-full bg-black text-white text-xl py-4 rounded-xl font-bold uppercase hover:bg-yellow-400 hover:text-black hover:border-black border-4 border-transparent hover:border-black transition shadow-lg">
                        Go to Dashboard
                    </button>
                  </Link>
              </div>
          ) : step < 4 ? (
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
                        Applying &quot;3-Day Free Pass&quot;
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
                  <p className="mt-4 text-xs font-bold text-gray-400 uppercase">Trial expires in 3 days</p>
              </div>
          )}

      </div>

    </div>
  );
}