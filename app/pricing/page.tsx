"use client";

import React, { useState } from "react";
import { Oswald, Inter } from "next/font/google";
import { Check, X, Zap, Crown, Shield, Rocket, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client";
import { showToast } from "../utils/Toast";
import { triggerRazorpayCheckout } from "../utils/RazorpayCheckout";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function PricingPage() {
  const router = useRouter();
  const [agreeCheckout, setAgreeCheckout] = useState(false);

  const handleSubscribe = async (plan: string, price: number) => {
    if (!agreeCheckout) {
      showToast("Please agree to the Terms of Service & Privacy Policy to checkout.", "error");
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    try {
      await triggerRazorpayCheckout({
        userId: user.id,
        agentName: plan === 'growth_pro' ? 'Growth Pro Plan' : 'Enterprise Plan',
        icon: plan === 'growth_pro' ? 'Zap' : 'Crown',
        steps: [],
        amount: price * 100,
        email: user.email || "",
        isSubscription: true,
        isPlan: true,
        planCode: plan,
        onSuccess: () => {
          router.push("/employees");
        },
        onFailure: () => {}
      });
    } catch (err: any) {
      showToast("Subscription failed: " + err.message, "error");
    }
  };

  return (
    <div className={`min-h-screen bg-white text-black ${inter.className} flex flex-col`}>
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b-4 border-black sticky top-0 bg-white z-50">
        <Link href="/" className="flex items-center gap-2">
            <Image
                src="/favicon.ico"
                alt="Pixorva Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded"
            />
            <span className={`text-2xl uppercase italic ${oswald.className}`}>Pixorva</span>
        </Link>
        <Link href="/trial">
            <button className="bg-yellow-400 text-black border-2 border-black px-4 py-2 rounded font-bold uppercase hover:bg-black hover:text-white transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none">
                Start Free Trial
            </button>
        </Link>
      </nav>

      {/* HERO */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-red-500 text-white border-2 border-black px-4 py-1 rounded-full text-xs font-black uppercase mb-6 transform -rotate-2">
            Stop Burning Cash on Payroll
        </div>
        <h1 className={`text-5xl md:text-8xl uppercase leading-[0.9] mb-8 ${oswald.className}`}>
          Hire an Entire Team <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">
             For the Price of Lunch.
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Why pay ₹50,000/mo for one intern when you can have 20 Senior AI Experts for a fraction of the cost?
        </p>
      </div>

      {/* THE COMPARISON (US VS THEM) */}
      <div className="max-w-6xl mx-auto px-6 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              
              {/* FREELANCER */}
              <div className="bg-gray-100 p-8 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col items-center text-center opacity-60">
                  <h3 className={`text-2xl uppercase mb-4 ${oswald.className}`}>Freelancer</h3>
                  <div className="text-4xl font-black mb-2 text-gray-500">₹30k<span className="text-sm">/mo</span></div>
                  <ul className="space-y-4 mt-6 text-sm font-bold text-gray-500">
                      <li className="flex items-center justify-center gap-2"><X size={16}/> Availability: 9-5 only</li>
                      <li className="flex items-center justify-center gap-2"><X size={16}/> Speed: 3-5 days/task</li>
                      <li className="flex items-center justify-center gap-2"><X size={16}/> Skills: Limited to one</li>
                      <li className="flex items-center justify-center gap-2"><X size={16}/> Reliability: Ghosting risk</li>
                  </ul>
              </div>

              {/* AGENCY */}
              <div className="bg-gray-100 p-8 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col items-center text-center opacity-60">
                  <h3 className={`text-2xl uppercase mb-4 ${oswald.className}`}>Traditional Agency</h3>
                  <div className="text-4xl font-black mb-2 text-gray-500">₹1.5L<span className="text-sm">/mo</span></div>
                  <ul className="space-y-4 mt-6 text-sm font-bold text-gray-500">
                      <li className="flex items-center justify-center gap-2"><Check size={16}/> Availability: 9-5 M-F</li>
                      <li className="flex items-center justify-center gap-2"><X size={16}/> Speed: Weeks/Months</li>
                      <li className="flex items-center justify-center gap-2"><Check size={16}/> Skills: High</li>
                      <li className="flex items-center justify-center gap-2"><X size={16}/> Meetings: Too many</li>
                  </ul>
              </div>

              {/* PIXORVA (HERO) */}
              <div className="bg-yellow-300 p-8 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase">Winner</div>
                  <h3 className={`text-4xl uppercase mb-4 ${oswald.className}`}>Pixorva AI</h3>
                  <div className="text-5xl font-black mb-2">₹4,999<span className="text-xl">/mo</span></div>
                  <ul className="space-y-4 mt-6 text-sm font-black text-black">
                      <li className="flex items-center justify-center gap-2"><Zap size={18} fill="black"/> Availability: 24/7/365</li>
                      <li className="flex items-center justify-center gap-2"><Zap size={18} fill="black"/> Speed: Instant Results</li>
                      <li className="flex items-center justify-center gap-2"><Zap size={18} fill="black"/> Skills: 20+ Experts</li>
                      <li className="flex items-center justify-center gap-2"><Zap size={18} fill="black"/> Drama: Zero. None.</li>
                  </ul>
                  <button 
                    onClick={() => handleSubscribe('growth_pro', 4999)}
                    className="mt-8 w-full bg-black text-white py-3 rounded-lg font-bold uppercase hover:bg-white hover:text-black hover:border-2 hover:border-black transition"
                  >
                      Join the Revolution
                  </button>
              </div>

          </div>
      </div>

      {/* PRICING TIERS */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
          <h2 className={`text-4xl text-center uppercase mb-6 ${oswald.className}`}>Choose Your Plan</h2>
          
          {/* Consent Checkbox */}
          <div className="max-w-md mx-auto mb-12 flex justify-center text-center">
             <div className="flex items-start gap-3 text-xs font-semibold text-gray-600 bg-gray-50 border-2 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left">
               <input
                 type="checkbox"
                 id="pricing-agree"
                 checked={agreeCheckout}
                 onChange={(e) => setAgreeCheckout(e.target.checked)}
                 className="mt-0.5 cursor-pointer w-4 h-4 border-2 border-black rounded focus:ring-0 accent-black"
               />
               <label htmlFor="pricing-agree" className="cursor-pointer select-none leading-relaxed">
                 I confirm that I accept Pixorva&apos;s{" "}
                 <Link href="/terms" target="_blank" className="underline font-bold text-black hover:text-yellow-600">Terms of Service</Link>
                 ,{" "}
                 <Link href="/privacy" target="_blank" className="underline font-bold text-black hover:text-yellow-600">Privacy Policy</Link>
                 , and monthly subscription auto-renewal terms.
               </label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* STARTER */}
              <div className="border-4 border-black rounded-2xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-1 bg-white flex flex-col justify-between">
                  <div>
                      <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 border-2 border-black"><Shield size={24}/></div>
                      <h3 className={`text-2xl uppercase ${oswald.className}`}>Starter</h3>
                      <p className="text-gray-500 text-sm font-bold mb-6">For testing individual agents.</p>
                      <div className="text-4xl font-black mb-6">₹0 <span className="text-sm font-medium text-gray-500">/ 3 Days</span></div>
                      <ul className="space-y-3 text-sm font-medium mb-8">
                          <li className="flex gap-2"><Check size={16}/> Try 1 Agent of choice</li>
                          <li className="flex gap-2"><Check size={16}/> Full Agent capabilities</li>
                          <li className="flex gap-2"><Check size={16}/> 1 Free Trial per account</li>
                      </ul>
                  </div>
                  <Link href="/trial">
                    <button className="w-full border-2 border-black py-3 rounded-lg font-bold uppercase hover:bg-black hover:text-white transition">Start Free Trial</button>
                  </Link>
              </div>

              {/* PRO (HIGHLIGHTED) */}
              <div className="border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-black text-white relative transform md:-translate-y-4 flex flex-col justify-between">
                  <div>
                      <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-black px-3 py-1 uppercase rounded-bl-lg border-l-2 border-b-2 border-black">Most Popular</div>
                      <div className="bg-yellow-400 text-black w-12 h-12 rounded-full flex items-center justify-center mb-4 border-2 border-white"><Rocket size={24}/></div>
                      <h3 className={`text-2xl uppercase ${oswald.className}`}>Growth Pro</h3>
                      <p className="text-gray-400 text-sm font-bold mb-6">For scaling startups.</p>
                      <div className="text-4xl font-black mb-6 text-yellow-400">₹4,999 <span className="text-sm font-medium text-gray-400">/ mo</span></div>
                      <ul className="space-y-3 text-sm font-medium mb-8">
                          <li className="flex gap-2"><Check size={16}/> Full access to any 4 Agents</li>
                          <li className="flex gap-2"><Check size={16}/> Unlimited tasks</li>
                          <li className="flex gap-2"><Check size={16}/> Fast execution speed</li>
                          <li className="flex gap-2"><Check size={16}/> Save workstation history</li>
                      </ul>
                  </div>
                  <button 
                    onClick={() => handleSubscribe('growth_pro', 4999)}
                    className="w-full bg-yellow-400 text-black border-2 border-yellow-400 py-3 rounded-lg font-bold uppercase hover:bg-white hover:border-white transition"
                  >
                      Get Growth Pro
                  </button>
              </div>

              {/* ENTERPRISE */}
              <div className="border-4 border-black rounded-2xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-1 bg-white flex flex-col justify-between">
                  <div>
                      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 border-2 border-black"><Crown size={24}/></div>
                      <h3 className={`text-2xl uppercase ${oswald.className}`}>Enterprise</h3>
                      <p className="text-gray-500 text-sm font-bold mb-6">For heavy workflows.</p>
                      <div className="text-4xl font-black mb-6">₹19,999 <span className="text-sm font-medium text-gray-500">/ mo</span></div>
                      <ul className="space-y-3 text-sm font-medium mb-8">
                          <li className="flex gap-2"><Check size={16}/> Deploy ALL AI Agents</li>
                          <li className="flex gap-2"><Check size={16}/> Unlimited tasks & executions</li>
                          <li className="flex gap-2"><Check size={16}/> Priority execution speed</li>
                          <li className="flex gap-2"><Check size={16}/> Dedicated account support</li>
                      </ul>
                  </div>
                  <button 
                    onClick={() => handleSubscribe('enterprise', 19999)}
                    className="w-full border-2 border-black py-3 rounded-lg font-bold uppercase hover:bg-black hover:text-white transition"
                  >
                      Get Enterprise
                  </button>
              </div>

          </div>
      </div>

      {/* FOOTER WITH BIG PIXORVA BACKGROUND WATERMARK */}
      <footer className="relative bg-black text-white pt-20 pb-12 border-t border-white/10 overflow-hidden mt-auto">
        {/* Big PIXORVA Background Text */}
        <div
          className={`absolute top-6 left-0 right-0 text-[18vw] font-black tracking-tighter text-white/[0.035] select-none pointer-events-none text-center leading-none ${oswald.className}`}
        >
          PIXORVA
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-16 border-b border-white/10">
            
            {/* Column 1: Pixorva Details & Brand (Spans 2 columns on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <span className={`text-2xl font-black uppercase tracking-wider text-white ${oswald.className}`}>
                  Pixorva
                </span>
              </div>

              <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
                Pixorva is the autonomous AI workforce platform engineered for high-growth enterprises and modern operational teams. We design, deploy, and govern role-specialized AI agent swarms with dedicated vector memory, private VPC isolation, and proprietary tool connectors.
              </p>

              {/* Support Callout */}
              <div className="pt-2">
                <a
                  href="mailto:support@pixorva.org"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#ffc700] hover:underline bg-[#ffc700]/10 border border-[#ffc700]/20 px-3 py-1.5 rounded-lg transition"
                >
                  <Mail size={13} />
                  <span>support@pixorva.org</span>
                </a>
              </div>
            </div>

            {/* Column 2: Platform Navigation */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Platform
              </h5>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li>
                  <Link href="/" className="hover:text-[#ffc700] transition">
                    Agent Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="/custom-agents" className="hover:text-[#ffc700] transition">
                    Custom Business Agents
                  </Link>
                </li>
                <li>
                  <Link href="/custom-agents/onboarding" className="hover:text-[#ffc700] transition">
                    Request Custom Agents
                  </Link>
                </li>
                <li>
                  <Link href="/studio" className="hover:text-[#ffc700] transition">
                    Agent Studio
                  </Link>
                </li>
                <li>
                  <Link href="/workspace" className="hover:text-[#ffc700] transition">
                    Team Workspace
                  </Link>
                </li>
                <li>
                  <Link href="/employees" className="hover:text-[#ffc700] transition">
                    Hired AI Workforce
                  </Link>
                </li>
                <li>
                  <Link href="/trial" className="hover:text-[#ffc700] transition">
                    Enterprise Trial
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Enterprise & Governance */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Enterprise & Control
              </h5>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li>
                  <Link href="/governance" className="hover:text-[#ffc700] transition">
                    Governance & Guardrails
                  </Link>
                </li>
                <li>
                  <Link href="/governance/info" className="hover:text-[#ffc700] transition">
                    Governance Framework
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-[#ffc700] transition">
                    Developer Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-[#ffc700] font-semibold hover:underline">
                    Pricing & Plans
                  </Link>
                </li>
                <li>
                  <Link href="/billing" className="hover:text-[#ffc700] transition">
                    Billing & Invoicing
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-[#ffc700] transition">
                    Account & API Keys
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Legal */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Contact & Legal
              </h5>
              <div className="space-y-3 text-xs text-neutral-400">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">General Support</span>
                  <a href="mailto:support@pixorva.org" className="text-white hover:text-[#ffc700] transition">
                    support@pixorva.org
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Privacy & Data Office</span>
                  <a href="mailto:privacy@pixorva.com" className="text-white hover:text-[#ffc700] transition">
                    privacy@pixorva.com
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Grievance Redressal</span>
                  <a href="mailto:grievance@pixorva.com" className="text-white hover:text-[#ffc700] transition">
                    grievance@pixorva.com
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Legal Department</span>
                  <a href="mailto:legal@pixorva.com" className="text-white hover:text-[#ffc700] transition">
                    legal@pixorva.com
                  </a>
                </div>
                <div className="pt-2 flex flex-col gap-1.5 font-bold uppercase text-[11px] border-t border-white/5">
                  <Link href="/privacy" className="text-neutral-300 hover:text-[#ffc700] transition">
                    Privacy Policy →
                  </Link>
                  <Link href="/terms" className="text-neutral-300 hover:text-[#ffc700] transition">
                    Terms & Conditions →
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Sub-Footer Bar */}
          <div className="pt-8 text-center sm:text-left text-xs text-neutral-500 font-mono">
            © 2026 PIXORVA INC. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

    </div>
  );
}