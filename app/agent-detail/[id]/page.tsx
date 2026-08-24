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
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { EMPLOYEES } from '../../employees/page';
import { createClient } from '../../utils/supabase/client';
import { triggerRazorpayCheckout } from '../../utils/RazorpayCheckout';
import { showToast } from '../../utils/Toast';
import AgentAvatar from '../../components/AgentAvatar';

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
    switch (employee.id) {
      case 'dev-1': // Devon
        return {
          heroBgColor: '#2563EB',
          heroTextColor: '#FFFFFF',
          tagline: `I compile code, build frontend interfaces, fix React hooks, and structure Next.js layouts on the fly.`,
          metrics: { val1: "120k+", label1: "COMMITS LOGGED", val2: "4.8s", label2: "BUILD TIME SECURED", val3: "99.9%", label3: "COMPLIANCE LEVEL" },
          painPoints: [
            "We spend hours fixing small CSS alignment issues and React hooks.",
            "Designing frontend layout shells is slowing down backend integration.",
            "We lack specialized React support to ship features on timeline."
          ]
        };
      case 'dev-2': // Ruby
        return {
          heroBgColor: '#047857',
          heroTextColor: '#FFFFFF',
          tagline: `I write optimized SQL queries, construct Node.js APIs, and configure Supabase schemas.`,
          metrics: { val1: "45,000+", label1: "QUERIES OPTIMIZED", val2: "12ms", label2: "LATENCY REDUCTION", val3: "100%", label3: "ACID RELIABILITY" },
          painPoints: [
            "Our database queries are slow and bottlenecking user traffic.",
            "Designing relational schemas is confusing and leads to server errors.",
            "Setting up Supabase tables and migrations takes up half our sprint."
          ]
        };
      case 'dev-3': // Quinn
        return {
          heroBgColor: '#7C3AED',
          heroTextColor: '#FFFFFF',
          tagline: `I write unit tests, Cypress end-to-end integration specs, and scan for broken frontend logic.`,
          metrics: { val1: "18,000+", label1: "SPECS RUN", val2: "100%", label2: "COVERAGE SECURED", val3: "0", label3: "PRODUCTION BUGS" },
          painPoints: [
            "Bugs hit production because we lack time to write Jest specs.",
            "Writing assertions and mocking routes is tedious.",
            "Refactoring database tables breaks our app quietly."
          ]
        };
      case 'sec-1': // Cy
        return {
          heroBgColor: '#111827',
          heroTextColor: '#FFFFFF',
          tagline: `I scan repositories for vulnerabilities, audit compliance requirements, and build SOC2 gates.`,
          metrics: { val1: "100%", label1: "SOC2 COMPLIANT", val2: "24/7", label2: "THREAT SCANS", val3: "0", label3: "EXPLOITS DETECTED" },
          painPoints: [
            "We are worried about data leaks and security violations in our repo.",
            "Passing security audits and compliance checks feels impossible.",
            "We have no active threat scanning or monitoring in place."
          ]
        };
      case 'mkt-1': // Marcus
        return {
          heroBgColor: '#EA580C',
          heroTextColor: '#FFFFFF',
          tagline: `I design growth loops, formulate high-converting referral landing pages, and launch viral lead flows.`,
          metrics: { val1: "500k", label1: "REFERRED LEADS", val2: "3.2x", label2: "VIRAL COEFFICIENT", val3: "15%", label3: "CONVERSION INDEX" },
          painPoints: [
            "Our user growth is stagnant and ads are draining our budget.",
            "We don't know how to set up dynamic referral campaigns.",
            "Landing page visitors bounce without converting."
          ]
        };
      case 'mkt-2': // Stella
        return {
          heroBgColor: '#DB2777',
          heroTextColor: '#FFFFFF',
          tagline: `I draft viral Reels scripts, schedule Instagram postings, and compose engaging social media threads.`,
          metrics: { val1: "1.2M", label1: "VIEWS ENGAGED", val2: "15 mins", label2: "DRAFT OUTLINES", val3: "4.8x", label3: "CTR INCREASE INDEX" },
          painPoints: [
            "Keeping up with daily social postings is exhausting.",
            "Writing video scripts and caption drafts consumes hours.",
            "We have zero organic lead generation from social platforms."
          ]
        };
      case 'mkt-3': // Gordon
        return {
          heroBgColor: '#4F46E5',
          heroTextColor: '#FFFFFF',
          tagline: `I perform semantic keyword audits and write organic blog posts that rank #1 on search engines.`,
          metrics: { val1: "480k", label1: "ORGANIC TRAFFIC", val2: "15 min", label2: "DRAFT OUTLINES", val3: "6.2x", label3: "CTR UPLIFT INDEX" },
          painPoints: [
            "We write articles but none of them show up on Google search results.",
            "Finding high-value, low-competition keywords is too technical.",
            "Our organic traffic is flat and paid ads are too expensive."
          ]
        };
      case 'mkt-4': // Vic
        return {
          heroBgColor: '#F43F5E',
          heroTextColor: '#FFFFFF',
          tagline: `I edit short-form promotional videos, format typography, and schedule high-retention Reels.`,
          metrics: { val1: "2.5M+", label1: "VIDEO VIEWS", val2: "12 min", label2: "RENDER OUTLINES", val3: "8.5x", label3: "RETENTION INDEX" },
          painPoints: [
            "Editing videos and scripting hooks takes all our time.",
            "Short-form content gets low views due to poor pacing.",
            "We need high-quality scripts for social video launches."
          ]
        };
      case 'sal-2': // Sarah
        return {
          heroBgColor: '#EAB308',
          heroTextColor: '#000000',
          tagline: `I enrich sales domains, compose personalized email sequences, and book meetings on autopilot.`,
          metrics: { val1: "30,000", label1: "EMAILS SENT", val2: "20+", label2: "MEETINGS BOOKED", val3: "24%", label3: "OPEN RATE INDEX" },
          painPoints: [
            "We struggle to get replies from cold email campaigns.",
            "Drafting customized pitches for prospect domains takes all day.",
            "Outbound sales sequences are manual and book zero calls."
          ]
        };
      case 'sal-1': // Larry
        return {
          heroBgColor: '#F59E0B',
          heroTextColor: '#000000',
          tagline: `I build targeted direct-line business lead lists and verify prospect emails.`,
          metrics: { val1: "240k", label1: "LEADS EXTRACTED", val2: "99.8%", label2: "ACCURACY RATE", val3: "4.8h", label3: "SAVED PER WEEK" },
          painPoints: [
            "Buying lead databases leads to high email bounce rates.",
            "Finding valid emails and direct lines for decision makers is slow.",
            "We lack a system to target specific local business niches."
          ]
        };
      case 'ops-2': // Holly
        return {
          heroBgColor: '#E11D48',
          heroTextColor: '#FFFFFF',
          tagline: `I build HR policy guidelines, design team onboarding guides, and coordinate benefits systems.`,
          metrics: { val1: "50+", label1: "MEMBERS ASSIGNED", val2: "20h", label2: "TIMELINE SAVED", val3: "100%", label3: "COMPLIANCE LEVEL" },
          painPoints: [
            "Onboarding new hires is manual, disorganized, and slow.",
            "Drafting handbook policies takes hours.",
            "Keeping employee records and benefits files is chaotic."
          ]
        };
      case 'ops-1': // Finn
        return {
          heroBgColor: '#475569',
          heroTextColor: '#FFFFFF',
          tagline: `I scan expense logs, audit payroll distributions, and optimize operational EBITDA structures.`,
          metrics: { val1: "₹2.5M+", label1: "EXPENSES SAVED", val2: "18%", label2: "EBITDA INCREASE", val3: "24/7", label3: "LEDGER SCANS" },
          painPoints: [
            "Our operational costs are high and profit margins are shrinking.",
            "Analyzing financial statements for cost leakages is manual.",
            "We struggle to balance resource allocations against payroll."
          ]
        };
      case 'ops-3': // Lawson
        return {
          heroBgColor: '#B45309',
          heroTextColor: '#FFFFFF',
          tagline: `I review commercial NDA guidelines, draft partnership charters, and verify vendor SLAs.`,
          metrics: { val1: "15,000+", label1: "PAGES DRAFTED", val2: "48h", label2: "TURNAROUND SAVED", val3: "100%", label3: "LEGAL ACCURACY" },
          painPoints: [
            "Legal templates and NDAs are slow to review and draft.",
            "We spend too much money on standard boilerplate templates.",
            "Ensuring compliance across diverse agreements is risky."
          ]
        };
      case 'ops-4': // Pat
        return {
          heroBgColor: '#0D9488',
          heroTextColor: '#FFFFFF',
          tagline: `I structure agile sprint roadmaps, track board milestones, and log team action items.`,
          metrics: { val1: "45", label1: "SPRINTS COMPLETED", val2: "92%", label2: "VELOCITY INDEX", val3: "8h", label3: "MEETING TIME SAVED" },
          painPoints: [
            "Sprint planning and JIRA setup eats up our product timeline.",
            "Action items from meetings are forgotten and tasks stall.",
            "We lack clear roadmap specifications for developers."
          ]
        };
      case 'ops-5': // Sam
        return {
          heroBgColor: '#6D28D9',
          heroTextColor: '#FFFFFF',
          tagline: `I manage customer support tickets, answer help center queries, and audit customer SLA satisfaction scores.`,
          metrics: { val1: "8,500+", label1: "TICKETS RETRIEVED", val2: "1.2 min", label2: "RESPONSE TIME", val3: "98.5%", label3: "CSAT SCORE INDEX" },
          painPoints: [
            "Customer support tickets are piling up and response time is slow.",
            "Answering repetitive user questions consumes our team's time.",
            "SLA compliance is dropping due to support bottlenecks."
          ]
        };
      default:
        return {
          heroBgColor: '#FF5A36',
          heroTextColor: '#FFFFFF',
          tagline: `I review corporate NDAs, summarize costing ledgers, structure onboarding rules, and write user roadmap spec sheets.`,
          metrics: { val1: "15,000", label1: "PAGES DRAFTED", val2: "2H", label2: "SAVED DAILY, GUARANTEED", val3: "100%", label3: "AGILE SPEC COVERAGE" },
          painPoints: [
            "Creating spec sheets eats up our product timeline",
            "NDA agreements and terms reviews take days to clear",
            "Onboarding checkers and policy lists get messy"
          ]
        };
    }
  };

  const dynamic = getDynamicContent();

  const renderMockup = (id: string) => {
    switch (id) {
      case 'dev-1': // Devon (React Developer)
        return (
          <div className="w-full max-w-lg mx-auto bg-[#1E1E1E] border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white text-left font-mono">
            {/* Editor Top Tabs Bar */}
            <div className="bg-[#2D2D2D] border-b-4 border-black px-4 py-2.5 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-black"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 border border-black"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 border border-black"></div>
              </div>
              <div className="flex gap-2 text-[10px] font-bold">
                <span className="bg-[#1E1E1E] px-3 py-1 border-t-2 border-yellow-400 text-yellow-400 rounded-t-md">index.tsx</span>
                <span className="opacity-40 px-3 py-1">schema.sql</span>
                <span className="opacity-40 px-3 py-1">agent.config</span>
              </div>
              <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded border border-black">
                TS ACTIVE
              </span>
            </div>

            {/* Code Workspace */}
            <div className="p-5 text-xs space-y-2 leading-relaxed min-h-[220px]">
              <div><span className="text-purple-400">import</span> {'{ Button }'} <span className="text-purple-400">from</span> <span className="text-green-300">&apos;@/components/ui/button&apos;</span>;</div>
              <div><span className="text-purple-400">export default function</span> <span className="text-yellow-300">DevonApp</span>() {'{'}</div>
              <div className="pl-4"><span className="text-purple-400">return</span> (</div>
              <div className="pl-8"><span className="text-blue-300">&lt;Button</span> <span className="text-yellow-400">onClick</span>=<span className="text-green-300">{'{() => console.log(&quot;Compiled!&quot;)}'}</span><span className="text-blue-300">&gt;</span></div>
              <div className="pl-12">Deploy React Agent</div>
              <div className="pl-8"><span className="text-blue-300">&lt;/Button&gt;</span></div>
              <div className="pl-4">);</div>
              <div>{'}'}</div>
              <div className="pt-4 border-t border-gray-800 text-[10px] text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                <span>✓ Frontend UI sandbox compiled successfully. 0 lint errors.</span>
              </div>
            </div>
          </div>
        );

      case 'dev-2': // Ruby (Database Architect)
        return (
          <div className="w-full max-w-lg mx-auto bg-[#1E1E1E] border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white text-left font-mono">
            <div className="bg-[#2D2D2D] border-b-4 border-black px-4 py-2.5 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-black"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 border border-black"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 border border-black"></div>
              </div>
              <div className="text-[10px] font-bold text-gray-400">DB Schema Console</div>
              <span className="bg-green-600 text-white text-[8px] font-black px-2 py-0.5 rounded border border-black">
                SQL READY
              </span>
            </div>

            <div className="p-5 text-xs space-y-2 leading-relaxed min-h-[220px]">
              <div><span className="text-yellow-400">SELECT</span> users.id, profiles.plan</div>
              <div><span className="text-yellow-400">FROM</span> users</div>
              <div><span className="text-yellow-400">JOIN</span> profiles <span className="text-yellow-400">ON</span> users.id = profiles.user_id</div>
              <div><span className="text-yellow-400">WHERE</span> profiles.active = <span className="text-purple-400">true</span>;</div>
              <div className="pt-4 border-t border-gray-800 text-[10px] text-green-400">
                <span>✓ 149 records retrieved. Indexing optimized. Latency: 12ms.</span>
              </div>
            </div>
          </div>
        );

      case 'dev-3': // Quinn (QA Tester)
        return (
          <div className="w-full max-w-lg mx-auto bg-[#1E1E1E] border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white text-left font-mono">
            <div className="bg-[#2D2D2D] border-b-4 border-black px-4 py-2.5 flex items-center justify-between">
              <div className="text-[10px] font-bold text-gray-400">Jest Assertions Runner</div>
              <span className="bg-purple-600 text-white text-[8px] font-black px-2 py-0.5 rounded border border-black">
                JEST v29
              </span>
            </div>

            <div className="p-5 text-xs space-y-1.5 leading-relaxed min-h-[220px]">
              <div className="text-green-400">PASS  tests/auth.test.ts (4.8s)</div>
              <div className="text-green-400">PASS  tests/agents.test.ts (2.1s)</div>
              <div className="text-green-400">PASS  tests/payments.test.ts (3.4s)</div>
              <div className="pt-4 border-t border-gray-800 text-[10px] text-white">
                <span className="block">Test Suites: <span className="text-green-400 font-bold">3 passed</span>, 3 total</span>
                <span className="block">Tests:       <span className="text-green-400 font-bold">24 passed</span>, 24 total</span>
                <span className="block">Time:        10.3s</span>
              </div>
            </div>
          </div>
        );

      case 'sec-1': // Cy (Security Compliance)
        return (
          <div className="w-full max-w-lg mx-auto bg-[#0F172A] border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white text-left font-mono">
            <div className="bg-gray-800 border-b-4 border-black px-4 py-2.5 flex items-center justify-between">
              <div className="text-[10px] font-bold text-gray-400">SOC2 Threat Scanner</div>
              <span className="bg-teal-600 text-white text-[8px] font-black px-2 py-0.5 rounded border border-black">
                SEC COMPLIANT
              </span>
            </div>

            <div className="p-5 text-[11px] space-y-1.5 min-h-[220px]">
              <div className="text-gray-400">[CY_SCAN] Initializing repository security sweep...</div>
              <div className="text-green-400">✓ SSL/TLS verification check: PASSED</div>
              <div className="text-green-400">✓ Database SQL Injection sanitization: SECURE</div>
              <div className="text-green-400">✓ API route token gate encryption: ENCRYPTED</div>
              <div className="text-yellow-400">! Port monitoring: 0 vulnerabilities flagged.</div>
              <div className="text-teal-400 font-bold pt-2 border-t border-gray-800">[RESULT] SOC2 Compliance Gate: PASSED</div>
            </div>
          </div>
        );

      case 'mkt-1': // Marcus (Growth Hacker)
        return (
          <div className="w-full max-w-lg mx-auto bg-[#FDF2F8] border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black text-left p-5">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block mb-4">Referral Loops Configurator</span>
            <div className="space-y-4">
              <div className="border-2 border-black p-3 rounded-xl bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[8px] font-black uppercase text-pink-600 bg-pink-50 border border-pink-300 px-2 py-0.5 rounded">Active Loop</span>
                <h5 className="font-black text-xs uppercase mt-2">Referral Goal: 10,000 Signups</h5>
                <p className="text-[10px] text-gray-500 mt-1">Growth Coefficient: <span className="font-bold text-green-600">2.4x 📈</span></p>
              </div>
              <div className="border-2 border-black p-3 rounded-xl bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
                <span className="font-black text-[10px] uppercase">Active Channels:</span>
                <span className="bg-black text-white text-[8px] font-black px-2.5 py-1 rounded">GMAIL, TWITTER, SLACK</span>
              </div>
            </div>
          </div>
        );

      case 'mkt-2': // Stella (Social Media Mgr)
        return (
          <div className="w-full max-w-lg mx-auto bg-gray-100 border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black relative min-h-[300px] p-4">
            {/* Grid of background post mockups */}
            <div className="grid grid-cols-3 gap-2 opacity-30 select-none pointer-events-none">
              <div className="bg-blue-200 border-2 border-black rounded-lg aspect-square p-2 text-[6px] font-bold">Post 1<br />Likes: 1.2k</div>
              <div className="bg-yellow-200 border-2 border-black rounded-lg aspect-square p-2 text-[6px] font-bold">Post 2<br />Shares: 490</div>
              <div className="bg-red-200 border-2 border-black rounded-lg aspect-square p-2 text-[6px] font-bold">Post 3<br />Saves: 231</div>
              <div className="bg-green-200 border-2 border-black rounded-lg aspect-square p-2 text-[6px] font-bold">Post 4<br />Reach: 14k</div>
              <div className="bg-purple-200 border-2 border-black rounded-lg aspect-square p-2 text-[6px] font-bold">Post 5<br />Engagement</div>
              <div className="bg-pink-200 border-2 border-black rounded-lg aspect-square p-2 text-[6px] font-bold">Post 6<br />Comments</div>
            </div>

            {/* Floating Pop-up Modal in center (Sonny style!) */}
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 bg-white border-4 border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center space-y-3 z-20">
              <div className="flex justify-center mb-1">
                <AgentAvatar id={employee.id} className="w-12 h-12" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">Active Campaign Manager</span>
              <h4 className="font-black text-sm uppercase leading-none">Your AI Content Generator</h4>
              <p className="text-[10px] text-gray-500 font-bold leading-normal">
                &ldquo;I draft threads, Reels scripts, and ad layouts on autopilot to grow your user metrics.&rdquo;
              </p>
              <div className="bg-green-100 text-green-800 text-[8px] font-black px-2 py-1 rounded-md border border-green-300 inline-block uppercase">
                🚀 CTR Growth +240%
              </div>
            </div>
          </div>
        );

      case 'mkt-3': // Gordon (SEO Blog Writer)
        return (
          <div className="w-full max-w-lg mx-auto bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black text-left font-sans">
            <div className="bg-gray-100 border-b-4 border-black px-4 py-2 flex items-center justify-between">
              <div className="text-[10px] font-black uppercase text-gray-400">Google SEO Rank Monitor</div>
              <span className="bg-yellow-400 text-black text-[8px] font-black px-2 py-0.5 rounded border border-black">SERP #1</span>
            </div>
            <div className="p-4 space-y-3 bg-[#EEF2F6]">
              <div className="bg-white border-2 border-black p-3 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
                <div>
                  <h6 className="text-[11px] font-black text-blue-600 underline">google.com/search?q=best+ai+employees</h6>
                  <p className="text-[9px] text-gray-500 font-bold mt-1">&quot;Hire verified digital recruits instantly on Pixorva...&quot;</p>
                </div>
                <span className="bg-yellow-400 text-black text-[10px] font-black p-1.5 rounded-full border-2 border-black">🏆 #1</span>
              </div>
              <div className="bg-white border-2 border-black p-3 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
                <div>
                  <h6 className="text-[11px] font-black text-blue-600 underline">google.com/search?q=grow+my+startup+organic</h6>
                  <p className="text-[9px] text-gray-500 font-bold mt-1">&quot;Top growth parameters and marketing setups...&quot;</p>
                </div>
                <span className="bg-yellow-400 text-black text-[10px] font-black p-1.5 rounded-full border-2 border-black">🏆 #1</span>
              </div>
            </div>
          </div>
        );

      case 'mkt-4': // Vic (Video Editor Script)
        return (
          <div className="w-full max-w-lg mx-auto bg-gray-900 border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white text-left font-mono">
            <div className="bg-gray-800 border-b-4 border-black px-4 py-2 flex items-center justify-between">
              <span className="text-[9px] text-gray-400 uppercase font-black font-sans">Video Hooks Timeline Editor</span>
              <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded border border-black uppercase font-sans">Active Render</span>
            </div>
            <div className="p-4 space-y-3 text-[10px]">
              <div className="flex gap-2 items-center">
                <span className="w-14 opacity-60">Hook Track:</span>
                <div className="flex-grow bg-red-600 text-white px-2.5 py-1 rounded border border-black font-black uppercase text-[9px]">&quot;Stop burning developer payroll cash 💸&quot; (0s - 3s)</div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-14 opacity-60">Body Track:</span>
                <div className="flex-grow bg-yellow-400 text-black px-2.5 py-1 rounded border border-black font-black uppercase text-[9px]">&quot;Hire Devon to write Next.js routes instantly.&quot; (3s - 12s)</div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-14 opacity-60">CTA Track:</span>
                <div className="flex-grow bg-green-600 text-white px-2.5 py-1 rounded border border-black font-black uppercase text-[9px]">&quot;Browse at pixorva.com&quot; (12s - 15s)</div>
              </div>
            </div>
          </div>
        );

      case 'sal-2': // Sarah (Cold SDR Outreach)
        return (
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
        );

      case 'sal-1': // Larry (Leads B2B Miner)
      case 'Sales':
        // Stan-style floating leads map layout
        return (
          <div className="w-full max-w-lg mx-auto bg-yellow-100 border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black relative min-h-[300px] p-6 flex flex-col justify-center items-center">
            {/* Center Avatar */}
            <div className="z-10 bg-white p-2 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
              <AgentAvatar id={employee.id} className="w-14 h-14 rounded-full" />
            </div>

            {/* Floating lead bubbles (Stan style!) */}
            <div className="absolute top-4 left-4 bg-white border-2 border-black px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-[-2deg]">
              💼 SaaS Founders <span className="bg-yellow-400 text-black px-1 rounded ml-1">240k</span>
            </div>
            <div className="absolute top-6 right-4 bg-white border-2 border-black px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-[1deg]">
              🦷 Dental Clinics <span className="bg-yellow-400 text-black px-1 rounded ml-1">9.2k</span>
            </div>
            <div className="absolute bottom-16 left-3 bg-white border-2 border-black px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-[3deg]">
              🔧 HVAC Techs <span className="bg-yellow-400 text-black px-1 rounded ml-1">5.3k</span>
            </div>
            <div className="absolute bottom-6 right-3 bg-white border-2 border-black px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wide shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-[-1deg]">
              ⚖️ Law Firms <span className="bg-yellow-400 text-black px-1 rounded ml-1">1.2k</span>
            </div>

            {/* Subtitle outreach booker */}
            <div className="mt-4 bg-white border-2 border-black px-4 py-2 rounded-xl text-[10px] font-bold text-center max-w-[240px]">
              <span className="text-blue-600 font-black">✓ Email sequences ready</span>
              <p className="text-[9px] text-gray-500 font-medium mt-0.5">Customized pitches book appointments directly to your calendar.</p>
            </div>
          </div>
        );

      case 'ops-2': // Holly (HR Specialist)
        return (
          <div className="w-full max-w-lg mx-auto bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black text-left">
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
        );

      case 'ops-1': // Finn (EBITDA Optimizer)
        return (
          <div className="w-full max-w-lg mx-auto bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black text-left font-mono">
            <div className="bg-gray-100 border-b-4 border-black px-4 py-3 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-gray-400">Finn cost savings calculator</span>
              <span className="bg-green-100 text-green-800 text-[8px] font-black px-2 py-0.5 rounded border border-green-300 uppercase">EBITDA ACTIVE</span>
            </div>
            <div className="p-5 space-y-2 text-xs">
              <div className="flex justify-between border-b border-gray-200 pb-1 text-black">
                <span className="font-bold">Total Monthly Revenue:</span>
                <span className="text-right text-green-600 font-black">₹1,49,000</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1 text-black">
                <span className="font-bold">Optimized Expense:</span>
                <span className="text-right text-red-600 font-black">-₹42,000</span>
              </div>
              <div className="flex justify-between pt-2 text-black">
                <span className="font-black text-sm uppercase">Calculated Savings:</span>
                <span className="text-right text-green-600 text-sm font-black">+18% EBITDA</span>
              </div>
            </div>
          </div>
        );

      case 'ops-3': // Lawson (Legal Boilerplates)
        return (
          <div className="w-full max-w-lg mx-auto bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black text-left">
            <div className="bg-amber-50 border-b-4 border-black px-4 py-3 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">NDA CLAUSES PARSER</span>
            </div>
            <div className="p-5 space-y-3 text-xs leading-normal">
              <h5 className="font-black text-sm uppercase border-b border-gray-200 pb-1">Mutual NDA Charter</h5>
              <p className="text-[10px] text-gray-600 font-bold">
                1. Confidentiality parameters: Standard Commercial Protection<br />
                2. Governed under Pixorva console guidelines.<br />
                3. SLA Verification: Standard compliance checklist active.
              </p>
            </div>
          </div>
        );

      case 'ops-4': // Pat (Agile PM Planner)
        return (
          <div className="w-full max-w-lg mx-auto bg-[#F4F4F5] border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black text-left p-4">
            <span className="text-[8px] font-black uppercase tracking-wider text-gray-400 block mb-3">PAT SCRUM KANBAN SPRINT</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="border-2 border-black bg-white p-3 rounded-xl">
                <span className="bg-yellow-400 text-black text-[7px] font-black uppercase px-2 py-0.5 rounded border border-black">TO DO</span>
                <h5 className="text-[10px] font-black uppercase mt-2">Design UI templates</h5>
                <p className="text-[8px] text-gray-500 font-bold mt-1">Sprint Priority: High</p>
              </div>
              <div className="border-2 border-black bg-white p-3 rounded-xl">
                <span className="bg-green-600 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded border border-black">DONE</span>
                <h5 className="text-[10px] font-black uppercase mt-2">Setup migrations</h5>
                <p className="text-[8px] text-gray-500 font-bold mt-1">Completed by Ruby</p>
              </div>
            </div>
          </div>
        );

      case 'ops-5': // Sam (Customer Tickets)
        return (
          <div className="w-full max-w-lg mx-auto bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black text-left font-sans">
            <div className="bg-violet-50 border-b-4 border-black px-4 py-3 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-violet-700 bg-violet-100 px-2 py-0.5 rounded border border-rose-300">SAM HELP DESK CHATS</span>
            </div>
            <div className="p-5 space-y-3 text-xs leading-normal">
              <div className="bg-gray-100 border border-black p-2.5 rounded-xl max-w-[80%]">
                <span className="font-black text-gray-400 text-[8px] block mb-1">Customer (10:14)</span>
                <p className="text-[10px] font-bold">How do I upgrade to the Growth Plan?</p>
              </div>
              <div className="bg-violet-100 border border-black p-2.5 rounded-xl max-w-[80%] ml-auto text-right">
                <span className="font-black text-violet-600 text-[8px] block mb-1">Sam AI (10:14)</span>
                <p className="text-[10px] font-bold">You can proceed through the Billing panel or click the Pricing tab...</p>
              </div>
            </div>
          </div>
        );

      default:
        // Eva-style Executive Assistant Planner checklist layout
        return (
          <div className="w-full max-w-lg mx-auto bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black text-left">
            {/* Header */}
            <div className="bg-rose-50 border-b-4 border-black px-4 py-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-black"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500 border border-black"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 border border-black"></div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                LIVE TASK TICKETS
              </span>
            </div>

            {/* Task list list */}
            <div className="p-5 space-y-4">
              <div className="border-2 border-black p-3 rounded-xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded border-2 border-black bg-yellow-400 flex items-center justify-center text-xs font-black">✓</span>
                  <div>
                    <h5 className="text-[11px] font-black uppercase">Mutual Corporate NDA</h5>
                    <p className="text-[8px] text-gray-500 font-bold">Auto-drafted and verified legal compliance</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-[8px] font-black px-2 py-0.5 rounded border border-green-300 uppercase">Passed</span>
              </div>

              <div className="border-2 border-black p-3 rounded-xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded border-2 border-black bg-yellow-400 flex items-center justify-center text-xs font-black">✓</span>
                  <div>
                    <h5 className="text-[11px] font-black uppercase">Q3 Finance Ledger</h5>
                    <p className="text-[8px] text-gray-500 font-bold">Optimized payroll EBITDA parameters</p>
                  </div>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-[8px] font-black px-2 py-0.5 rounded border border-yellow-300 uppercase">Set</span>
              </div>
            </div>
          </div>
        );
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
            Pixorva
          </span>
        </div>
        <Link href="/employees" className="text-xs font-black uppercase border-2 border-black px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5">
          Marketplace
        </Link>
      </header>

      {/* HERO SECTION - DYNAMIC NEOBRUTALIST BANNER */}
      <section 
        className="border-b-4 border-black px-6 py-12 md:py-20 relative overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: dynamic.heroBgColor, color: dynamic.heroTextColor }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_black_1.5px,_transparent_1.5px)] bg-[length:15px_15px]"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left Text */}
          <div className="text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-black border-2 border-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transform -rotate-1 text-white">
              <Sparkles size={12} className="text-yellow-400" />
              Meet {employee.name}
            </div>

            <h1 className={`text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tight ${oswald.className}`} style={{ color: dynamic.heroTextColor }}>
              YOUR AI <br />
              <span className="text-black bg-yellow-400 px-3 py-1 inline-block border-4 border-black transform rotate-1 mt-2">
                {employee.role}
              </span>
            </h1>

            <p className="text-lg md:text-xl font-medium leading-relaxed max-w-xl" style={{ color: dynamic.heroTextColor === '#000000' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)' }}>
              &ldquo;{dynamic.tagline}&rdquo;
            </p>

            {/* Price Box */}
            <div className="bg-black/25 border-2 border-white p-4 rounded-2xl max-w-sm flex justify-between items-center text-white">
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
                <span className="text-[10px] font-bold leading-tight" style={{ color: dynamic.heroTextColor === '#000000' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)' }}>
                  I agree to Pixorva&apos;s <Link href="/terms" className="underline" style={{ color: dynamic.heroTextColor === '#000000' ? '#1D4ED8' : '#FBBF24' }}>Terms of Service</Link> & <Link href="/privacy" className="underline" style={{ color: dynamic.heroTextColor === '#000000' ? '#1D4ED8' : '#FBBF24' }}>Privacy Policy</Link> to commission this AI employee.
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

          {renderMockup(employee.id)}

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
          <div className="flex justify-center mb-4">
            <AgentAvatar id={employee.id} className="w-24 h-24 rounded-full" />
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
