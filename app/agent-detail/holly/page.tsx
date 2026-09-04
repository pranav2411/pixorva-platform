'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Oswald, Inter } from 'next/font/google';
import { 
  ArrowLeft, 
  Check, 
  CreditCard, 
  Cpu, 
  MessageSquare, 
  Send, 
  CornerDownRight, 
  Clock, 
  CheckCircle,
  FileText, 
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import { triggerRazorpayCheckout } from '../../utils/RazorpayCheckout';
import { showToast } from '../../utils/Toast';
import AgentAvatar from '../../components/AgentAvatar';
import BackButton from '../../components/BackButton';

const oswald = Oswald({ subsets: ['latin'], weight: ['400', '700'] });
const inter = Inter({ subsets: ['latin'] });

export default function AgentDetailPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [agreeHire, setAgreeHire] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    };
    checkUser();

    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const employee = {
    id: "ops-1",
    category: "Operations",
    name: "Holly",
    role: "HR Manager",
    price: "₹1,199/mo",
    steps: [{"type":"trigger","name":"Requirement","icon":"Users"},{"type":"action","name":"Draft Doc","icon":"Clipboard"}]
  };

  const teamList = [
    { name: 'Devon', id: 'dev-1', role: 'React Developer', path: '/agent-detail/devon', color: 'bg-orange-500' },
    { name: 'Ruby', id: 'dev-2', role: 'Backend Architect', path: '/agent-detail/ruby', color: 'bg-emerald-500' },
    { name: 'Quinn', id: 'dev-3', role: 'QA Tester', path: '/agent-detail/quinn', color: 'bg-purple-600' },
    { name: 'Cy', id: 'dev-4', role: 'Security Analyst', path: '/agent-detail/cy', color: 'bg-teal-500' },
    { name: 'Marcus', id: 'mkt-1', role: 'Growth Hacker', path: '/agent-detail/marcus', color: 'bg-red-700' },
    { name: 'Stella', id: 'mkt-2', role: 'Social Media Mgr', path: '/agent-detail/stella', color: 'bg-orange-500' },
    { name: 'Gordon', id: 'mkt-3', role: 'SEO Blog Writer', path: '/agent-detail/gordon', color: 'bg-red-600' },
    { name: 'Vic', id: 'mkt-4', role: 'Video Scripter', path: '/agent-detail/vic', color: 'bg-indigo-600' },
    { name: 'Sarah', id: 'sales-1', role: 'SDR / Outreach', path: '/agent-detail/sarah', color: 'bg-pink-500' },
    { name: 'Larry', id: 'sales-2', role: 'Lead Enricher', path: '/agent-detail/larry', color: 'bg-sky-500' },
    { name: 'Holly', id: 'ops-1', role: 'HR Manager', path: '/agent-detail/holly', color: 'bg-fuchsia-500' },
    { name: 'Finn', id: 'ops-2', role: 'Finance Analyst', path: '/agent-detail/finn', color: 'bg-slate-600' },
    { name: 'Lawson', id: 'ops-3', role: 'Legal Assistant', path: '/agent-detail/lawson', color: 'bg-orange-700' },
    { name: 'Pat', id: 'ops-4', role: 'Product Manager', path: '/agent-detail/pat', color: 'bg-lime-500' },
    { name: 'Sam', id: 'sup-1', role: 'Customer Support', path: '/agent-detail/sam', color: 'bg-cyan-500' }
  ];

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
        icon: "Briefcase",
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
    } catch (e) {
      showToast("Failed to initiate checkout: " + (e as any).message, "error");
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-white text-black ${inter.className} flex flex-col`}>
      
      {/* HEADER */}
      <header className="bg-white border-b-4 border-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <BackButton
            fallback="/employees"
            iconSize={16}
            className="bg-black text-white p-2 rounded-lg border-2 border-black hover:bg-yellow-400 hover:text-black transition shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-y-0.5 flex items-center justify-center shrink-0"
          />
          <span className={`text-2xl font-black uppercase tracking-wider ${oswald.className}`}>
            Pixorva Marketplace
          </span>
        </div>
        <Link href="/employees" className="text-xs font-black uppercase border-2 border-black px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5">
          Marketplace
        </Link>
      </header>

      {/* HERO SECTION - Bespoke Background */}
      <section 
        className="border-b-4 border-black px-6 py-12 md:py-20 relative overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: "#E11D48", color: "#FFFFFF" }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_black_1.5px,_transparent_1.5px)] bg-[length:15px_15px]"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left Text */}
          <div className="text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-black border-2 border-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transform -rotate-1 text-white">
              Meet Holly
            </div>

            <h1 className={`text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tight ${oswald.className}`} style={{ color: "#FFFFFF" }}>
              YOUR AI <br />
              <span className="text-black bg-yellow-400 px-3 py-1 inline-block border-4 border-black transform rotate-1 mt-2">
                HR Manager
              </span>
            </h1>

            <p className="text-lg md:text-xl font-medium leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.95)" }}>
              &ldquo;I build HR policy guidelines, design team onboarding guides, and coordinate benefits systems.&rdquo;
            </p>

            {/* Price Box */}
            <div className="bg-black/25 border-2 border-white p-4 rounded-2xl max-w-sm flex justify-between items-center text-white">
              <div>
                <span className="text-[10px] font-black uppercase text-white/70 block">Monthly Rate</span>
                <span className="text-3xl font-black text-yellow-400">₹1,199/mo</span>
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
                <span className="text-[10px] font-bold leading-tight" style={{ color: "rgba(255,255,255,0.9)" }}>
                  I agree to Pixorva&apos;s <Link href="/terms" className="underline" style={{ color: "#FBBF24" }}>Terms of Service</Link> & <Link href="/privacy" className="underline" style={{ color: "#FBBF24" }}>Privacy Policy</Link> to commission this AI employee.
                </span>
              </label>

              <button
                onClick={handleHireNow}
                disabled={loading}
                className="w-full bg-yellow-400 text-black hover:bg-black hover:text-white border-4 border-black text-xs font-black uppercase py-4 rounded-2xl tracking-wider transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing Transaction...' : '⚡ Hire HOLLY NOW'}
              </button>
            </div>
          </div>

          {/* Dedicated Right Hand Side Mockup */}
          <div className="w-full max-w-lg mx-auto bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black text-left font-sans">
            <div className="bg-rose-50 border-b-4 border-black px-4 py-3 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                TEAM ONBOARDING CHECKS
              </span>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="border-2 border-black p-3 rounded-xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded border border-black bg-yellow-400 flex items-center justify-center text-[10px] font-black">✓</span>
                  <div>
                    <h5 className="text-[10px] font-black uppercase">Send Slack Invite</h5>
                    <p className="text-[8px] text-gray-500 font-bold">Completed Invite</p>
                  </div>
                </div>
              </div>
              <div className="border-2 border-black p-3 rounded-xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded border border-black bg-yellow-400 flex items-center justify-center text-[10px] font-black">✓</span>
                  <div>
                    <h5 className="text-[10px] font-black uppercase">Draft Handbook</h5>
                    <p className="text-[8px] text-gray-500 font-bold">Policy rules outlined</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* METRICS BAR SECTION */}
      <section className="bg-white border-b-4 border-black py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-4 border-black p-6 rounded-2xl bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-1">
            <span className={`text-4xl font-black text-black block ${oswald.className}`}>50+</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">STAFF ONBOARDED</span>
          </div>
          <div className="border-4 border-black p-6 rounded-2xl bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-1">
            <span className={`text-4xl font-black text-black block ${oswald.className}`}>20h</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">SETUP TIME SAVED</span>
          </div>
          <div className="border-4 border-black p-6 rounded-2xl bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-1">
            <span className={`text-4xl font-black text-black block ${oswald.className}`}>100%</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">HR POLICY AUDITED</span>
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
            {["Onboarding new hires is manual, disorganized, and slow.","Drafting handbook policies takes hours.","Keeping employee records and benefits files is chaotic."].map((pt, idx) => (
              <div 
                key={idx} 
                className="bg-white border-4 border-black px-6 py-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-xl text-left relative transform rotate-[-0.5deg] hover:rotate-0 transition-transform w-full"
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
      <section className="relative overflow-hidden bg-black text-white border-b-4 border-black py-20 px-6">
        {/* AGENT VIDEO BACKGROUND */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <video
            src="/GIF/Holly.mp4"
            poster="/GIF/Holly.png"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-45 scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/85" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="flex justify-center mb-4">
            <div className="p-1 rounded-full border-2 border-[#ffc700] bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AgentAvatar id={employee.id} className="w-24 h-24 rounded-full" />
            </div>
          </div>
          <h2 className={`text-3xl md:text-5xl uppercase font-black leading-none text-white ${oswald.className}`}>
            Meet Holly.
          </h2>
          <p className="text-base md:text-lg font-bold text-[#ffc700] uppercase tracking-wide">
            She&apos;ll make your life way easier.
          </p>
          <p className="text-sm md:text-base text-neutral-200 max-w-2xl mx-auto leading-relaxed font-medium">
            Holly is your AI HR Manager, a tireless teammate who lives inside your workspace channels.
            She clears the clutter, drafts outputs in your voice, compiles code, and automates pipelines.
            Think of her as the digital chief of staff you always wished you had: handling the busywork in the background
            so you can focus on the decisions only you can make. She works around the clock, never drops a thread, and learns
            the way you work the longer you collaborate together.
          </p>
        </div>
      </section>

      {/* FEATURE DETAILS SECTIONS */}
      <section className="bg-gray-50 py-16 px-6 border-b-4 border-black">
        <div className="max-w-5xl mx-auto space-y-20">
          
            <div 
              key={0} 
              className="flex flex-col md:flex-row gap-12 items-center justify-between "
            >
              {/* Text */}
              <div className="w-full md:w-1/2 space-y-4">
                <span className="bg-yellow-400 text-black border-2 border-black px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  FEATURE 01
                </span>
                <h3 className={`text-3xl uppercase font-black leading-none ${oswald.className}`}>
                  TEAM ONBOARDING GUIDES
                </h3>
                <p className="text-xs text-gray-500 font-bold leading-relaxed">
                  Holly drafts step-by-step onboarding sequences to ensure hires get credentials, Slack keys, and handbooks fast.
                </p>
                <ul className="space-y-2 pt-2">
                  
                    <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span>Outlines login checklist schedules</span>
                    </li>
                  
                    <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span>Saves onboarding timeline hours</span>
                    </li>
                  
                    <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span>Coordinates initial team specs</span>
                    </li>
                  
                </ul>
              </div>

              {/* Visual Box Mockup */}
              <div className="w-full md:w-5/12">
                <div className="w-full bg-[#FFF1F2] border-4 border-black p-5 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black text-left">
            <h4 className="font-black text-xs uppercase text-rose-600 border-b-2 border-black pb-2">Onboarding Steps</h4>
            <div className="text-[10px] pt-3 leading-relaxed font-bold">
              ✓ Onboarding tracker initialized for Devs.<br />
              ✓ Sent invitations: Slack, GitHub, Supabase.
            </div>
          </div>
              </div>
            </div>
          
            <div 
              key={1} 
              className="flex flex-col md:flex-row gap-12 items-center justify-between md:flex-row-reverse"
            >
              {/* Text */}
              <div className="w-full md:w-1/2 space-y-4">
                <span className="bg-yellow-400 text-black border-2 border-black px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  FEATURE 02
                </span>
                <h3 className={`text-3xl uppercase font-black leading-none ${oswald.className}`}>
                  HR COMPLIANCE HANDBOOKS
                </h3>
                <p className="text-xs text-gray-500 font-bold leading-relaxed">
                  Holly writes clear guidelines for company regulations, benefit tier systems, and team rules.
                </p>
                <ul className="space-y-2 pt-2">
                  
                    <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span>Writes corporate handbook drafts</span>
                    </li>
                  
                    <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span>Standard code of conduct check</span>
                    </li>
                  
                    <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span>Type-safe HR documents log</span>
                    </li>
                  
                </ul>
              </div>

              {/* Visual Box Mockup */}
              <div className="w-full md:w-5/12">
                <div className="w-full bg-white border-4 border-black p-5 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black text-left">
            <h4 className="font-black text-xs uppercase text-blue-600 border-b-2 border-black pb-2">Policy Verification</h4>
            <div className="text-[10px] font-bold text-gray-500 pt-3 leading-relaxed">
              ✓ Employee handbook drafted (18 pages).<br />
              ✓ Compliance check: verified under local regulations.
            </div>
          </div>
              </div>
            </div>
          
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-16 px-6 border-b-4 border-black text-center">
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className={`text-4xl md:text-5xl uppercase font-black leading-none ${oswald.className}`}>
            How Holly Works
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase max-w-xl mx-auto">
            Up and running in minutes. Holly handles the operational busywork so you can spend your day on what matters.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            <div className="bg-[#dbeafe] border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">1</div>
              <h4 className="font-black text-sm uppercase text-black">Connect Workspace</h4>
              <p className="text-xs text-gray-800 font-medium leading-relaxed">
                Link Holly to your Slack, email, or repository in a couple of clicks. Setup is fully automated.
              </p>
            </div>
            <div className="bg-[#fef08a] border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">2</div>
              <h4 className="font-black text-sm uppercase text-black">Executes Daily Audits</h4>
              <p className="text-xs text-gray-800 font-medium leading-relaxed">
                She scans files, compiles tasks, and writes output drafts in your channels around the clock.
              </p>
            </div>
            <div className="bg-[#bbf7d0] border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">3</div>
              <h4 className="font-black text-sm uppercase text-black">You Stay in Control</h4>
              <p className="text-xs text-gray-800 font-medium leading-relaxed">
                Nothing is deployed or finalized without your approval. Review drafts with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gray-50 py-16 px-6 border-b-4 border-black text-center">
        <div className="max-w-6xl mx-auto space-y-12">
          <h2 className={`text-3.5xl md:text-5xl uppercase font-black leading-none ${oswald.className}`}>
            Holly is trusted by HR departments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            
              <div key={0} className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
                <div className="flex items-center gap-1 text-yellow-400">★★★★★</div>
                <h4 className="font-black text-xs uppercase text-black">&quot;Developer setups mapped&quot;</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  &quot;Holly onboarded 12 developers in one sprint. Setup tasks were automated.&quot;
                </p>
                <span className="text-[10px] font-black text-gray-400 uppercase">— Patty McCord, Netflix Ex-HR Head</span>
              </div>
            
              <div key={1} className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
                <div className="flex items-center gap-1 text-yellow-400">★★★★★</div>
                <h4 className="font-black text-xs uppercase text-black">&quot;Compliant policy guidelines&quot;</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  &quot;Holly drafted our employee handbook. Clear regulations, fully compliant.&quot;
                </p>
                <span className="text-[10px] font-black text-gray-400 uppercase">— Laszlo Bock, Ex-Google VP of People</span>
              </div>
            
              <div key={2} className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
                <div className="flex items-center gap-1 text-yellow-400">★★★★★</div>
                <h4 className="font-black text-xs uppercase text-black">&quot;Benefits structured perfectly&quot;</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  &quot;HR files and benefits are structured. Holly saves us HR stress.&quot;
                </p>
                <span className="text-[10px] font-black text-gray-400 uppercase">— Arianna Huffington, Founder</span>
              </div>
            
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="bg-white py-16 px-6 border-b-4 border-black">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className={`text-4xl md:text-5xl uppercase font-black leading-none text-center ${oswald.className}`}>
            Questions?
          </h2>
          <div className="space-y-4">
            {[
              { q: "What exactly can Holly do?", a: "I build HR policy guidelines, design team onboarding guides, and coordinate benefits systems. She executes autonomous steps based on your triggers." },
              { q: "Is my company data private and secure?", a: "Yes. All credentials, database details, and files are encrypted end-to-end. We never sell or share data." },
              { q: "How does she learn our workflows?", a: "She evaluates historical logs, patterns, and code specs to match your layout style and requirements." },
              { q: "Can I cancel or change plans anytime?", a: "Absolutely. You can hire, pause, or upgrade plans inside your Pixorva workspace console at any time." }
            ].map((faq, idx) => (
              <details key={idx} className="group border-4 border-black bg-white rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                  <h4 className="font-black text-sm uppercase text-black">{faq.q}</h4>
                  <span className="font-black text-lg transition group-open:rotate-180">+</span>
                </summary>
                <p className="text-xs text-gray-500 font-medium mt-3 leading-relaxed border-t border-black/10 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM LOVES TO COLLABORATE */}
      <section className="bg-gray-50 py-16 border-b-4 border-black text-center overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-4 px-6 mb-8">
          <h2 className={`text-3xl md:text-5xl uppercase font-black leading-none ${oswald.className}`}>
            Holly Loves to work with a team
          </h2>
        </div>
        
        {/* INFINITE SCROLLING MARQUEE MATCHING LANDING PAGE */}
        <div className="w-full overflow-hidden relative py-6">
          <div className="animate-marquee flex gap-6 py-2">
            {[...teamList, ...teamList].map((item, i) => (
              <Link key={`team-marquee-${i}`} href={item.path} className="inline-block transition transform hover:scale-105 active:scale-95 shrink-0">
                <div className={`w-[160px] h-[160px] rounded-2xl border-4 border-black ${item.color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden`}>
                  
                  {/* Large vertical background name */}
                  <div 
                    className={`absolute left-2.5 top-3 text-white/25 font-black text-[38px] tracking-tighter select-none leading-none ${oswald.className}`} 
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    {item.name}
                  </div>

                  {/* Avatar illustration positioned absolute bottom-right */}
                  <div className="absolute -bottom-1 -right-1 w-24 h-24 z-10">
                    <AgentAvatar id={item.id} className="w-full h-full" />
                  </div>

                  {/* Yellow badge role pill at bottom */}
                  <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 z-20 bg-yellow-400 text-black border-2 border-black px-2 py-0.5 rounded-lg text-[8px] font-black uppercase whitespace-nowrap tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {item.role}
                  </div>

                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TIME ELAPSED BANNER */}
      <section className="bg-white py-16 px-6 text-center border-b-4 border-black">
        <div className="max-w-4xl mx-auto space-y-8 border-4 border-black p-10 rounded-3xl bg-yellow-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,_black_1.5px,_transparent_1.5px)] bg-[length:15px_15px]"></div>
          <h3 className={`text-3xl md:text-5xl uppercase font-black leading-[0.9] tracking-tight ${oswald.className} relative z-10`}>
            In the <span className="bg-black text-white px-3 py-1 inline-block border-4 border-black transform rotate-1">{seconds} seconds</span> you have been on this page,
          </h3>
          <p className="text-lg md:text-xl font-bold text-gray-800 leading-snug relative z-10 max-w-xl mx-auto">
            Holly could have created {(seconds * 0.016).toFixed(3)} corporate handbook guides, onboarded {(seconds * 0.04).toFixed(2)} new hires, and drafted {(seconds * 0.1).toFixed(1)} policy compliance files.
          </p>
          <div className="pt-4 relative z-10 flex flex-col items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none bg-white/90 border-2 border-black px-4 py-2 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <input
                type="checkbox"
                checked={agreeHire}
                onChange={(e) => setAgreeHire(e.target.checked)}
                className="w-4 h-4 border-2 border-black rounded text-black bg-white accent-yellow-400 cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-800">
                I agree to Pixorva&apos;s{" "}
                <Link href="/terms" target="_blank" className="underline text-blue-600 hover:text-black">Terms of Service</Link>{" "}
                &amp;{" "}
                <Link href="/privacy" target="_blank" className="underline text-blue-600 hover:text-black">Privacy Policy</Link>
              </span>
            </label>

            <button 
              onClick={handleHireNow}
              className="bg-yellow-400 text-black border-4 border-black px-8 py-3.5 rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5"
            >
              Hire Holly Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
