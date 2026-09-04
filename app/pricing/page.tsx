"use client";

import React, { useState } from "react";
import { Oswald, Inter } from "next/font/google";
import { 
  Check, X, Zap, Crown, Shield, Rocket, Mail, 
  Users, ArrowRight, DollarSign, ChevronDown, ChevronUp,
  Cpu, Lock, Sparkles, Building2, Layers, Award, Clock,
  Briefcase, CheckCircle2, TrendingUp, HelpCircle, Star
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client";
import { showToast } from "../utils/Toast";
import { triggerRazorpayCheckout } from "../utils/RazorpayCheckout";
import AgentAvatar from "../components/AgentAvatar";
import { EMPLOYEES } from "../employees/page";

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"] });

const FAQ_ITEMS = [
  {
    q: "How does the 3-Day Free Trial work?",
    a: "You get full, unrestricted access to any 1 specialized AI employee of your choice for 72 hours. You can run unlimited tasks, test outputs, and inspect live workstations with zero upfront payment."
  },
  {
    q: "Can I swap my 4 active AI employees on the Growth Pro plan?",
    a: "Yes! On the Growth Pro plan, you have 4 active employee slots. As your company's weekly priorities evolve—such as switching from a Developer to a Video Scripter or SEO Writer—you can rotate your active staff directly from your team workspace."
  },
  {
    q: "Can I hire single AI employees individually without a subscription?",
    a: "Yes! If you only need one or two specialists, you can hire any individual AI employee directly from the Marketplace starting from ₹499/mo to ₹1,999/mo on their standalone rate."
  },
  {
    q: "What does the Enterprise plan include?",
    a: "The Enterprise plan unlocks all 15 specialized AI employees simultaneously with unlimited parallel execution threads, dedicated VPC connectors, priority support SLAs, custom tool connectors, and full AI Governance Lab compliance."
  },
  {
    q: "How is our proprietary company data protected?",
    a: "All agent tasks run in isolated, stateless execution sandboxes encrypted with AES-256 in transit and at rest. We maintain a zero-retention policy—your company IP and prompts are never used to train external foundational models."
  },
  {
    q: "Can I cancel or change my plan anytime?",
    a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time with a single click from your Billing Portal. There are no contracts, cancellation penalties, or hidden lock-in fees."
  },
  {
    q: "What payment methods are supported?",
    a: "We process payments securely via Razorpay, supporting all major credit and debit cards (Visa, Mastercard, RuPay, Amex), UPI (Google Pay, PhonePe, Paytm), Netbanking across 50+ banks, and corporate invoicing."
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [agreeCheckout, setAgreeCheckout] = useState(false);
  const [teamSize, setTeamSize] = useState<number>(4);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic Savings Calculation
  const humanSalary = teamSize * 55000;
  const pixorvaPlanCost = teamSize <= 1 ? 999 : teamSize <= 4 ? 4999 : 19999;
  const monthlySavings = humanSalary - pixorvaPlanCost;
  const annualSavings = monthlySavings * 12;
  const savingsPercent = Math.round((monthlySavings / humanSalary) * 100);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

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
    <div className={`min-h-screen bg-white text-black ${inter.className} flex flex-col selection:bg-[#ffc700] selection:text-black`}>
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b-4 border-black sticky top-0 bg-white/95 backdrop-blur-sm z-50">
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
        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
          <Link href="/employees" className="hover:text-yellow-600 transition">Marketplace</Link>
          <Link href="/custom-agents" className="hover:text-yellow-600 transition">Custom Agents</Link>
          <Link href="/workspace" className="hover:text-yellow-600 transition">Workspace</Link>
          <Link href="/governance" className="hover:text-yellow-600 transition">Governance</Link>
          <Link href="/docs" className="hover:text-yellow-600 transition">Docs</Link>
        </div>
        <Link href="/trial">
            <button className="bg-yellow-400 text-black border-2 border-black px-4 py-2 rounded font-bold uppercase hover:bg-black hover:text-white transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none text-xs">
                Start Free Trial
            </button>
        </Link>
      </nav>

      {/* HERO */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-black text-[#ffc700] border-2 border-black px-4 py-1 rounded-full text-xs font-black uppercase mb-6 transform -rotate-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)]">
          <Sparkles size={14} className="animate-spin text-[#ffc700]" />
          <span>Transparent Pricing // Zero Payroll Overhead</span>
        </div>
        <h1 className={`text-5xl md:text-8xl uppercase leading-[0.9] mb-6 ${oswald.className}`}>
          Hire an Entire Team <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600">
             For the Price of Lunch.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed font-medium">
          Why pay ₹50,000/mo for one intern when you can deploy <strong>15 specialized Senior AI Employees</strong> on-demand for a fraction of the cost? 24/7 availability, instant outputs, and zero sick days.
        </p>

        {/* Quick Highlights Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase text-gray-600">
          <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300">
            <Check size={14} className="text-green-600" /> 15 AI Employees Included
          </span>
          <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300">
            <Check size={14} className="text-green-600" /> Cancel Anytime with 1 Click
          </span>
          <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300">
            <Check size={14} className="text-green-600" /> 3-Day Risk-Free Trial
          </span>
          <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300">
            <Check size={14} className="text-green-600" /> Zero Equity or Benefits
          </span>
        </div>
      </div>

      {/* THE COMPARISON (US VS THEM) */}
      <div className="max-w-6xl mx-auto px-6 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              
              {/* FREELANCER */}
              <div className="bg-gray-50 p-8 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col items-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-200 px-2 py-0.5 rounded mb-3">Individual Contractor</span>
                  <h3 className={`text-2xl uppercase mb-2 ${oswald.className}`}>Freelancer</h3>
                  <div className="text-4xl font-black mb-2 text-gray-500">₹30,000<span className="text-sm">/mo</span></div>
                  <p className="text-xs text-gray-500 mb-6 font-medium">Single skillset with high variance</p>
                  <ul className="space-y-4 text-sm font-bold text-gray-500 text-left w-full">
                      <li className="flex items-center gap-2"><X size={16} className="text-red-500 shrink-0"/> Availability: 9-5 only (Slow)</li>
                      <li className="flex items-center gap-2"><X size={16} className="text-red-500 shrink-0"/> Speed: 3-5 days per turnaround</li>
                      <li className="flex items-center gap-2"><X size={16} className="text-red-500 shrink-0"/> Skills: 1 Narrow Specialization</li>
                      <li className="flex items-center gap-2"><X size={16} className="text-red-500 shrink-0"/> Risk: Frequent ghosting & delays</li>
                  </ul>
              </div>

              {/* AGENCY */}
              <div className="bg-gray-50 p-8 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col items-center text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-200 px-2 py-0.5 rounded mb-3">Retainer Service</span>
                  <h3 className={`text-2xl uppercase mb-2 ${oswald.className}`}>Traditional Agency</h3>
                  <div className="text-4xl font-black mb-2 text-gray-500">₹1,50,000<span className="text-sm">/mo</span></div>
                  <p className="text-xs text-gray-500 mb-6 font-medium">High overhead and endless meetings</p>
                  <ul className="space-y-4 text-sm font-bold text-gray-500 text-left w-full">
                      <li className="flex items-center gap-2"><Check size={16} className="text-blue-500 shrink-0"/> Availability: Weekdays only</li>
                      <li className="flex items-center gap-2"><X size={16} className="text-red-500 shrink-0"/> Speed: Weeks for revisions</li>
                      <li className="flex items-center gap-2"><Check size={16} className="text-blue-500 shrink-0"/> Skills: Multi-department</li>
                      <li className="flex items-center gap-2"><X size={16} className="text-red-500 shrink-0"/> Meetings: 4-6 status calls/week</li>
                  </ul>
              </div>

              {/* PIXORVA (HERO) */}
              <div className="bg-yellow-300 p-8 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-black px-3 py-1 uppercase rounded-bl-xl border-l-2 border-b-2 border-black">
                    Best Value
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black bg-black/10 px-2.5 py-0.5 rounded mb-3">
                    Autonomous Workforce
                  </span>
                  <h3 className={`text-3xl uppercase mb-2 ${oswald.className}`}>Pixorva AI</h3>
                  <div className="text-5xl font-black mb-2">₹4,999<span className="text-xl font-bold">/mo</span></div>
                  <p className="text-xs text-black/80 mb-6 font-bold">Full team access for less than 1 dinner</p>
                  <ul className="space-y-4 text-sm font-black text-black text-left w-full">
                      <li className="flex items-center gap-2"><Zap size={18} fill="black" className="shrink-0"/> Availability: 24/7/365 Non-stop</li>
                      <li className="flex items-center gap-2"><Zap size={18} fill="black" className="shrink-0"/> Speed: Instant sub-second outputs</li>
                      <li className="flex items-center gap-2"><Zap size={18} fill="black" className="shrink-0"/> Skills: 15 Role-Specialized AI Pros</li>
                      <li className="flex items-center gap-2"><Zap size={18} fill="black" className="shrink-0"/> Overhead: Zero contracts, zero equity</li>
                  </ul>
                  <button 
                    onClick={() => handleSubscribe('growth_pro', 4999)}
                    className="mt-8 w-full bg-black text-white py-3.5 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-white hover:text-black border-2 border-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5"
                  >
                      Get Growth Pro Plan
                  </button>
              </div>

          </div>
      </div>

      {/* PRICING TIERS */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="text-center mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-neutral-400 block mb-2">Transparent Subscriptions</span>
            <h2 className={`text-4xl md:text-5xl text-center uppercase tracking-tight ${oswald.className}`}>Choose Your Plan</h2>
          </div>
          
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              
              {/* STARTER */}
              <div className="border-4 border-black rounded-3xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-1 bg-white flex flex-col justify-between">
                  <div>
                      <div className="bg-gray-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Shield size={24} className="text-black"/>
                      </div>
                      <h3 className={`text-3xl uppercase ${oswald.className}`}>Free Trial</h3>
                      <p className="text-gray-500 text-xs font-bold mb-6">Test 1 AI Employee completely risk-free.</p>
                      <div className="text-4xl font-black mb-6">₹0 <span className="text-sm font-medium text-gray-500">/ 3 Days</span></div>
                      <ul className="space-y-3 text-sm font-medium mb-8 text-gray-700">
                          <li className="flex gap-2 items-center"><Check size={16} className="text-black"/> Access to any 1 Agent of choice</li>
                          <li className="flex gap-2 items-center"><Check size={16} className="text-black"/> Full live workstation chat & runs</li>
                          <li className="flex gap-2 items-center"><Check size={16} className="text-black"/> Document vault & history</li>
                          <li className="flex gap-2 items-center"><Check size={16} className="text-black"/> 1 Free Trial per account</li>
                      </ul>
                  </div>
                  <Link href="/trial">
                    <button className="w-full border-2 border-black py-3.5 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-black hover:text-white transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5">
                      Start 3-Day Free Trial
                    </button>
                  </Link>
              </div>

              {/* PRO (HIGHLIGHTED) */}
              <div className="border-4 border-black rounded-3xl p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-black text-white relative transform md:-translate-y-4 flex flex-col justify-between">
                  <div>
                      <div className="absolute top-0 right-0 bg-[#ffc700] text-black text-xs font-black px-4 py-1.5 uppercase rounded-bl-2xl border-l-2 border-b-2 border-black shadow-sm">
                        Most Popular
                      </div>
                      <div className="bg-[#ffc700] text-black w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                        <Rocket size={24}/>
                      </div>
                      <h3 className={`text-3xl uppercase text-white ${oswald.className}`}>Growth Pro</h3>
                      <p className="text-neutral-400 text-xs font-bold mb-6">Designed for startups, founders & lean teams.</p>
                      <div className="text-5xl font-black mb-6 text-[#ffc700]">₹4,999 <span className="text-sm font-medium text-neutral-400">/ mo</span></div>
                      <ul className="space-y-3.5 text-sm font-medium mb-8 text-neutral-200">
                          <li className="flex gap-2.5 items-center"><Check size={16} className="text-[#ffc700] shrink-0"/> Full access to <strong>any 4 AI Agents</strong></li>
                          <li className="flex gap-2.5 items-center"><Check size={16} className="text-[#ffc700] shrink-0"/> <strong>Swap active agents</strong> anytime as needs change</li>
                          <li className="flex gap-2.5 items-center"><Check size={16} className="text-[#ffc700] shrink-0"/> Unlimited tasks & workflows</li>
                          <li className="flex gap-2.5 items-center"><Check size={16} className="text-[#ffc700] shrink-0"/> 2x Priority execution speed</li>
                          <li className="flex gap-2.5 items-center"><Check size={16} className="text-[#ffc700] shrink-0"/> Persistent vector workstation memory</li>
                          <li className="flex gap-2.5 items-center"><Check size={16} className="text-[#ffc700] shrink-0"/> Full document vault support</li>
                      </ul>
                  </div>
                  <button 
                    onClick={() => handleSubscribe('growth_pro', 4999)}
                    className="w-full bg-[#ffc700] text-black border-2 border-black py-4 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-white transition shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-0.5"
                  >
                      Get Growth Pro Plan
                  </button>
              </div>

              {/* ENTERPRISE */}
              <div className="border-4 border-black rounded-3xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-1 bg-white flex flex-col justify-between">
                  <div>
                      <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Crown size={24} className="text-blue-700"/>
                      </div>
                      <h3 className={`text-3xl uppercase ${oswald.className}`}>Enterprise</h3>
                      <p className="text-gray-500 text-xs font-bold mb-6">For scaling enterprises & high-volume swarms.</p>
                      <div className="text-4xl font-black mb-6">₹19,999 <span className="text-sm font-medium text-gray-500">/ mo</span></div>
                      <ul className="space-y-3.5 text-sm font-medium mb-8 text-gray-700">
                          <li className="flex gap-2.5 items-center"><Check size={16} className="text-blue-600 shrink-0"/> Deploy <strong>ALL 15 Specialized AI Employees</strong></li>
                          <li className="flex gap-2.5 items-center"><Check size={16} className="text-blue-600 shrink-0"/> Unlimited tasks & parallel executions</li>
                          <li className="flex gap-2.5 items-center"><Check size={16} className="text-blue-600 shrink-0"/> Priority instant execution lane</li>
                          <li className="flex gap-2.5 items-center"><Check size={16} className="text-blue-600 shrink-0"/> Full AI Governance Lab compliance tower</li>
                          <li className="flex gap-2.5 items-center"><Check size={16} className="text-blue-600 shrink-0"/> Custom Webhook & API Key connectors</li>
                          <li className="flex gap-2.5 items-center"><Check size={16} className="text-blue-600 shrink-0"/> Dedicated account manager & SLA</li>
                      </ul>
                  </div>
                  <button 
                    onClick={() => handleSubscribe('enterprise', 19999)}
                    className="w-full border-2 border-black py-3.5 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-black hover:text-white transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5"
                  >
                      Get Enterprise Plan
                  </button>
              </div>

          </div>
      </div>

      {/* ROI & COST SAVINGS CALCULATOR */}
      <div className="bg-gray-50 border-y-4 border-black py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-neutral-500 bg-yellow-200 border border-black px-3 py-1 rounded-full mb-3 inline-block">
              Interactive ROI Breakdown
            </span>
            <h2 className={`text-4xl md:text-6xl uppercase ${oswald.className}`}>The Math Behind Pixorva</h2>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto mt-3 font-medium">
              See how much your business saves annually by shifting repetitive operations to autonomous AI workers.
            </p>
          </div>

          <div className="bg-white border-4 border-black rounded-3xl p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Slider Input Side */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-black uppercase tracking-wider text-gray-700">
                      Team Roles Needed
                    </label>
                    <span className="text-2xl font-black bg-black text-[#ffc700] px-4 py-1 rounded-xl border border-black">
                      {teamSize} {teamSize === 1 ? 'Role' : 'Roles'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={teamSize}
                    onChange={(e) => setTeamSize(parseInt(e.target.value, 10))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black border border-black"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-2">
                    <span>1 Specialist</span>
                    <span>4 (Growth Pro)</span>
                    <span>10 Multi-Discipline</span>
                    <span>All 15 AI Staff</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs font-bold text-gray-600 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Estimated Human Payroll (₹55k/role/mo):</span>
                    <span className="text-red-600 font-black">₹{humanSalary.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recommended Pixorva Plan:</span>
                    <span className="text-black font-black">
                      {teamSize <= 1 ? 'Single Agent' : teamSize <= 4 ? 'Growth Pro (4 Slots)' : 'Enterprise (All 15)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pixorva Monthly Cost:</span>
                    <span className="text-green-700 font-black">₹{pixorvaPlanCost.toLocaleString('en-IN')}/mo</span>
                  </div>
                </div>
              </div>

              {/* Big Savings Result Card */}
              <div className="lg:col-span-6 bg-black text-white p-8 rounded-2xl border-2 border-black flex flex-col justify-between text-center relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 bg-[#ffc700] text-black text-[10px] font-black px-3 py-1 uppercase rounded-bl-xl">
                  {savingsPercent}% Cost Reduction
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
                    Estimated Annual Savings
                  </span>
                  <div className={`text-4xl md:text-6xl font-black text-[#ffc700] mb-2 tracking-tight ${oswald.className}`}>
                    ₹{annualSavings.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-neutral-300 max-w-sm mx-auto mb-6">
                    You save <strong>₹{monthlySavings.toLocaleString('en-IN')}</strong> every single month while eliminating recruiting overhead, training delays, and payroll taxes.
                  </p>
                </div>
                <button
                  onClick={() => handleSubscribe(teamSize <= 4 ? 'growth_pro' : 'enterprise', teamSize <= 4 ? 4999 : 19999)}
                  className="w-full bg-[#ffc700] text-black py-3.5 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-white transition border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]"
                >
                  Deploy Your {teamSize}-Agent Team Now
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ALL 15 SPECIALIZED AI EMPLOYEES SHOWCASE */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="inline-block bg-yellow-400 text-black border-2 border-black px-4 py-1 rounded-full text-xs font-black uppercase mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Active Roster // 15 Pros Available
          </div>
          <h2 className={`text-4xl md:text-6xl uppercase ${oswald.className}`}>Meet Your 15 AI Employees</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-3 font-medium text-sm md:text-base">
            Every subscription gives you instant access to these 15 battle-tested AI professionals across Engineering, Marketing, Operations, Legal, and Support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {EMPLOYEES.map((emp) => (
            <div 
              key={emp.id} 
              className="bg-white border-2 border-black rounded-2xl p-5 flex flex-col justify-between hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <AgentAvatar id={emp.id} className="w-12 h-12 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                  <span className="text-[10px] font-black uppercase bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                    {emp.category}
                  </span>
                </div>
                <h4 className={`text-xl font-black uppercase ${oswald.className} leading-tight`}>{emp.name}</h4>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{emp.role}</div>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">{emp.desc}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-black text-black">{emp.price}</span>
                <Link 
                  href={`/agent-detail/${emp.name.toLowerCase()}`}
                  className="text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-black transition flex items-center gap-1 group-hover:translate-x-0.5"
                >
                  Profile →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/employees">
            <button className="bg-black text-white border-2 border-black px-6 py-3 rounded-xl text-xs font-bold uppercase hover:bg-yellow-400 hover:text-black transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5">
              Explore Full Marketplace Directory ({EMPLOYEES.length} AI Employees)
            </button>
          </Link>
        </div>
      </div>

      {/* DETAILED PLAN COMPARISON MATRIX */}
      <div className="bg-gray-50 border-y-4 border-black py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-neutral-400 block mb-2">Deep Feature Breakdown</span>
            <h2 className={`text-4xl md:text-5xl uppercase ${oswald.className}`}>Plan Feature Matrix</h2>
          </div>

          <div className="border-4 border-black rounded-3xl bg-white overflow-x-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b-4 border-black bg-gray-100">
                  <th className="p-4 font-black uppercase text-sm">Features & Capabilities</th>
                  <th className="p-4 font-black uppercase text-sm text-center">Starter (Trial)</th>
                  <th className="p-4 font-black uppercase text-sm text-center bg-yellow-200">Growth Pro</th>
                  <th className="p-4 font-black uppercase text-sm text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200 font-semibold text-gray-700">
                <tr>
                  <td className="p-4 font-bold text-black">Active Agent Slots</td>
                  <td className="p-4 text-center">1 Choice Agent</td>
                  <td className="p-4 text-center bg-yellow-50 font-black text-black">Any 4 Agents (Swappable)</td>
                  <td className="p-4 text-center font-black text-blue-800">All 15 AI Employees</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-black">Monthly Execution Limit</td>
                  <td className="p-4 text-center">Trial Capped</td>
                  <td className="p-4 text-center bg-yellow-50 font-black text-black">Unlimited Tasks</td>
                  <td className="p-4 text-center font-black text-blue-800">Unlimited Parallel</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-black">Execution Speed Lane</td>
                  <td className="p-4 text-center">Standard</td>
                  <td className="p-4 text-center bg-yellow-50 font-black text-black">2x Priority Speed</td>
                  <td className="p-4 text-center font-black text-blue-800">Dedicated Ultra-Fast Lane</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-black">Document Vault & Vector Memory</td>
                  <td className="p-4 text-center">72-Hour Session</td>
                  <td className="p-4 text-center bg-yellow-50 font-black text-black">Persistent Workspace Vault</td>
                  <td className="p-4 text-center font-black text-blue-800">Dedicated Multi-VPC Vault</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-black">Swappable Role Slots</td>
                  <td className="p-4 text-center text-gray-400">—</td>
                  <td className="p-4 text-center bg-yellow-50 text-green-700 font-black">✓ Rotate Anytime</td>
                  <td className="p-4 text-center text-green-700 font-black">✓ All Always Unlocked</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-black">AI Governance Lab & Guardrails</td>
                  <td className="p-4 text-center text-gray-400">—</td>
                  <td className="p-4 text-center bg-yellow-50">Standard LLM Audit</td>
                  <td className="p-4 text-center font-black text-blue-800">Full Universal Proxy Suite</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-black">Custom Webhooks & Tool Connectors</td>
                  <td className="p-4 text-center text-gray-400">—</td>
                  <td className="p-4 text-center bg-yellow-50">Standard Triggers</td>
                  <td className="p-4 text-center font-black text-blue-800">Custom API & Integrations</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-black">Support & SLA</td>
                  <td className="p-4 text-center">Community</td>
                  <td className="p-4 text-center bg-yellow-50 font-black text-black">Priority Email Support</td>
                  <td className="p-4 text-center font-black text-blue-800">Dedicated Slack + 99.9% SLA</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase mb-3">
            <HelpCircle size={14} className="text-[#ffc700]" />
            <span>Got Questions?</span>
          </div>
          <h2 className={`text-4xl md:text-5xl uppercase ${oswald.className}`}>Frequently Asked Questions</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Everything you need to know about our subscriptions and AI workforce.</p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="border-2 border-black rounded-2xl bg-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-black uppercase text-sm tracking-wide hover:bg-yellow-50 transition"
                >
                  <span className="pr-4">{item.q}</span>
                  {isOpen ? <ChevronUp size={18} className="shrink-0" /> : <ChevronDown size={18} className="shrink-0 text-gray-500" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-gray-600 leading-relaxed border-t border-gray-100 font-medium">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CUSTOM AGENTS BANNER */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-black text-white border-4 border-black rounded-3xl p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(255,199,0,1)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-left">
            <span className="text-xs font-black uppercase tracking-widest text-[#ffc700] bg-[#ffc700]/10 px-3 py-1 rounded border border-[#ffc700]/30 inline-block">
              Custom Enterprise Swarms
            </span>
            <h3 className={`text-3xl md:text-4xl uppercase text-white ${oswald.className}`}>
              Need Bespoke AI Agents Trained on Your Data?
            </h3>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-medium">
              We design custom autonomous agents with proprietary company vector memory, private AWS/GCP VPC peering, and enterprise ERP integrations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <Link href="/custom-agents" className="w-full sm:w-auto">
              <button className="w-full bg-[#ffc700] text-black px-6 py-4 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-yellow-400 transition shadow-md">
                View Custom Solutions
              </button>
            </Link>
            <Link href="/custom-agents/onboarding" className="w-full sm:w-auto">
              <button className="w-full bg-white/10 text-white border border-white/20 px-6 py-4 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-white/20 transition">
                Request Specification
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* FINAL CALL TO ACTION */}
      <div className="bg-yellow-400 border-t-4 border-black py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className={`text-4xl md:text-7xl uppercase mb-6 leading-tight ${oswald.className}`}>
            Stop Burning Cash on Payroll.
          </h2>
          <p className="text-base md:text-xl font-bold max-w-xl mx-auto mb-8 text-black/80">
            Activate your 3-day trial and experience what autonomous AI employees can do for your business today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/trial">
              <button className="bg-black text-white hover:bg-white hover:text-black border-4 border-black px-8 py-4 rounded-xl font-black uppercase text-sm tracking-wider transition shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-y-1">
                Start 3-Day Free Trial
              </button>
            </Link>
            <Link href="/employees">
              <button className="bg-white text-black hover:bg-black hover:text-white border-4 border-black px-8 py-4 rounded-xl font-black uppercase text-sm tracking-wider transition shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-none hover:translate-y-1">
                Browse 15 AI Employees
              </button>
            </Link>
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