"use client";

import React, { useState, useEffect } from "react";
import { Oswald, Inter } from "next/font/google";
import { 
  ArrowLeft, ShieldCheck, Lock, Play, Activity, 
  Cpu, DollarSign, Database, FileCode, CheckCircle
} from 'lucide-react';
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { showToast } from "../../utils/Toast";
import { triggerRazorpayCheckout } from "../../utils/RazorpayCheckout";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function GovernanceInfoPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
            router.push("/login");
            return;
        }
        setUser(currentUser);
        
        // If they already bought it, redirect to dashboard
        const { data: govAgent } = await supabase
            .from('agents')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('name', 'Governance Control Tower')
            .maybeSingle();

        if (govAgent) {
            router.push("/governance");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handlePurchase = async () => {
    if (!user) return;
    setPurchasing(true);

    const steps = [
      { name: "Proxy Gateway", description: "Universal LLM Relay", icon: "Activity" },
      { name: "Auditing Vault", description: "Audit trail logs", icon: "FileCode" },
      { name: "Policy Gate", description: "Rate limits & filters", icon: "Lock" }
    ];

    await triggerRazorpayCheckout({
      userId: user.id,
      agentName: "Governance Control Tower",
      icon: "ShieldCheck",
      steps: steps,
      amount: 199900, // ₹1,999 in paise
      email: user.email || "",
      onSuccess: () => {
        router.push("/governance");
      },
      onFailure: () => {
        setPurchasing(false);
      }
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-[#0e0f12] flex items-center justify-center ${inter.className}`}>
        <div className="bg-[#141519] border border-white/15 p-8 rounded-2xl shadow-2xl text-center max-w-sm text-white">
          <Activity className="animate-spin mx-auto text-[#ffc700] mb-4" size={32} />
          <h3 className={`text-xl uppercase ${oswald.className} text-white`}>Verifying Access...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#0e0f12] text-white pb-16 ${inter.className} selection:bg-[#ffc700] selection:text-black`}>
      
      {/* HEADER */}
      <nav className="bg-[#141519]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="bg-black/50 text-white p-2 rounded-xl hover:bg-[#ffc700] hover:text-black transition border border-white/15 shadow-sm flex items-center justify-center">
              <ArrowLeft size={20}/>
            </Link>
            <div>
              <h1 className={`text-2xl md:text-3xl uppercase ${oswald.className} tracking-tighter leading-none text-white`}>AI Governance</h1>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">Continuous Compliance Layer</span>
            </div>
          </div>
          
          <button 
            disabled={purchasing}
            onClick={handlePurchase}
            className="bg-[#ffc700] text-black border border-yellow-300 px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wide shadow-sm hover:bg-yellow-400 transition"
          >
            {purchasing ? "Initiating..." : "Subscribe Now - ₹1,999/mo"}
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-4xl mx-auto px-6 mt-12">
        <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-8 md:p-12 shadow-2xl text-center mb-12 text-white">
          <div className="inline-block bg-[#ffc700]/20 text-[#ffc700] border border-[#ffc700]/30 rounded-lg px-3 py-1 font-bold text-xs uppercase mb-4">
            Universal Compliance Control Tower
          </div>
          <h2 className={`text-4xl md:text-5xl uppercase tracking-tighter mb-4 ${oswald.className} leading-none text-white`}>
            Secure & Audit Any LLM in the World
          </h2>
          <p className="text-neutral-300 font-medium max-w-2xl mx-auto text-sm leading-relaxed mb-6">
            The Pixorva AI Governance Lab acts as a zero-trust compliance gateway and proxy. It filters malicious inputs, detects model drift, runs automated vulnerability audits, and creates certified reports across all your custom models and APIs.
          </p>
          <div className="flex justify-center gap-6 font-mono text-xs font-bold text-neutral-400 uppercase">
            <span>✓ OpenAI Compatible</span>
            <span>✓ Claude Proxied</span>
            <span>✓ vLLM & Ollama Ready</span>
          </div>
        </div>

        {/* SECURITY ARCHITECTURE BANNER */}
        <div className="bg-black/60 border border-white/15 rounded-2xl p-6 shadow-xl mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
          <div className="flex gap-3">
            <div className="bg-[#ffc700]/20 text-[#ffc700] p-2 rounded-lg border border-[#ffc700]/30 h-fit mt-1"><Lock size={16}/></div>
            <div>
              <h4 className="font-bold text-xs uppercase text-[#ffc700]">Strictly User-Owned Keys</h4>
              <p className="text-[10px] text-neutral-400 leading-normal mt-1">We do not cache your keys. Request headers carry strictly your client-level browser key credentials.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg border border-emerald-500/30 h-fit mt-1"><ShieldCheck size={16}/></div>
            <div>
              <h4 className="font-bold text-xs uppercase text-emerald-400">Zero Server Fallbacks</h4>
              <p className="text-[10px] text-neutral-400 leading-normal mt-1">Your sandbox operations strictly lease your configured keys, preventing credentials leaks or billing cross-talks.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg border border-blue-500/30 h-fit mt-1"><FileCode size={16}/></div>
            <div>
              <h4 className="font-bold text-xs uppercase text-blue-400">Immutable Cryptographic Audit</h4>
              <p className="text-[10px] text-neutral-400 leading-normal mt-1">Creates offline signatures for every scanned model configuration to verify state compliance for audits.</p>
            </div>
          </div>
        </div>

        {/* CORE FEATURES LIST */}
        <h3 className={`text-2xl uppercase mb-6 ${oswald.className} text-white`}>Included Core Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-6 hover:border-[#ffc700]/50 transition shadow-xl text-white">
            <div className="bg-blue-500/20 text-blue-400 p-2.5 rounded-xl border border-blue-500/30 w-fit mb-3"><Activity size={20}/></div>
            <h4 className="font-black text-sm uppercase text-white">Universal Proxy Gateway</h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Route and measure all prompts using live-calculated latency, token counts, and cost computations for OpenAI, Anthropic, Gemini, or self-hosted GPU servers.
            </p>
          </div>

          <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-6 hover:border-[#ffc700]/50 transition shadow-xl text-white">
            <div className="bg-red-500/20 text-red-400 p-2.5 rounded-xl border border-red-500/30 w-fit mb-3"><Lock size={20}/></div>
            <h4 className="font-black text-sm uppercase text-white">Active Guardrails Gate</h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Instantly toggle content filtering, rate limit thresholds, cost quotas, and admission rules to block unapproved prompts on the spot.
            </p>
          </div>

          <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-6 hover:border-[#ffc700]/50 transition shadow-xl text-white">
            <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/30 w-fit mb-3"><ShieldCheck size={20}/></div>
            <h4 className="font-black text-sm uppercase text-white">Model Bias & Drift Engine</h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Run statistical evaluation tests for bias, Population Stability Index (PSI) drift, and codebase vulnerability scans to certify your models.
            </p>
          </div>

          <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-6 hover:border-[#ffc700]/50 transition shadow-xl text-white">
            <div className="bg-[#ffc700]/20 text-[#ffc700] p-2.5 rounded-xl border border-[#ffc700]/30 w-fit mb-3"><Database size={20}/></div>
            <h4 className="font-black text-sm uppercase text-white">Lineage Registry & Downloads</h4>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Manage custom model endpoints with details on owner, lineage, and risk rating. Export fully signed txt compliance evidence cards with one click.
            </p>
          </div>

        </div>

        {/* BOTTOM BUY OUT */}
        <div className="bg-gradient-to-b from-[#141519] to-black border border-white/15 rounded-2xl p-8 text-center shadow-2xl text-white">
          <h3 className={`text-2xl uppercase mb-2 ${oswald.className} text-white`}>Unlock Continuous Governance</h3>
          <p className="text-xs text-neutral-300 font-medium max-w-md mx-auto mb-6">
            Get complete governance capability, proxy limits up to 100k requests, and continuous compliance scoring.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              disabled={purchasing}
              onClick={handlePurchase}
              className="bg-[#ffc700] text-black hover:bg-yellow-400 py-4 px-8 rounded-xl font-black uppercase text-xs transition w-full sm:w-auto shadow-lg"
            >
              {purchasing ? "Initiating Checkout..." : "Subscribe & Unlock Command Tower"}
            </button>
            <span className="text-xs font-black text-neutral-400 uppercase">₹1,999 / month salary</span>
          </div>
        </div>

      </main>

    </div>
  );
}
