'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Oswald, Inter } from 'next/font/google';
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  CreditCard, 
  Cpu, 
  MessageSquare, 
  Send, 
  CornerDownRight, 
  Clock, 
  CheckCircle,
  FileText, 
  ExternalLink 
} from 'lucide-react';
import { EMPLOYEES } from '../../employees/page';
import { createClient } from '../../utils/supabase/client';
import { triggerRazorpayCheckout } from '../../utils/RazorpayCheckout';
import { showToast } from '../../utils/Toast';

const oswald = Oswald({ subsets: ['latin'], weight: ['400', '700'] });
const inter = Inter({ subsets: ['latin'] });

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [agreeHire, setAgreeHire] = useState(false);

  const employee = EMPLOYEES.find(e => e.id === id);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    };
    checkUser();
  }, []);

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black uppercase mb-4">Agent Not Found</h2>
        <Link href="/employees" className="bg-black text-white px-6 py-3 rounded-xl font-bold uppercase hover:bg-yellow-400 hover:text-black transition">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const handleHireNow = async () => {
    if (!user) {
      showToast("Please log in to hire an AI employee.", "error");
      router.push("/login");
      return;
    }

    if (!agreeHire) {
      showToast("Please agree to the Terms of Service & Privacy Policy to continue.", "error");
      return;
    }

    setLoading(true);
    try {
      const amountVal = parseInt(employee.price.replace(/[^\d]/g, ""), 10) * 100;
      
      await triggerRazorpayCheckout({
        userId: user.id,
        agentName: `${employee.name} (${employee.role})`,
        icon: employee.icon,
        steps: employee.steps,
        amount: amountVal,
        email: user.email || '',
        isSubscription: true,
        onSuccess: () => {
          showToast(`${employee.name} hired successfully!`, "success");
          router.push("/workspace");
        },
        onFailure: () => {
          setLoading(false);
        }
      });
    } catch (e: any) {
      showToast("Failed to initiate checkout: " + e.message, "error");
      setLoading(false);
    }
  };

  // Helper dynamic content generator based on agent type
  const getDynamicContent = () => {
    switch (employee.category) {
      case 'Engineering':
        return {
          tagline: `I compile code, structure database endpoints, write test scripts, and audit vulnerabilities so your engineering builds are bulletproof.`,
          metrics: { val1: "120,000+", label1: "COMMITS LOGGED", val2: "4.8s", label2: "BUILD TIME GUARANTEED", val3: "99.9%", label3: "SECURITY COMPLIANCE" },
          painPoints: [
            "We spend hours fixing small syntax issues and hooks",
            "Designing database tables is slowing our progress",
            "We skip writing unit tests and bugs hit production"
          ],
          mockupTitle: "Code Workspace Sandbox",
          mockupBadge: "Active Compile",
          mockupText: `import { createClient } from '@supabase/supabase-js';\n\n// Provisioning AI Agent pipeline\nexport async function runSecurityAudit(id) {\n  const res = await db.from('tasks').select('*');\n  return res.filter(t => !t.vulnerable);\n}`
        };
      case 'Marketing':
        return {
          tagline: `I draft viral LinkedIn hooks, formulate Twitter launch threads, design ad conversions copy, and script short Reels to grow your organic traffic.`,
          metrics: { val1: "2.4M", label1: "IMPRESSIONS ENGAGED", val2: "15 mins", label2: "DRAFT OUTLINES", val3: "4.8x", label3: "TRAFFIC CTR INCREASE" },
          painPoints: [
            "I spend 3 hours writing social descriptions every day",
            "Organic brand growth feels like a full-time task",
            "Drafting YouTube scripts from scratch is exhausting"
          ],
          mockupTitle: "Marcus Campaign Writer",
          mockupBadge: "Prepared Draft",
          mockupText: `Campaign Topic: Pixorva Launch\n\n[Tweet 1] Stop burning payroll cash. 💸\nHire Devon to write your React components instantly.\n\n[Action CTA] Browse AI marketplace at pixorva.com/employees`
        };
      case 'Sales':
        return {
          tagline: `I enrich business domains, compile clean prospect lead sheets, and design cold email outreach sequences to get calls booked on autopilot.`,
          metrics: { val1: "50,000", label1: "EMAILS OUTBOUNDED", val2: "3.4h", label2: "SAVED PER SDR TASK", val3: "18%", label3: "CONVERSION CTR INDEX" },
          painPoints: [
            "Sifting through lead files manually takes forever",
            "We struggle to customize pitches for every domain",
            "Follow-ups get lost and potential deals vanish"
          ],
          mockupTitle: "Sales Outreach Console",
          mockupBadge: "Sequence Set",
          mockupText: `To: founder@startup.co\nSubject: Automating your component testing\n\nHi,\nI noticed you are building on Next.js.\nOur QA agent Quinn writes Jest specs instantly.\nAre you open to a call tomorrow?`
        };
      default:
        return {
          tagline: `I review corporate NDAs, summarize costing ledgers, structure onboarding rules, and write user roadmap spec sheets.`,
          metrics: { val1: "15,000", label1: "PAGES DRAFTED", val2: "2H", label2: "SAVED DAILY, GUARANTEED", val3: "100%", label3: "AGILE SPEC COVERAGE" },
          painPoints: [
            "Creating spec sheets eats up our product timeline",
            "NDA agreements and terms reviews take days to clear",
            "Onboarding checkers and policy lists get messy"
          ],
          mockupTitle: "Operations Manager Tower",
          mockupBadge: "Compliance Clear",
          mockupText: `Pixorva Legal Charter // Mutual NDA\n\nSection 1. Confidentiality parameters and code protections.\nSection 2. Governed under standard commercial parameters.`
        };
    }
  };

  const dynamic = getDynamicContent();

  return (
    <div className={`min-h-screen bg-white text-black ${inter.className} flex flex-col`}>
      
      {/* HEADER */}
      <header className="bg-white border-b-4 border-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/employees" className="bg-black text-white p-2 rounded-lg border-2 border-black hover:bg-yellow-400 hover:text-black transition shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-y-0.5 flex items-center justify-center shrink-0">
            <ArrowLeft size={16} />
          </Link>
          <span className={`text-2xl font-black uppercase tracking-wider ${oswald.className}`}>
            Pixorva Registry
          </span>
        </div>
        <Link href="/employees" className="text-xs font-black uppercase border-2 border-black px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5">
          Marketplace
        </Link>
      </header>

      {/* HERO SECTION - ORANGE NEOBRUTALIST BANNER */}
      <section className="bg-[#FF5A36] border-b-4 border-black px-6 py-12 md:py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_black_1.5px,_transparent_1.5px)] bg-[length:15px_15px]"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Left Text */}
          <div className="text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-black border-2 border-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transform -rotate-1">
              <Sparkles size={12} className="text-yellow-400" />
              Meet {employee.name}
            </div>
            
            <h1 className={`text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tight ${oswald.className}`}>
              YOUR AI <br />
              <span className="text-black bg-yellow-400 px-3 py-1 inline-block border-4 border-black transform rotate-1 mt-2">
                {employee.role}
              </span>
            </h1>

            <p className="text-lg md:text-xl font-medium leading-relaxed max-w-xl text-white/95">
              &ldquo;{dynamic.tagline}&rdquo;
            </p>

            {/* Price Box */}
            <div className="bg-black/25 border-2 border-white p-4 rounded-2xl max-w-sm flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase text-white/70 block">Monthly Rate</span>
                <span className="text-3xl font-black text-yellow-400">{employee.price}</span>
              </div>
              <span className="bg-white text-black text-[9px] font-black uppercase px-2.5 py-1 rounded">24/7 AVAILABILITY</span>
            </div>

            {/* Consent checkbox and HIRE CTA */}
            <div className="space-y-4 pt-4 max-w-md">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={agreeHire}
                  onChange={(e) => setAgreeHire(e.target.checked)}
                  className="mt-1 border-2 border-black rounded text-black bg-white accent-yellow-400"
                />
                <span className="text-[10px] text-white/90 font-bold leading-tight">
                  I agree to Pixorva&apos;s <Link href="/terms" className="underline hover:text-yellow-400">Terms of Service</Link> & <Link href="/privacy" className="underline hover:text-yellow-400">Privacy Policy</Link> to commission this AI employee.
                </span>
              </label>

              <button
                onClick={handleHireNow}
                disabled={loading}
                className="w-full bg-yellow-400 text-black hover:bg-black hover:text-white border-4 border-black text-xs font-black uppercase py-4 rounded-2xl tracking-wider transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing Transaction...' : `⚡ Hire ${employee.name.toUpperCase()} NOW`}
              </button>
            </div>
          </div>

          {/* Right Visual Browser Mockup */}
          <div className="w-full max-w-lg mx-auto bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black">
            {/* Browser Header */}
            <div className="bg-gray-100 border-b-4 border-black px-4 py-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-black"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 border border-black"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 border border-black"></div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                {dynamic.mockupTitle}
              </div>
              <span className="bg-green-100 text-green-800 text-[8px] font-black px-2 py-0.5 rounded uppercase border border-green-300">
                {dynamic.mockupBadge}
              </span>
            </div>
            
            {/* Mockup Editor Content */}
            <div className="p-6 bg-[#1A1A1A] text-green-400 font-mono text-xs min-h-[220px] overflow-x-auto text-left relative">
              <div className="absolute top-2 right-3 text-[9px] text-gray-500 uppercase font-black font-sans">WORKSPACE PREVIEW</div>
              <pre className="whitespace-pre-wrap">{dynamic.mockupText}</pre>
            </div>
          </div>

        </div>
      </section>

      {/* METRICS BAR SECTION */}
      <section className="bg-white border-b-4 border-black py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="border-4 border-black p-6 rounded-2xl bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-1">
            <span className={`text-4xl font-black text-black block ${oswald.className}`}>{dynamic.metrics.val1}</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">{dynamic.metrics.label1}</span>
          </div>

          <div className="border-4 border-black p-6 rounded-2xl bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-1">
            <span className={`text-4xl font-black text-black block ${oswald.className}`}>{dynamic.metrics.val2}</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">{dynamic.metrics.label2}</span>
          </div>

          <div className="border-4 border-black p-6 rounded-2xl bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-1">
            <span className={`text-4xl font-black text-black block ${oswald.className}`}>{dynamic.metrics.val3}</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">{dynamic.metrics.label3}</span>
          </div>

        </div>
      </section>

      {/* DOES IT SOUND FAMILIAR (PAIN POINTS) */}
      <section className="bg-gray-50 border-b-4 border-black py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle,_black_1.5px,_transparent_1.5px)] bg-[length:12px_12px]"></div>
        <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          
          <h2 className={`text-4xl md:text-6xl uppercase font-black leading-none ${oswald.className}`}>
            Does It Sound Familiar?
          </h2>

          <div className="flex flex-col items-center gap-6">
            {dynamic.painPoints.map((pt, idx) => (
              <div 
                key={idx} 
                className="bg-white border-4 border-black px-6 py-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-xl text-left relative transform rotate-[-0.5deg] hover:rotate-0 transition-transform"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl text-red-500 font-bold shrink-0">💬</span>
                  <p className="text-xs md:text-sm font-bold text-gray-800 leading-snug">
                    &ldquo;{pt}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* MEET AGENT BIO */}
      <section className="bg-white border-b-4 border-black py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 rounded-full border-4 border-black bg-yellow-400 mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Cpu size={40} className="text-black" />
          </div>
          
          <h2 className={`text-3xl md:text-5xl uppercase font-black leading-none ${oswald.className}`}>
            Meet {employee.name}.
          </h2>
          <p className="text-base md:text-lg font-bold text-gray-500 uppercase tracking-wide">
            She&apos;ll make your life way easier.
          </p>

          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            {employee.name} is your AI {employee.role}, a tireless teammate who lives inside your workspace channels. 
            She clears the clutter, drafts outputs in your voice, compiles code, and automates pipelines. 
            Think of her as the digital chief of staff you always wished you had: handling the busywork in the background 
            so you can focus on the decisions only you can make. She works around the clock, never drops a thread, and learns 
            the way you work the longer you collaborate together.
          </p>
        </div>
      </section>

      {/* SKILLS & PIPELINE ALTERNATING DETAILS */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          
          {/* Highlight 1: Core Skills */}
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="w-full md:w-1/2 space-y-4">
              <span className="bg-yellow-400 text-black border border-black px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest inline-block">
                SKILL MATRIX
              </span>
              <h3 className={`text-3xl uppercase font-black leading-none ${oswald.className}`}>
                High-Caliber Specialties
              </h3>
              <p className="text-xs text-gray-500 font-bold leading-relaxed">
                We equip our agents with state-of-the-art context mappings so they run correct specifications and parameters.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {employee.skills.map((skill, i) => (
                  <span key={i} className="text-[10px] font-black border border-black px-2.5 py-1 rounded bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Visual Box */}
            <div className="w-full md:w-5/12 bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <h4 className="font-black text-xs uppercase text-black border-b-2 border-black pb-2">Skills Evaluation</h4>
              <ul className="space-y-2">
                {employee.skills.map((s, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-700">
                    <CheckCircle size={14} className="text-green-600 shrink-0" />
                    <span>Proven expert in {s} integrations</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Highlight 2: Alternating pipeline steps */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center justify-between">
            <div className="w-full md:w-1/2 space-y-4">
              <span className="bg-black text-white border border-black px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest inline-block">
                PIPELINE STAGES
              </span>
              <h3 className={`text-3xl uppercase font-black leading-none ${oswald.className}`}>
                Autonomous Execution Loops
              </h3>
              <p className="text-xs text-gray-500 font-bold leading-relaxed">
                Rather than executing simple one-shot prompts, the agent follows a multi-step pipeline ensuring review and verification.
              </p>
            </div>

            {/* Visual Box */}
            <div className="w-full md:w-5/12 bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <h4 className="font-black text-xs uppercase text-black border-b-2 border-black pb-2">Workflow Stages</h4>
              <div className="space-y-3">
                {employee.steps.map((st, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h5 className="font-black text-xs uppercase text-black">{st.name}</h5>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">Executing category routine</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER EXPLORE */}
      <section className="bg-gray-100 border-t-4 border-black py-12 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h3 className={`text-3xl uppercase font-black ${oswald.className}`}>Scale your team today</h3>
          <p className="text-xs text-gray-500 font-bold uppercase">Explore more AI experts in our Marketplace</p>
          <div className="flex justify-center gap-4">
            <Link href="/employees">
              <button className="bg-yellow-400 text-black border-4 border-black px-8 py-3.5 rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5">
                Explore Marketplace
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-4 border-black bg-white py-6 text-center text-xs font-black uppercase">
        Pixorva AI Workforce Registry © 2026.
      </footer>
    </div>
  );
}
