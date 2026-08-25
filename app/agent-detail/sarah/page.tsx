'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import { triggerRazorpayCheckout } from '../../utils/RazorpayCheckout';
import { showToast } from '../../utils/Toast';
import AgentAvatar from '../../components/AgentAvatar';

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
    id: "sales-1",
    category: "Sales",
    name: "Sarah",
    role: "SDR / Outreach",
    price: "₹999/mo",
    steps: [{"type":"trigger","name":"Company","icon":"Search"},{"type":"action","name":"Draft Email","icon":"Mail"}]
  };

  const teamList = [
    { name: 'Devon', id: 'dev-1', path: '/agent-detail/devon' },
    { name: 'Ruby', id: 'dev-2', path: '/agent-detail/ruby' },
    { name: 'Quinn', id: 'dev-3', path: '/agent-detail/quinn' },
    { name: 'Cy', id: 'dev-4', path: '/agent-detail/cy' },
    { name: 'Marcus', id: 'mkt-1', path: '/agent-detail/marcus' },
    { name: 'Stella', id: 'mkt-2', path: '/agent-detail/stella' },
    { name: 'Gordon', id: 'mkt-3', path: '/agent-detail/gordon' },
    { name: 'Vic', id: 'mkt-4', path: '/agent-detail/vic' },
    { name: 'Sarah', id: 'sales-1', path: '/agent-detail/sarah' },
    { name: 'Larry', id: 'sales-2', path: '/agent-detail/larry' },
    { name: 'Holly', id: 'ops-1', path: '/agent-detail/holly' },
    { name: 'Finn', id: 'ops-2', path: '/agent-detail/finn' },
    { name: 'Lawson', id: 'ops-3', path: '/agent-detail/lawson' },
    { name: 'Pat', id: 'ops-4', path: '/agent-detail/pat' },
    { name: 'Sam', id: 'sup-1', path: '/agent-detail/sam' }
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
          <Link href="/employees" className="bg-black text-white p-2 rounded-lg border-2 border-black hover:bg-yellow-400 hover:text-black transition shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-y-0.5 flex items-center justify-center shrink-0">
            <ArrowLeft size={16} />
          </Link>
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
        style={{ backgroundColor: "#EAB308", color: "#000000" }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_black_1.5px,_transparent_1.5px)] bg-[length:15px_15px]"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left Text */}
          <div className="text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-black border-2 border-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transform -rotate-1 text-white">
              <Sparkles size={12} className="text-yellow-400" />
              Meet Sarah
            </div>

            <h1 className={`text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tight ${oswald.className}`} style={{ color: "#000000" }}>
              YOUR AI <br />
              <span className="text-black bg-yellow-400 px-3 py-1 inline-block border-4 border-black transform rotate-1 mt-2">
                SDR / Outreach
              </span>
            </h1>

            <p className="text-lg md:text-xl font-medium leading-relaxed max-w-xl" style={{ color: "rgba(0,0,0,0.85)" }}>
              &ldquo;I enrich sales domains, compose personalized email sequences, and book meetings on autopilot.&rdquo;
            </p>

            {/* Price Box */}
            <div className="bg-black/25 border-2 border-white p-4 rounded-2xl max-w-sm flex justify-between items-center text-white">
              <div>
                <span className="text-[10px] font-black uppercase text-white/70 block">Monthly Rate</span>
                <span className="text-3xl font-black text-yellow-400">₹999/mo</span>
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
                <span className="text-[10px] font-bold leading-tight" style={{ color: "rgba(0,0,0,0.85)" }}>
                  I agree to Pixorva&apos;s <Link href="/terms" className="underline" style={{ color: "#1D4ED8" }}>Terms of Service</Link> & <Link href="/privacy" className="underline" style={{ color: "#1D4ED8" }}>Privacy Policy</Link> to commission this AI employee.
                </span>
              </label>

              <button
                onClick={handleHireNow}
                disabled={loading}
                className="w-full bg-yellow-400 text-black hover:bg-black hover:text-white border-4 border-black text-xs font-black uppercase py-4 rounded-2xl tracking-wider transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing Transaction...' : '⚡ Hire SARAH NOW'}
              </button>
            </div>
          </div>

          {/* Dedicated Right Hand Side Mockup */}
          <div className="w-full max-w-lg mx-auto bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black text-left font-sans">
            <div className="bg-gray-100 border-b-4 border-black px-4 py-2 flex items-center justify-between">
              <span className="text-[9px] text-gray-400 uppercase font-black">SDR Outreach Sequence Editor</span>
              <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded border border-black">OUTBOUND SET</span>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="border border-gray-300 p-2.5 rounded-lg bg-gray-50">
                <span className="font-black text-gray-400 text-[8px] block mb-1">To: target.founder@startup.io</span>
                <span className="font-black text-black block mb-2">Subject: Accelerating Next.js development</span>
                <p className="text-[10px] text-gray-600 leading-normal">
                  Hi Startup Founder, I noticed your ProductHunt launch. Our developer agent Devon writes frontend code instantly... Are you open to a call?
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* METRICS BAR SECTION */}
      <section className="bg-white border-b-4 border-black py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-4 border-black p-6 rounded-2xl bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-1">
            <span className={`text-4xl font-black text-black block ${oswald.className}`}>30,000+</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">EMAILS SENT</span>
          </div>
          <div className="border-4 border-black p-6 rounded-2xl bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-1">
            <span className={`text-4xl font-black text-black block ${oswald.className}`}>20+</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">APPOINTMENTS BOOKED</span>
          </div>
          <div className="border-4 border-black p-6 rounded-2xl bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-1">
            <span className={`text-4xl font-black text-black block ${oswald.className}`}>24%</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">EMAIL OPEN RATE INDEX</span>
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
            {["We struggle to get replies from cold email campaigns.","Drafting customized pitches for prospect domains takes all day.","Outbound sales sequences are manual and book zero calls."].map((pt, idx) => (
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
      <section className="bg-white border-b-4 border-black py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-4">
            <AgentAvatar id={employee.id} className="w-24 h-24 rounded-full" />
          </div>
          <h2 className={`text-3xl md:text-5xl uppercase font-black leading-none ${oswald.className}`}>
            Meet Sarah.
          </h2>
          <p className="text-base md:text-lg font-bold text-gray-500 uppercase tracking-wide">
            She&apos;ll make your life way easier.
          </p>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Sarah is your AI SDR / Outreach, a tireless teammate who lives inside your workspace channels.
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
                  PERSONALIZED EMAIL TEMPLATES
                </h3>
                <p className="text-xs text-gray-500 font-bold leading-relaxed">
                  Sarah researches company parameters to customize SDR email pitches, avoiding generic spam patterns.
                </p>
                <ul className="space-y-2 pt-2">
                  
                    <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span>Prospect domain checks</span>
                    </li>
                  
                    <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span>Customized trigger hooks</span>
                    </li>
                  
                    <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span>Improves email click rates</span>
                    </li>
                  
                </ul>
              </div>

              {/* Visual Box Mockup */}
              <div className="w-full md:w-5/12">
                <div className="w-full bg-[#FEF08A] border-4 border-black p-5 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black text-left">
            <h4 className="font-black text-xs uppercase text-yellow-800 border-b-2 border-black pb-2">Cold Email Pitch</h4>
            <div className="text-[10px] pt-3 leading-relaxed font-bold">
              ✓ Prospect: Founder at NextApp Co.<br />
              ✓ Context: Built dynamic layout route tables.
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
                  OUTBOUND SALES SEQUENCES
                </h3>
                <p className="text-xs text-gray-500 font-bold leading-relaxed">
                  Sarah schedules multiple follow-ups with prospect domains to ensure zero deals get forgotten.
                </p>
                <ul className="space-y-2 pt-2">
                  
                    <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span>Configures daily outbound sequences</span>
                    </li>
                  
                    <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span>Handles prospect unsubscribe requests</span>
                    </li>
                  
                    <li className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span>Aligns schedule times</span>
                    </li>
                  
                </ul>
              </div>

              {/* Visual Box Mockup */}
              <div className="w-full md:w-5/12">
                <div className="w-full bg-white border-4 border-black p-5 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black text-left">
            <h4 className="font-black text-xs uppercase text-blue-600 border-b-2 border-black pb-2">Sequence Preview</h4>
            <div className="text-[10px] font-bold text-gray-500 pt-3 leading-relaxed">
              ✓ Outbound sequence active.<br />
              ✓ Follow-up scheduled for Wednesday 9 AM.
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
            How Sarah Works
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase max-w-xl mx-auto">
            Up and running in minutes. Sarah handles the operational busywork so you can spend your day on what matters.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 border-2 border-black flex items-center justify-center font-black text-lg">1</div>
              <h4 className="font-black text-sm uppercase">Connect Workspace</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Link Sarah to your Slack, email, or repository in a couple of clicks. Setup is fully automated.
              </p>
            </div>
            <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 border-2 border-black flex items-center justify-center font-black text-lg">2</div>
              <h4 className="font-black text-sm uppercase">Executes Daily Audits</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                She scans files, compiles tasks, and writes output drafts in your channels around the clock.
              </p>
            </div>
            <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 border-2 border-black flex items-center justify-center font-black text-lg">3</div>
              <h4 className="font-black text-sm uppercase">You Stay in Control</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
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
            Sarah is endorsed by sales teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            
              <div key={0} className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
                <div className="flex items-center gap-1 text-yellow-400">★★★★★</div>
                <h4 className="font-black text-xs uppercase text-black">&quot;Response rates rose&quot;</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  &quot;Sarah drafts cold SDR sequences. Response rates rose from 2% to 24%.&quot;
                </p>
                <span className="text-[10px] font-black text-gray-400 uppercase">— Aaron Ross, Author of Predictable Revenue</span>
              </div>
            
              <div key={1} className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
                <div className="flex items-center gap-1 text-yellow-400">★★★★★</div>
                <h4 className="font-black text-xs uppercase text-black">&quot;Meetings booked fast&quot;</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  &quot;Sarah personalized outreach emails for SaaS founders. 20+ meetings booked.&quot;
                </p>
                <span className="text-[10px] font-black text-gray-400 uppercase">— Marc Benioff, Salesforce CEO</span>
              </div>
            
              <div key={2} className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-4">
                <div className="flex items-center gap-1 text-yellow-400">★★★★★</div>
                <h4 className="font-black text-xs uppercase text-black">&quot;Autopilot sequences active&quot;</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  &quot;Outbound sales sequences run on auto-pilot. High quality email drafts.&quot;
                </p>
                <span className="text-[10px] font-black text-gray-400 uppercase">— Steli Efti, Sales Coach</span>
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
              { q: "What exactly can Sarah do?", a: "I enrich sales domains, compose personalized email sequences, and book meetings on autopilot. She executes autonomous steps based on your triggers." },
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
        <div className="max-w-5xl mx-auto space-y-10 px-6">
          <h2 className={`text-3xl md:text-5xl uppercase font-black leading-none ${oswald.className}`}>
            Sarah Loves to work with a team
          </h2>
        </div>
        <div className="relative w-full overflow-hidden pt-4">
          <div className="animate-marquee flex gap-6 py-2">
            {/* First Sequence */}
            {teamList.map((item, i) => {
              const getDetails = (id: string) => {
                const data: Record<string, { role: string; color: string }> = {
                  'dev-1': { role: 'React Developer', color: 'bg-orange-500' },
                  'dev-2': { role: 'Backend Architect', color: 'bg-emerald-500' },
                  'dev-3': { role: 'QA Tester', color: 'bg-purple-600' },
                  'dev-4': { role: 'Security Analyst', color: 'bg-teal-500' },
                  'mkt-1': { role: 'Growth Hacker', color: 'bg-red-700' },
                  'mkt-2': { role: 'Social Media Mgr', color: 'bg-orange-500' },
                  'mkt-3': { role: 'SEO Blog Writer', color: 'bg-red-600' },
                  'mkt-4': { role: 'Video Scripter', color: 'bg-indigo-600' },
                  'sales-1': { role: 'SDR / Outreach', color: 'bg-pink-500' },
                  'sales-2': { role: 'Lead Enricher', color: 'bg-sky-500' },
                  'ops-1': { role: 'HR Manager', color: 'bg-fuchsia-500' },
                  'ops-2': { role: 'Finance Analyst', color: 'bg-slate-600' },
                  'ops-3': { role: 'Legal Assistant', color: 'bg-orange-700' },
                  'ops-4': { role: 'Product Manager', color: 'bg-lime-500' },
                  'sup-1': { role: 'Customer Support', color: 'bg-cyan-500' }
                };
                return data[id] || { role: 'AI Specialist', color: 'bg-blue-500' };
              };
              const details = getDetails(item.id);
              return (
                <Link key={`seq1-${i}`} href={item.path} className="inline-block transition transform hover:scale-105 active:scale-95 shrink-0">
                  <div className={`w-[160px] h-[160px] rounded-2xl border-4 border-black ${details.color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden`}>
                    <div 
                      className={`absolute left-2.5 top-3 text-white/25 font-black text-[38px] tracking-tighter select-none leading-none ${oswald.className}`} 
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      {item.name}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-24 h-24 z-10">
                      <AgentAvatar id={item.id} className="w-full h-full" />
                    </div>
                    <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 z-20 bg-yellow-400 text-black border-2 border-black px-2 py-0.5 rounded-lg text-[8px] font-black uppercase whitespace-nowrap tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {details.role}
                    </div>
                  </div>
                </Link>
              );
            })}
            {/* Duplicate Sequence for seamless looping marquee */}
            {teamList.map((item, i) => {
              const getDetails = (id: string) => {
                const data: Record<string, { role: string; color: string }> = {
                  'dev-1': { role: 'React Developer', color: 'bg-orange-500' },
                  'dev-2': { role: 'Backend Architect', color: 'bg-emerald-500' },
                  'dev-3': { role: 'QA Tester', color: 'bg-purple-600' },
                  'dev-4': { role: 'Security Analyst', color: 'bg-teal-500' },
                  'mkt-1': { role: 'Growth Hacker', color: 'bg-red-700' },
                  'mkt-2': { role: 'Social Media Mgr', color: 'bg-orange-500' },
                  'mkt-3': { role: 'SEO Blog Writer', color: 'bg-red-600' },
                  'mkt-4': { role: 'Video Scripter', color: 'bg-indigo-600' },
                  'sales-1': { role: 'SDR / Outreach', color: 'bg-pink-500' },
                  'sales-2': { role: 'Lead Enricher', color: 'bg-sky-500' },
                  'ops-1': { role: 'HR Manager', color: 'bg-fuchsia-500' },
                  'ops-2': { role: 'Finance Analyst', color: 'bg-slate-600' },
                  'ops-3': { role: 'Legal Assistant', color: 'bg-orange-700' },
                  'ops-4': { role: 'Product Manager', color: 'bg-lime-500' },
                  'sup-1': { role: 'Customer Support', color: 'bg-cyan-500' }
                };
                return data[id] || { role: 'AI Specialist', color: 'bg-blue-500' };
              };
              const details = getDetails(item.id);
              return (
                <Link key={`seq2-${i}`} href={item.path} className="inline-block transition transform hover:scale-105 active:scale-95 shrink-0">
                  <div className={`w-[160px] h-[160px] rounded-2xl border-4 border-black ${details.color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden`}>
                    <div 
                      className={`absolute left-2.5 top-3 text-white/25 font-black text-[38px] tracking-tighter select-none leading-none ${oswald.className}`} 
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      {item.name}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-24 h-24 z-10">
                      <AgentAvatar id={item.id} className="w-full h-full" />
                    </div>
                    <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 z-20 bg-yellow-400 text-black border-2 border-black px-2 py-0.5 rounded-lg text-[8px] font-black uppercase whitespace-nowrap tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {details.role}
                    </div>
                  </div>
                </Link>
              );
            })}
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
            Sarah could have outbound-sent {(seconds * 2.1).toFixed(1)} SDR email drafts, followed up on {(seconds * 0.1).toFixed(1)} deals, and booked {(seconds * 0.025).toFixed(2)} sales meetings.
          </p>
          <div className="pt-4 relative z-10">
            <button 
              onClick={handleHireNow}
              className="bg-yellow-400 text-black border-4 border-black px-8 py-3.5 rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5"
            >
              Hire Sarah Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
